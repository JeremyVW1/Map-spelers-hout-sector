/* Houtkaart — Favorieten, Notes & Google Sheets sync
 *
 * Architectuur:
 *   Google Sheets = enige bron van waarheid (Blad1 + Top25 tab)
 *   localStorage  = offline fallback
 *   Auto-sync     = elke 30s notes ophalen → live updates van andere gebruikers
 *   Debounce      = Sheet POST 1s na laatste toetsaanslag
 */

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";
const SYNC_INTERVAL = 30000;

let favorites       = new Set();
let favNotes        = {};
let favNotesVincent = {};

let _syncTimer     = null;
const _saveTimers  = {};

/* ════════════════════════════════════════════════════
 *  localStorage (offline fallback)
 * ════════════════════════════════════════════════════ */

function _loadLocal() {
  try { favorites = new Set(JSON.parse(localStorage.getItem("hk_favs") || "[]")); } catch { favorites = new Set(); }
  try { favNotes = JSON.parse(localStorage.getItem("hk_notes") || "{}"); } catch { favNotes = {}; }
  try { favNotesVincent = JSON.parse(localStorage.getItem("hk_notes_v") || "{}"); } catch { favNotesVincent = {}; }
}

function _saveLocal() {
  localStorage.setItem("hk_favs", JSON.stringify([...favorites]));
  localStorage.setItem("hk_notes", JSON.stringify(favNotes));
  localStorage.setItem("hk_notes_v", JSON.stringify(favNotesVincent));
}

/* ════════════════════════════════════════════════════
 *  Google Sheets POST (text/plain vermijdt CORS preflight)
 * ════════════════════════════════════════════════════ */

function _post(data) {
  if (!SHEET_URL) return;
  fetch(SHEET_URL, {
    method: "POST", mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  }).catch(() => {});
}

/* ════════════════════════════════════════════════════
 *  Sheet → geheugen: gedeelde parse-logica
 * ════════════════════════════════════════════════════ */

function _getName(r) { return r.Naam || r.naam || ""; }

function _parseBlad1(data) {
  if (!data.length) return;
  favorites = new Set(data.map(_getName));
  favNotes = {};
  favNotesVincent = {};
  data.forEach(r => {
    const naam = _getName(r);
    const nJ = r.notes || r[""] || "";
    const nV = r.notes_vincent || "";
    if (nJ) favNotes[naam] = nJ;
    if (nV) favNotesVincent[naam] = nV;
  });
}

function _parseTop25(data) {
  if (!data.length) return;
  data.forEach(r => {
    const naam = r.Naam || r.naam || "";
    const nJ = r["Notes Jeremy"] || "";
    const nV = r["Notes Vincent"] || "";
    const b = bedrijven.find(x => x.naam === naam || x.naam.startsWith(naam));
    const key = b ? b.naam : naam;
    if (nJ && !favNotes[key]) favNotes[key] = nJ;
    if (nV && !favNotesVincent[key]) favNotesVincent[key] = nV;
  });
}

/* ════════════════════════════════════════════════════
 *  Laden (init) + Auto-sync
 * ════════════════════════════════════════════════════ */

async function _fetchSheetData() {
  if (!SHEET_URL) return false;
  try {
    const [res1, res2] = await Promise.all([
      fetch(SHEET_URL),
      fetch(SHEET_URL + "?tab=top25"),
    ]);
    const blad1 = await res1.json();
    const top25 = await res2.json();
    _parseBlad1(blad1);
    _parseTop25(top25);
    return true;
  } catch (e) {
    console.warn("Sheet sync mislukt:", e);
    return false;
  }
}

async function loadFavorites() {
  _loadLocal();
  await _fetchSheetData();
  _saveLocal();
  updateFavCount();
}

async function _autoSync() {
  const prevFavSize = favorites.size;
  await _fetchSheetData();
  _saveLocal();

  if (favorites.size !== prevFavSize) updateFavCount();

  // Update zichtbare textareas (skip als gebruiker aan het typen is)
  document.querySelectorAll(".fav-note").forEach(ta => {
    if (document.activeElement === ta) return;
    const who = ta.dataset.who || "jeremy";
    const val = who === "vincent"
      ? (favNotesVincent[ta.dataset.naam] || "")
      : (favNotes[ta.dataset.naam] || "");
    if (ta.value !== val) ta.value = val;
  });
}

function startAutoSync() {
  if (_syncTimer) clearInterval(_syncTimer);
  _syncTimer = setInterval(_autoSync, SYNC_INTERVAL);
}

function stopAutoSync() {
  if (_syncTimer) { clearInterval(_syncTimer); _syncTimer = null; }
}

/* ════════════════════════════════════════════════════
 *  Note opslaan
 * ════════════════════════════════════════════════════ */

function _isInTop25(naam) {
  return top15.some(t => {
    const b = bedrijven.find(x => x.naam === t.naam || x.naam.startsWith(t.naam));
    return (b && b.naam === naam) || t.naam === naam;
  });
}

