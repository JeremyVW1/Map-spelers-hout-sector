/* Houtkaart — Favorieten, Twijfel, Niet-interessant & Google Sheets sync
 *
 * Architectuur:
 *   Google Sheets = enige bron van waarheid (Blad1 + Top25 + Twijfel + NietInteressant)
 *   localStorage  = offline fallback
 *   Auto-sync     = elke 30s notes ophalen → live updates van andere gebruikers
 *   Debounce      = Sheet POST 1s na laatste toetsaanslag
 */

const SHEET_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";
const SYNC_INTERVAL = 30000;

let favorites       = new Set();
let favNotes        = {};
let favNotesVincent = {};

let markedOrange       = new Set();
let orangeNotes        = {};
let orangeNotesVincent = {};

let markedRed          = new Set();
let redNotes           = {};
let redNotesVincent    = {};

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
    _parseBlad1(blad1);
    _parseTop25(top25);

    // Reset oranje/rood — Sheet is bron van waarheid, niet localStorage
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

  // Update zichtbare textareas (skip als gebruiker aan het typen is)
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
  // Legacy class support
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

/* ════════════════════════════════════════════════════
 *  Status toggles
 * ════════════════════════════════════════════════════ */

function _companyPostData(company) {
  return {
    naam: company.naam,
    regio: provLabel(company),
    activiteiten: actLabel(company),
    grootte: GROOTTE_LONG[company.grootte] || "",
    adres: company.adres || "",
    btw: company.btw || "",
    website: company.website || "",
    rijtijd_hertsberge: company.rijtijd_hertsberge != null ? company.rijtijd_hertsberge : "",
    rijtijd_drongen: company.rijtijd_drongen != null ? company.rijtijd_drongen : "",
  };
}

function toggleFavorite(company) {
  const naam = company.naam;
  const removing = favorites.has(naam);
  removing ? favorites.delete(naam) : favorites.add(naam);
  // Exclusief: verwijder andere statussen
  if (!removing) {
    if (markedOrange.has(naam)) { markedOrange.delete(naam); _post({ action: "remove_twijfel", naam }); }
    if (markedRed.has(naam))    { markedRed.delete(naam);    _post({ action: "remove_red", naam }); }
  }
  _saveLocal();
  updateStatusButtons(naam);
  updateFavCount();
  updateOrangeCount();

  _post({
    action: removing ? "remove" : "add",
    ..._companyPostData(company),
    notes: favNotes[naam] || "",
    notes_vincent: favNotesVincent[naam] || "",
  });
}

function toggleOrange(company) {
  const naam = company.naam;
  const removing = markedOrange.has(naam);
  removing ? markedOrange.delete(naam) : markedOrange.add(naam);
  // Exclusief: verwijder andere statussen
  if (!removing) {
    if (favorites.has(naam)) { favorites.delete(naam); _post({ action: "remove", naam }); }
    if (markedRed.has(naam)) { markedRed.delete(naam); _post({ action: "remove_red", naam }); }
  }
  _saveLocal();
  updateStatusButtons(naam);
  updateFavCount();
  updateOrangeCount();

  _post({
    action: removing ? "remove_twijfel" : "add_twijfel",
    ..._companyPostData(company),
    notes_jeremy: orangeNotes[naam] || "",
    notes_vincent: orangeNotesVincent[naam] || "",
  });
}

function toggleRed(company) {
  const naam = company.naam;
  const removing = markedRed.has(naam);
  removing ? markedRed.delete(naam) : markedRed.add(naam);
  // Exclusief: verwijder andere statussen
  if (!removing) {
    if (favorites.has(naam))    { favorites.delete(naam);    _post({ action: "remove", naam }); }
    if (markedOrange.has(naam)) { markedOrange.delete(naam); _post({ action: "remove_twijfel", naam }); }
  }
  _saveLocal();
  updateStatusButtons(naam);
  updateFavCount();
  updateOrangeCount();

  _post({
    action: removing ? "remove_red" : "add_red",
    ..._companyPostData(company),
    notes_jeremy: redNotes[naam] || "",
    notes_vincent: redNotesVincent[naam] || "",
  });
}

/* ════════════════════════════════════════════════════
 *  UI helpers
 * ════════════════════════════════════════════════════ */

function isFavorite(naam) { return favorites.has(naam); }
function isOrange(naam)   { return markedOrange.has(naam); }
function isRed(naam)      { return markedRed.has(naam); }

