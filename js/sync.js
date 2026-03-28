/* Houtkaart — Google Sheets sync & localStorage
 *
 * Architectuur:
 *   Google Sheets = enige bron van waarheid (Blad1 + Top25 + Twijfel + NietInteressant)
 *   localStorage  = offline fallback
 *   Auto-sync     = elke 30s notes ophalen -> live updates van andere gebruikers
 *   Debounce      = Sheet POST 1s na laatste toetsaanslag
 *
 * State variabelen staan hier omdat sync.js als eerste laadt
 * en ze schrijft vanuit localStorage/Sheets.
 */

/* ─── Gedeelde state ─── */
let favorites       = new Set();
let favNotes        = {};
let favNotesVincent = {};

let markedOrange       = new Set();
let orangeNotes        = {};
let orangeNotesVincent = {};

let markedRed          = new Set();
let redNotes           = {};
let redNotesVincent    = {};

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";
const SYNC_INTERVAL = 30000;

let _syncTimer     = null;
const _saveTimers  = {};

/* ════════════════════════════════════════════════════
 *  localStorage (offline fallback)
 * ════════════════════════════════════════════════════ */

function _loadLocal() {
  try { favorites = new Set(JSON.parse(localStorage.getItem("hk_favs") || "[]")); } catch { favorites = new Set(); }
  try { favNotes = JSON.parse(localStorage.getItem("hk_notes") || "{}"); } catch { favNotes = {}; }
  try { favNotesVincent = JSON.parse(localStorage.getItem("hk_notes_v") || "{}"); } catch { favNotesVincent = {}; }

  try { markedOrange = new Set(JSON.parse(localStorage.getItem("hk_orange") || "[]")); } catch { markedOrange = new Set(); }
  try { orangeNotes = JSON.parse(localStorage.getItem("hk_orange_notes") || "{}"); } catch { orangeNotes = {}; }
  try { orangeNotesVincent = JSON.parse(localStorage.getItem("hk_orange_notes_v") || "{}"); } catch { orangeNotesVincent = {}; }

  try { markedRed = new Set(JSON.parse(localStorage.getItem("hk_red") || "[]")); } catch { markedRed = new Set(); }
  try { redNotes = JSON.parse(localStorage.getItem("hk_red_notes") || "{}"); } catch { redNotes = {}; }
  try { redNotesVincent = JSON.parse(localStorage.getItem("hk_red_notes_v") || "{}"); } catch { redNotesVincent = {}; }
}

function _saveLocal() {
  localStorage.setItem("hk_favs", JSON.stringify([...favorites]));
  localStorage.setItem("hk_notes", JSON.stringify(favNotes));
  localStorage.setItem("hk_notes_v", JSON.stringify(favNotesVincent));

  localStorage.setItem("hk_orange", JSON.stringify([...markedOrange]));
  localStorage.setItem("hk_orange_notes", JSON.stringify(orangeNotes));
  localStorage.setItem("hk_orange_notes_v", JSON.stringify(orangeNotesVincent));

  localStorage.setItem("hk_red", JSON.stringify([...markedRed]));
  localStorage.setItem("hk_red_notes", JSON.stringify(redNotes));
  localStorage.setItem("hk_red_notes_v", JSON.stringify(redNotesVincent));
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
  }).catch(err => {
    console.warn("Sheet sync mislukt:", err);
    showToast("Synchronisatie mislukt — wijzigingen staan lokaal opgeslagen.", "warning", 5000);
  });
}

/* ════════════════════════════════════════════════════
 *  Sheet -> geheugen: gedeelde parse-logica
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

function _parseStatusTab(data, targetSet, notesJ, notesV) {
  if (!data.length) return;
  targetSet.clear();
  Object.keys(notesJ).forEach(k => delete notesJ[k]);
  Object.keys(notesV).forEach(k => delete notesV[k]);
  data.forEach(r => {
    const naam = _getName(r);
    if (!naam) return;
    targetSet.add(naam);
    const nJ = r["Notes Jeremy"] || r.notes || "";
    const nV = r["Notes Vincent"] || r.notes_vincent || "";
    if (nJ) notesJ[naam] = nJ;
    if (nV) notesV[naam] = nV;
  });
}

/* ════════════════════════════════════════════════════
 *  Laden (init) + Auto-sync
 * ════════════════════════════════════════════════════ */