function saveNote(naam, text, who) {
  // 1. Direct lokaal
  (who === "vincent" ? favNotesVincent : favNotes)[naam] = text;
  _saveLocal();

  // 2. Sync textareas met dezelfde naam (Top25 ↔ Favorieten)
  document.querySelectorAll(`.fav-note[data-naam="${CSS.escape(naam)}"][data-who="${who}"]`).forEach(ta => {
    if (ta.value !== text) ta.value = text;
  });

  // 3. Debounce Sheet POST (1s na laatste toetsaanslag)
  const key = naam + "_" + who;
  clearTimeout(_saveTimers[key]);
  _saveTimers[key] = setTimeout(() => {
    const nJ = favNotes[naam] || "";
    const nV = favNotesVincent[naam] || "";
    if (favorites.has(naam)) _post({ action: "update_note", naam, notes: nJ, notes_vincent: nV });
    if (_isInTop25(naam))    _post({ action: "update_top25_note", naam, notes_jeremy: nJ, notes_vincent: nV });
  }, 1000);
}

/* ════════════════════════════════════════════════════
 *  Favoriet toggle
 * ════════════════════════════════════════════════════ */

function toggleFavorite(company) {
  const naam = company.naam;
  const removing = favorites.has(naam);

  removing ? favorites.delete(naam) : favorites.add(naam);
  _saveLocal();
  updateStarButtons(naam);
  updateFavCount();

  _post({
    action: removing ? "remove" : "add",
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
  });
}

/* ════════════════════════════════════════════════════
 *  UI helpers
 * ════════════════════════════════════════════════════ */

function isFavorite(naam) { return favorites.has(naam); }

function updateStarButtons(naam) {
  document.querySelectorAll(`.star-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isFavorite(naam);
    btn.classList.toggle("starred", on);
    btn.innerHTML = on ? "★" : "☆";
    btn.title = on ? "Verwijder uit favorieten" : "Voeg toe aan favorieten";
  });
}

function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (el) el.textContent = favorites.size;
}

/* ════════════════════════════════════════════════════
 *  Favorieten tabel (zelfde kolommen als Top 25)
 * ════════════════════════════════════════════════════ */

function _top25Match(c) {
  return top15.find(t => t.naam === c.naam || c.naam.startsWith(t.naam));
}

function renderFavorieten() {
  const tbody = document.getElementById("fav-tbody");
  const empty = document.getElementById("fav-empty");
  const table = document.getElementById("fav-table");
  if (!tbody) return;

  const data = bedrijven.filter(c => isFavorite(c.naam));
  empty.style.display = data.length ? "none" : "block";
  table.style.display = data.length ? ""     : "none";

  tbody.innerHTML = "";
  data.forEach(c => {
    const t = _top25Match(c);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-star"><button class="star-btn ${isFavorite(c.naam) ? "starred" : ""}" data-naam="${escHtml(c.naam)}">${isFavorite(c.naam) ? "★" : "☆"}</button></td>
      <td class="td-naam">${escHtml(c.naam)}</td>
      <td>${t ? escHtml(t.activiteit) : escHtml(actLabel(c))}</td>
      <td class="td-num">${c.cw_brutomarge ? fmtK(c.cw_brutomarge) : (t && t.brutomarge ? fmtK(t.brutomarge) : "—")}</td>
      <td class="td-num top15-ebitda">${t ? escHtml(t.est_ebitda) : "—"}</td>
      <td class="td-num">${c.cw_fte != null ? c.cw_fte : (t ? t.fte : "—")}</td>
      <td>${t ? escHtml(t.opgericht || "—") : (c.oprichting ? escHtml(c.oprichting) : "—")}</td>
      <td class="td-adres">${escHtml(c.adres || "")}</td>
      <td class="td-btw">${btwLinkHtml(c)}</td>
      <td class="td-web">${webLinkHtml(c)}</td>
      <td class="td-num">${c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge + "'" : "—"}</td>
      <td class="td-num">${c.rijtijd_drongen != null ? c.rijtijd_drongen + "'" : "—"}</td>
      <td class="top15-digitaal">${t ? escHtml(t.digitaal) : "—"}</td>
      <td class="top15-notitie">${t ? escHtml(t.notitie) : "—"}</td>
      <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(favNotes[c.naam] || "")}</textarea></td>
      <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(favNotesVincent[c.naam] || "")}</textarea></td>
    `;
    tbody.appendChild(tr);
  });

  attachStarHandlers(tbody);
  attachNoteHandlers(tbody);
}

/* ════════════════════════════════════════════════════
 *  CSV Export
 * ════════════════════════════════════════════════════ */

function exportFavCSV() {
  const data = bedrijven.filter(c => isFavorite(c.naam));
  if (!data.length) return;

  const csv = buildCSV(data, ["Notes Jeremy", "Notes Vincent"]);
  const lines = csv.split("\n");
  const rows = lines.map((line, i) => {
    if (i === 0) return line;
    const c = data[i - 1];
    const nJ = String(favNotes[c.naam] || "").replace(/"/g, '""');
    const nV = String(favNotesVincent[c.naam] || "").replace(/"/g, '""');
    return line + `,"${nJ}","${nV}"`;
  });
  downloadCSV(rows.join("\n"), "houtkaart_favorieten.csv");
}
