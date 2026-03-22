"""
Build Top 50 acquisition candidates ranking.
Keeps existing top25 intact, adds 25 new candidates scored on:
  EBITDA sweet spot, revenue, margin/FTE, digitalization, size, driving time.
"""

import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
BEDRIJVEN_PATH = os.path.join(BASE, "data", "bedrijven.json")
TOP15_PATH = os.path.join(BASE, "data", "top15.json")


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# Scoring helpers
# ---------------------------------------------------------------------------

def get_ebitda(c):
    """Return estimated EBITDA or None."""
    if c.get("bizzy_ebitda") and c["bizzy_ebitda"] > 0:
        return c["bizzy_ebitda"]
    if c.get("cw_winst") and c["cw_winst"] > 0:
        return c["cw_winst"]
    return None


def get_fte(c):
    """Return FTE count."""
    if c.get("cw_fte") and c["cw_fte"] > 0:
        return c["cw_fte"]
    if c.get("medewerkers"):
        v = c["medewerkers"]
        if isinstance(v, (int, float)) and v > 0:
            return v
    return None


def get_brutomarge(c):
    if c.get("cw_brutomarge") and c["cw_brutomarge"] > 0:
        return c["cw_brutomarge"]
    return None


def get_omzet(c):
    if c.get("cw_omzet") and c["cw_omzet"] > 0:
        return c["cw_omzet"]
    return None


def score_ebitda(ebitda):
    """30% weight. Perfect if 150K-750K, linearly declining outside."""
    if ebitda is None:
        return 0.3  # neutral, not penalised heavily
    if 150_000 <= ebitda <= 750_000:
        return 1.0
    if ebitda < 150_000:
        # linear from 0 at 0 to 1.0 at 150K
        return max(0, ebitda / 150_000)
    # > 750K: linear decline from 1.0 at 750K to 0.3 at 1.5M
    return max(0.3, 1.0 - (ebitda - 750_000) / 750_000 * 0.7)


def score_revenue(c):
    """15% weight. Revenue < 8M preferred."""
    omzet = get_omzet(c)
    if omzet is None:
        return 0.7  # neutral
    if omzet <= 5_000_000:
        return 1.0
    if omzet <= 8_000_000:
        return 0.8
    if omzet <= 15_000_000:
        return 0.4
    return 0.1


def score_margin_per_fte(c):
    """20% weight. Higher brutomarge/FTE = better."""
    bruto = get_brutomarge(c)
    fte = get_fte(c)
    if bruto is None or fte is None or fte < 0.5:
        return 0.4  # neutral
    marge_fte = bruto / fte
    # Scale: 50K = 0.3, 100K = 0.6, 150K = 0.8, 200K+ = 1.0
    if marge_fte >= 200_000:
        return 1.0
    if marge_fte >= 150_000:
        return 0.8
    if marge_fte >= 100_000:
        return 0.6
    if marge_fte >= 50_000:
        return 0.3 + (marge_fte - 50_000) / 50_000 * 0.3
    return 0.2


def score_digital(c):
    """15% weight. No webshop = full points."""
    ws = c.get("webshop")
    if ws == "Ja":
        return 0.0
    return 1.0


def score_size(c):
    """10% weight."""
    g = c.get("grootte", "")
    if g == "Klein":
        return 1.0
    if g == "Middelgroot":
        return 1.0
    if g == "Micro":
        return 0.7
    if g == "Groot":
        return 0.5
    return 0.5


def score_rijtijd(c):
    """10% weight. Closer = better. Max 70 min."""
    h = c.get("rijtijd_hertsberge", 70)
    d = c.get("rijtijd_drongen", 70)
    avg = (h + d) / 2
    # 10 min = 1.0, 70 min = 0.0
    return max(0, min(1.0, (70 - avg) / 60))


def total_score(c):
    ebitda = get_ebitda(c)
    s = (
        0.30 * score_ebitda(ebitda)
        + 0.15 * score_revenue(c)
        + 0.20 * score_margin_per_fte(c)
        + 0.15 * score_digital(c)
        + 0.10 * score_size(c)
        + 0.10 * score_rijtijd(c)
    )
    return s


# ---------------------------------------------------------------------------
# Notitie generator
# ---------------------------------------------------------------------------

def fmt_eur(val):
    if val is None:
        return "?"
    if val >= 1_000_000:
        return f"€{val/1_000_000:.1f}M"
    return f"€{val/1_000:.0f}K"


def make_est_ebitda(c):
    ebitda = get_ebitda(c)
    if ebitda is None:
        return "onbekend"
    return f"~{fmt_eur(ebitda)}"