async function _fetchSheetData() {
  if (!SHEET_URL) return false;
  try {
    const [res1, res2, res3, res4] = await Promise.all([
      fetch(SHEET_URL),
      fetch(SHEET_URL + "?tab=top25"),
      fetch(SHEET_URL + "?tab=twijfel"),
      fetch(SHEET_URL + "?tab=nietinteressant"),
    ]);
    const blad1 = await res1.json();
    const top25 = await res2.json();
    if (!Array.isArray(blad1)) throw new Error("Onverwacht formaat van Sheets (Blad1)");
    if (!Array.isArray(top25)) throw new Error("Onverwacht formaat van Sheets (Top25)");
    _parseBlad1(blad1);
    _parseTop25(top25);

    markedOrange.clear(); orangeNotes = {}; orangeNotesVincent = {};
    markedRed.clear();    redNotes = {};    redNotesVincent = {};

    try {
      const twijfelData = await res3.json();
      if (Array.isArray(twijfelData)) _parseStatusTab(twijfelData, markedOrange, orangeNotes, orangeNotesVincent);
    } catch {}
    try {
      const redData = await res4.json();
      if (Array.isArray(redData)) _parseStatusTab(redData, markedRed, redNotes, redNotesVincent);
    } catch {}
    return true;
  } catch (e) {
    console.warn("Sheet sync mislukt:", e);
    showToast("Google Sheets niet bereikbaar — lokale data wordt gebruikt.", "warning", 4000);
    return false;
  }
}

async function loadFavorites() {
  _loadLocal();
  await _fetchSheetData();
  _saveLocal();
  updateFavCount();
  updateOrangeCount();
}

async function _autoSync() {
  const prevFavSize = favorites.size;
  const prevOrangeSize = markedOrange.size;
  await _fetchSheetData();
  _saveLocal();

  if (favorites.size !== prevFavSize) updateFavCount();
  if (markedOrange.size !== prevOrangeSize) updateOrangeCount();

  document.querySelectorAll(".status-note").forEach(ta => {
    if (document.activeElement === ta) return;
    const who = ta.dataset.who || "jeremy";
    const status = ta.dataset.status || "fav";
    const naam = ta.dataset.naam;
    let val = "";
    if (status === "orange") val = who === "vincent" ? (orangeNotesVincent[naam] || "") : (orangeNotes[naam] || "");
    else if (status === "red") val = who === "vincent" ? (redNotesVincent[naam] || "") : (redNotes[naam] || "");
    else val = who === "vincent" ? (favNotesVincent[naam] || "") : (favNotes[naam] || "");
    if (ta.value !== val) ta.value = val;
  });
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

/* ════════════════════════════════════════════════════
 *  Note opslaan (generiek voor alle statussen)
 * ════════════════════════════════════════════════════ */

function _isInTop25(naam) {
  return top15.some(t => {
    const b = bedrijven.find(x => x.naam === t.naam || x.naam.startsWith(t.naam));
    return (b && b.naam === naam) || t.naam === naam;
  });
}

function saveNote(naam, text, who) {
  (who === "vincent" ? favNotesVincent : favNotes)[naam] = text;
  _saveLocal();

  document.querySelectorAll(`.fav-note[data-naam="${CSS.escape(naam)}"][data-who="${who}"]`).forEach(ta => {
    if (ta.value !== text) ta.value = text;
  });

  const key = naam + "_fav_" + who;
  clearTimeout(_saveTimers[key]);
  _saveTimers[key] = setTimeout(() => {
    const nJ = favNotes[naam] || "";
    const nV = favNotesVincent[naam] || "";
    if (favorites.has(naam)) _post({ action: "update_note", naam, notes: nJ, notes_vincent: nV });
    if (_isInTop25(naam))    _post({ action: "update_top25_note", naam, notes_jeremy: nJ, notes_vincent: nV });
  }, 1000);
}

function saveStatusNote(naam, text, who, status) {
  const notesJ = status === "orange" ? orangeNotes : redNotes;
  const notesV = status === "orange" ? orangeNotesVincent : redNotesVincent;
  (who === "vincent" ? notesV : notesJ)[naam] = text;
  _saveLocal();

  document.querySelectorAll(`.status-note[data-naam="${CSS.escape(naam)}"][data-who="${who}"][data-status="${status}"]`).forEach(ta => {
    if (ta.value !== text) ta.value = text;
  });

  const key = naam + "_" + status + "_" + who;
  clearTimeout(_saveTimers[key]);
  _saveTimers[key] = setTimeout(() => {
    const action = status === "orange" ? "update_twijfel_note" : "update_red_note";
    _post({ action, naam, notes_jeremy: notesJ[naam] || "", notes_vincent: notesV[naam] || "" });
  }, 1000);
}
