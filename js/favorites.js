/* Houtkaart — Favorieten + Notes + Google Sheets sync */
/* Google Sheets = enige bron van waarheid. localStorage = offline fallback. */

const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";

let favorites = new Set();
let favNotes  = {};
let favNotesVincent = {};

/* ─── Lokale fallback ─── */
function loadNotesLocal() {
  try { favNotes = JSON.parse(localStorage.getItem("houtkaart_notes") || "{}"); } catch { favNotes = {}; }
  try { favNotesVincent = JSON.parse(localStorage.getItem("houtkaart_notes_vincent") || "{}"); } catch { favNotesVincent = {}; }
}

function saveNotesLocal() {
  localStorage.setItem("houtkaart_notes", JSON.stringify(favNotes));
  localStorage.setItem("houtkaart_notes_vincent", JSON.stringify(favNotesVincent));
}

/* ─── Note opslaan → lokaal + Blad1 + Top25 tegelijk ─── */
function saveNote(naam, text, who) {
  if (who === "vincent") {
    favNotesVincent[naam] = text;
  } else {
    favNotes[naam] = text;
  }
  saveNotesLocal();

  // Sync alle textareas met dezelfde naam (Top25 ↔ Favorieten)
  document.querySelectorAll(`.fav-note[data-naam="${CSS.escape(naam)}"][data-who="${who}"]`).forEach(ta => {
    if (ta.value !== text) ta.value = text;
  });

  if (!SHEET_SCRIPT_URL) return;

  const noteJ = favNotes[naam] || "";
  const noteV = favNotesVincent[naam] || "";

  // Sync naar Blad1 (favorieten)
  if (favorites.has(naam)) {
    fetch(SHEET_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_note", naam, notes: noteJ, notes_vincent: noteV }),
    }).catch(() => {});
  }

  // Sync naar Top25 tab
  const inTop25 = top15.some(t => {
    const b = bedrijven.find(x => x.naam === t.naam || x.naam.startsWith(t.naam));
    return (b && b.naam === naam) || t.naam === naam;
  });
  if (inTop25) {
    fetch(SHEET_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_top25_note", naam, notes_jeremy: noteJ, notes_vincent: noteV }),
    }).catch(() => {});
  }
}

/* ─── Laden: Sheets = waarheid, localStorage = fallback ─── */
async function loadFavorites() {
  // Stap 1: localStorage als snelle fallback
  const stored = localStorage.getItem("houtkaart_favs");
  if (stored) favorites = new Set(JSON.parse(stored));
  loadNotesLocal();

  if (!SHEET_SCRIPT_URL) { updateFavCount(); return; }

  // Stap 2: Laad favorieten + notes uit Blad1
  try {
    const res = await fetch(SHEET_SCRIPT_URL);
    const data = await res.json();

    if (data.length > 0) {
      const getName = r => r.Naam || r.naam || "";
      favorites = new Set(data.map(getName));
      localStorage.setItem("houtkaart_favs", JSON.stringify([...favorites]));

      favNotes = {};
      favNotesVincent = {};
      data.forEach(r => {
        const naam = getName(r);
        const nJ = r.notes || r[""] || "";
        const nV = r.notes_vincent || "";
        if (nJ) favNotes[naam] = nJ;
        if (nV) favNotesVincent[naam] = nV;
      });
    }
  } catch (e) { console.warn("Blad1 sync mislukt:", e); }

  // Stap 3: Laad Top25 notes (overschrijven/aanvullen)
  try {
    const res = await fetch(SHEET_SCRIPT_URL + "?tab=top25");
    const data = await res.json();

    if (data.length > 0) {
      data.forEach(r => {
        const naam = r.Naam || r.naam || "";
        const nJ = r["Notes Jeremy"] || "";
        const nV = r["Notes Vincent"] || "";
        // Match top25 naam naar bedrijven.json naam
        const bedrijf = bedrijven.find(b => b.naam === naam || b.naam.startsWith(naam));
        const key = bedrijf ? bedrijf.naam : naam;
        if (nJ && !favNotes[key]) favNotes[key] = nJ;
        if (nV && !favNotesVincent[key]) favNotesVincent[key] = nV;
      });
    }
  } catch (e) { console.warn("Top25 sync mislukt:", e); }

  saveNotesLocal();
  updateFavCount();
}