function updateStatusButtons(naam) {
  // Ster
  document.querySelectorAll(`.star-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isFavorite(naam);
    btn.classList.toggle("starred", on);
    btn.innerHTML = on ? "★" : "☆";
    btn.title = on ? "Verwijder uit favorieten" : "Voeg toe aan favorieten";
  });
  // Oranje
  document.querySelectorAll(`.orange-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isOrange(naam);
    btn.classList.toggle("marked-orange", on);
    btn.title = on ? "Verwijder twijfel" : "Twijfelgeval";
  });
  // Rood
  document.querySelectorAll(`.red-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isRed(naam);
    btn.classList.toggle("marked-red", on);
    btn.title = on ? "Verwijder niet-interessant" : "Niet interessant";
  });
}

// Legacy alias
function updateStarButtons(naam) { updateStatusButtons(naam); }

function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (el) el.textContent = favorites.size;
}

function updateOrangeCount() {
  const el = document.getElementById("orange-count");
  if (el) el.textContent = markedOrange.size;
}

/* ════════════════════════════════════════════════════
 *  Favorieten tabel
 * ════════════════════════════════════════════════════ */

function _top25Match(c) {
  return top15.find(t => t.naam === c.naam || c.naam.startsWith(t.naam));
}

function _statusRow(c, t, notesJ, notesV, statusClass) {
  const isFav = isFavorite(c.naam);
  const isOr  = isOrange(c.naam);
  const isRd  = isRed(c.naam);
  const hasStatus = isFav || isOr || isRd;

  let statusHtml = "";
  if (!hasStatus) {
    statusHtml = `
      <button class="star-btn" data-naam="${escHtml(c.naam)}" title="Favoriet">☆</button>
      <button class="orange-btn" data-naam="${escHtml(c.naam)}" title="Twijfel">●</button>
      <button class="red-btn" data-naam="${escHtml(c.naam)}" title="Niet interessant">●</button>`;
  } else if (isFav) {
    statusHtml = `<button class="star-btn starred" data-naam="${escHtml(c.naam)}" title="Verwijder uit favorieten">★</button>`;
  } else if (isOr) {
    statusHtml = `<button class="orange-btn marked-orange" data-naam="${escHtml(c.naam)}" title="Verwijder twijfel">●</button>`;
  } else if (isRd) {
    statusHtml = `<button class="red-btn marked-red" data-naam="${escHtml(c.naam)}" title="Verwijder niet-interessant">●</button>`;
  }

  return `
    <td class="td-status">${statusHtml}</td>
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
    <td class="td-notes"><textarea class="${statusClass}" data-naam="${escHtml(c.naam)}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(notesJ[c.naam] || "")}</textarea></td>
    <td class="td-notes"><textarea class="${statusClass}" data-naam="${escHtml(c.naam)}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(notesV[c.naam] || "")}</textarea></td>
  `;
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
    tr.innerHTML = _statusRow(c, t, favNotes, favNotesVincent, "fav-note");
    tbody.appendChild(tr);
  });

  _attachAllHandlers(tbody);
}

/* ════════════════════════════════════════════════════
 *  Twijfel (oranje) tabel
 * ════════════════════════════════════════════════════ */

function renderTwijfel() {
  const tbody = document.getElementById("twijfel-tbody");
  const empty = document.getElementById("twijfel-empty");
  const table = document.getElementById("twijfel-table");
  if (!tbody) return;

  const data = bedrijven.filter(c => isOrange(c.naam));
  empty.style.display = data.length ? "none" : "block";
  table.style.display = data.length ? ""     : "none";

  tbody.innerHTML = "";
  data.forEach(c => {
    const t = _top25Match(c);
    const tr = document.createElement("tr");
    tr.innerHTML = _statusRow(c, t, orangeNotes, orangeNotesVincent, "status-note");
    // Tag textareas with status
    tr.querySelectorAll(".status-note").forEach(ta => ta.dataset.status = "orange");
    tbody.appendChild(tr);
  });

  _attachAllHandlers(tbody);
  // Attach status note handlers
  tbody.querySelectorAll(".status-note").forEach(ta => {
    ta.addEventListener("input", () => saveStatusNote(ta.dataset.naam, ta.value, ta.dataset.who || "jeremy", "orange"));
  });
}

/* ════════════════════════════════════════════════════
 *  Event handlers (gedeeld)
 * ════════════════════════════════════════════════════ */

function _attachAllHandlers(container) {
  attachStarHandlers(container);
  attachNoteHandlers(container);
  container.querySelectorAll(".orange-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijven.find(b => b.naam === btn.dataset.naam);
      if (c) toggleOrange(c);
    });
  });
  container.querySelectorAll(".red-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijven.find(b => b.naam === btn.dataset.naam);
      if (c) toggleRed(c);
    });
  });
}

/* ════════════════════════════════════════════════════
 *  CSV Export
 * ════════════════════════════════════════════════════ */

function _exportWithNotes(filterFn, notesJ, notesV, filename) {
  const data = bedrijven.filter(filterFn);
  if (!data.length) return;
  const csv = buildCSV(data, ["Notes Jeremy", "Notes Vincent"]);
  const lines = csv.split("\n");
  const rows = lines.map((line, i) => {
    if (i === 0) return line;
    const c = data[i - 1];
    const nJ = String(notesJ[c.naam] || "").replace(/"/g, '""');
    const nV = String(notesV[c.naam] || "").replace(/"/g, '""');
    return line + `,"${nJ}","${nV}"`;
  });
  downloadCSV(rows.join("\n"), filename);
}

function exportFavCSV() {
  _exportWithNotes(c => isFavorite(c.naam), favNotes, favNotesVincent, "houtkaart_favorieten.csv");
}

function exportTwijfelCSV() {
  _exportWithNotes(c => isOrange(c.naam), orangeNotes, orangeNotesVincent, "houtkaart_twijfel.csv");
}
