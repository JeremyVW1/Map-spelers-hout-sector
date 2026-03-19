/* ═══════════════════════════════════════════
   Houtkaart — Zoekfunctionaliteit
   ═══════════════════════════════════════════ */

let searchTerm = "";
let debounceTimer = null;

function initSearch() {
  const input = document.getElementById("search");
  const clearBtn = document.getElementById("search-clear");

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    clearBtn.style.display = val ? "block" : "none";

    debounceTimer = setTimeout(() => {
      searchTerm = val.toLowerCase();
      render();
      updateCounter();

      const visible = getVisibleCompanies();
      if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 14);
        if (markers.length === 1) markers[0].openPopup();
      }
    }, 200);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    searchTerm = "";
    render();
    updateCounter();
  });
}

// ─── Groene zone check ──────────────────────
function distKmUtil(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inGroeneZone(c) {
  const h = EIGEN_LOCATIES[1].ll;
  const d = EIGEN_LOCATIES[0].ll;
  const maxKm = 40;
  return distKmUtil(c.lat, c.lng, h[0], h[1]) <= maxKm &&
         distKmUtil(c.lat, c.lng, d[0], d[1]) <= maxKm;
}

function matchesSearch(company) {
  if (!searchTerm) return true;
  const haystack = (company.naam + " " + company.info).toLowerCase();
  const words = searchTerm.split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
}

function getVisibleCompanies() {
  return bedrijven.filter((c) => {
    const isRegio = REGIO_IDS.has(c.provincie);
    const acts = c.activiteiten || [];

    // Groene zone filter (speciale regio)
    if (activeRegios.has("groene_zone") && !inGroeneZone(c)) return false;

    // Reguliere regio's (negeer "groene_zone" in de regio-set)
    const regioSet = new Set([...activeRegios].filter(r => r !== "groene_zone"));
    const passRegio = regioSet.size === 0 || (isRegio && regioSet.has(c.provincie));
    const passAct = activeActiviteiten.size === 0 || acts.some((a) => activeActiviteiten.has(a));

    if (regioSet.size > 0 && activeActiviteiten.size > 0) {
      if (!passRegio || !passAct) return false;
    } else if (regioSet.size > 0) {
      if (!isRegio || !passRegio) return false;
    } else if (activeActiviteiten.size > 0) {
      if (!passAct) return false;
    }

    return matchesSearch(c);
  });
}