def make_notitie(c, score):
    parts = []
    ebitda = get_ebitda(c)
    bruto = get_brutomarge(c)
    fte = get_fte(c)

    if ebitda:
        parts.append(f"EBITDA {fmt_eur(ebitda)}")
    if bruto:
        parts.append(f"brutomarge {fmt_eur(bruto)}")
    if fte:
        parts.append(f"{fte} FTE")
        if bruto:
            parts.append(f"marge/FTE {fmt_eur(bruto/fte)}")

    h = c.get("rijtijd_hertsberge")
    d = c.get("rijtijd_drongen")
    if h and d:
        parts.append(f"rijtijd {h}/{d} min")

    opr = c.get("oprichting") or c.get("groep_oprichting")
    if opr:
        parts.append(f"opgericht {opr}")

    g = c.get("grootte", "")
    if g:
        parts.append(g.lower())

    # Check if it would rank higher than existing
    if score > 0.75:
        parts.append("sterke kandidaat")

    return ". ".join(parts) + "."


def make_digitaal(c):
    ws = c.get("webshop")
    w = c.get("website") or c.get("groep_website")
    if ws == "Ja":
        return "Webshop aanwezig"
    if w:
        return "Basis website, geen webshop"
    return "Geen website gevonden"


def make_activiteit(c):
    info = c.get("info", "")
    acts = c.get("activiteiten", [])
    if info and len(info) < 80:
        return info
    if acts:
        act_map = {
            "houthandel": "Houthandel",
            "terrassen": "terrassen",
            "dhz": "DHZ",
            "parket": "parket",
            "schrijnwerk": "schrijnwerk",
            "tuinhout": "tuinhout",
            "gevelbekleding": "gevelbekleding",
            "bouwmaterialen": "bouwmaterialen",
            "afsluitingen": "afsluitingen",
            "houtbouw": "houtbouw",
            "tuinhuizen": "tuinhuizen",
        }
        mapped = [act_map.get(a, a) for a in acts[:4]]
        return ", ".join(mapped).capitalize()
    if info:
        return info[:75]
    return "Hout gerelateerd bedrijf"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    bedrijven = load_json(BEDRIJVEN_PATH)
    all_existing = load_json(TOP15_PATH)
    # Only keep original entries (rang 1-25)
    existing = [e for e in all_existing if e.get("rang", 99) <= 25]

    # Collect existing BTW numbers (normalise: strip spaces)
    existing_btw = set()
    for e in existing:
        btw = e.get("btw", "").replace(" ", "").replace(".", "")
        existing_btw.add(btw)

    # Also collect existing names for backup matching
    existing_names = set()
    for e in existing:
        existing_names.add(e["naam"].lower().strip())

    # Filter groene zone
    groene = []
    for c in bedrijven:
        h = c.get("rijtijd_hertsberge")
        d = c.get("rijtijd_drongen")
        if h is None or d is None:
            continue
        if h > 70 or d > 70:
            continue

        # Skip existing
        btw = (c.get("btw") or "").replace(" ", "").replace(".", "")
        if btw in existing_btw and btw:
            continue

        # Skip if name matches existing
        if c["naam"].lower().strip() in existing_names:
            continue

        # Skip very large companies (group revenue > 20M is too big)
        omzet = get_omzet(c)
        if omzet and omzet > 20_000_000:
            continue

        # Need at least some financial data to score meaningfully
        has_data = (get_ebitda(c) is not None) or (get_brutomarge(c) is not None)
        if not has_data:
            continue

        groene.append(c)

    # Score and sort
    scored = [(total_score(c), c) for c in groene]
    scored.sort(key=lambda x: -x[0])

    # Deduplicate by BTW number — keep the highest-scoring entry per BTW
    seen_btw = set()
    deduped = []
    for score, c in scored:
        btw = (c.get("btw") or "").replace(" ", "").replace(".", "")
        if btw and btw in seen_btw:
            continue
        if btw:
            seen_btw.add(btw)
        deduped.append((score, c))

    # Build new entries for rang 26-50
    new_entries = []
    for i, (score, c) in enumerate(deduped[:25]):
        fte = get_fte(c)
        entry = {
            "rang": 26 + i,
            "naam": c["naam"],
            "adres": c.get("adres", ""),
            "btw": c.get("btw", ""),
            "website": c.get("website") or c.get("groep_website"),
            "opgericht": c.get("oprichting") or c.get("groep_oprichting"),
            "fte": fte,
            "brutomarge": get_brutomarge(c),
            "est_ebitda": make_est_ebitda(c),
            "activiteit": make_activiteit(c),
            "grootte": c.get("grootte", ""),
            "digitaal": make_digitaal(c),
            "notitie": make_notitie(c, score),
        }
        new_entries.append(entry)

    # Combine
    result = existing + new_entries
    save_json(TOP15_PATH, result)

    print(f"Groene zone met financiele data: {len(groene)} bedrijven")
    print(f"Top 25 bestaand behouden (rang 1-25)")
    print(f"25 nieuwe kandidaten toegevoegd (rang 26-50)")
    print(f"Totaal: {len(result)} entries opgeslagen in {TOP15_PATH}")
    print()
    print("Nieuwe top 25 (rang 26-50):")
    print("-" * 80)
    for e in new_entries:
        print(f"  {e['rang']:2d}. {e['naam']:<45s} EBITDA: {e['est_ebitda']:<12s} Score: {scored[e['rang']-26][0]:.3f}")


if __name__ == "__main__":
    main()