/* ─── Favoriet toggle → Blad1 sync ─── */
function toggleFavorite(company) {
  const naam = company.naam;
  const wasActive = favorites.has(naam);

  wasActive ? favorites.delete(naam) : favorites.add(naam);
  localStorage.setItem("houtkaart_favs", JSON.stringify([...favorites]));

  updateStarButtons(naam);
  updateFavCount();

  if (SHEET_SCRIPT_URL) {
    fetch(SHEET_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: wasActive ? "remove" : "add",
        naam,
        regio: provLabel(company),
        activiteiten: actLabel(company),
        grootte: GROOTTE_LONG[company.grootte] || "",
        adres: company.adres || "",
        btw: company.btw || "",
        website: company.website || "",
        rijtijd_hertsberge: company.rijtijd_hertsberge != null ? company.rijtijd_hertsberge : "",
        rijtijd_drongen: company.rijtijd_drongen != null ? company.rijtijd_drongen : "",
        notes: favNotes[naam] || "",
        notes_vincent: favNotesVincent[naam] || "",
      }),
    }).catch(() => {});
  }
}

function isFavorite(naam) { return favorites.has(naam); }

function updateStarButtons(naam) {
  document.querySelectorAll(`.star-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const active = isFavorite(naam);
    btn.classList.toggle("starred", active);
    btn.innerHTML = active ? "★" : "☆";
    btn.title = active ? "Verwijder uit favorieten" : "Voeg toe aan favorieten";
  });
}

function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (el) el.textContent = favorites.size;
}

/* ─── Favorieten tabel — zelfde kolommen als Top 25 ─── */
function renderFavorieten() {
  const tbody    = document.getElementById("fav-tbody");
  const emptyMsg = document.getElementById("fav-empty");
  const table    = document.getElementById("fav-table");
  if (!tbody) return;

  const favData = bedrijven.filter(c => isFavorite(c.naam));

  emptyMsg.style.display = favData.length === 0 ? "block" : "none";
  table.style.display    = favData.length === 0 ? "none"  : "";

  tbody.innerHTML = "";
  favData.forEach(c => {
    const t = top15.find(e => e.naam === c.naam || c.naam.startsWith(e.naam));

    const starClass = isFavorite(c.naam) ? "starred" : "";
    const starChar  = isFavorite(c.naam) ? "★" : "☆";
    const btwLink   = c.btw ? btwLinkHtml(c) : "";
    const webLink   = webLinkHtml(c);
    const margeStr  = c.cw_brutomarge ? fmtK(c.cw_brutomarge) : (t && t.brutomarge ? fmtK(t.brutomarge) : "—");
    const ebitda    = t ? escHtml(t.est_ebitda) : "—";
    const fte       = c.cw_fte != null ? c.cw_fte : (t ? t.fte : "—");
    const opgericht = t ? escHtml(t.opgericht || "—") : (c.oprichting ? escHtml(c.oprichting) : "—");
    const digitaal  = t ? escHtml(t.digitaal) : "—";
    const notitie   = t ? escHtml(t.notitie) : "—";
    const actText   = t ? escHtml(t.activiteit) : escHtml(actLabel(c));

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-star"><button class="star-btn ${starClass}" data-naam="${escHtml(c.naam)}">${starChar}</button></td>
      <td class="td-naam">${escHtml(c.naam)}</td>
      <td>${actText}</td>
      <td class="td-num">${margeStr}</td>
      <td class="td-num top15-ebitda">${ebitda}</td>
      <td class="td-num">${fte}</td>
      <td>${opgericht}</td>
      <td class="td-adres">${escHtml(c.adres || "")}</td>
      <td class="td-btw">${btwLink}</td>
      <td class="td-web">${webLink}</td>
      <td class="td-num">${c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge + "'" : "—"}</td>
      <td class="td-num">${c.rijtijd_drongen != null ? c.rijtijd_drongen + "'" : "—"}</td>
      <td class="top15-digitaal">${digitaal}</td>
      <td class="top15-notitie">${notitie}</td>
      <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(favNotes[c.naam] || "")}</textarea></td>
      <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(favNotesVincent[c.naam] || "")}</textarea></td>
    `;
    tbody.appendChild(tr);
  });

  attachStarHandlers(tbody);
  attachNoteHandlers(tbody);
}

/* ─── CSV Export ─── */
function exportFavCSV() {
  const data = bedrijven.filter(c => isFavorite(c.naam));
  if (data.length === 0) return;

  const csv = buildCSV(data, ["Notes Jeremy", "Notes Vincent"]);
  const lines = csv.split("\n");
  const rows  = lines.map((line, i) => {
    if (i === 0) return line;
    const c = data[i - 1];
    return line + `,"${String(favNotes[c.naam] || "").replace(/"/g, '""')}","${String(favNotesVincent[c.naam] || "").replace(/"/g, '""')}"`;
  });

  downloadCSV(rows.join("\n"), "houtkaart_favorieten.csv");
}
