/* Houtkaart — Status toggles, UI helpers, tabel rendering, CSV export.
 *
 * State variabelen (favorites, markedOrange, markedRed, etc.) staan in sync.js
 * omdat die als eerste laadt en ze ook schrijft vanuit localStorage/Sheets.
 */

/* ════════════════════════════════════════════════════
 *  Status checks
 * ════════════════════════════════════════════════════ */

function isFavorite(naam) { return favorites.has(naam); }
function isOrange(naam)   { return markedOrange.has(naam); }
function isRed(naam)      { return markedRed.has(naam); }

/* ════════════════════════════════════════════════════
 *  Company post data helper
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

/* ════════════════════════════════════════════════════
 *  Status toggles
 * ════════════════════════════════════════════════════ */

function toggleFavorite(company) {
  const naam = company.naam;
  const removing = favorites.has(naam);
  removing ? favorites.delete(naam) : favorites.add(naam);
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

function updateStatusButtons(naam) {
  document.querySelectorAll(`.star-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isFavorite(naam);
    btn.classList.toggle("starred", on);
    btn.innerHTML = on ? "★" : "☆";
    btn.title = on ? "Verwijder uit favorieten" : "Voeg toe aan favorieten";
  });
  document.querySelectorAll(`.orange-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isOrange(naam);
    btn.classList.toggle("marked-orange", on);
    btn.title = on ? "Verwijder twijfel" : "Twijfelgeval";
  });
  document.querySelectorAll(`.red-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const on = isRed(naam);
    btn.classList.toggle("marked-red", on);
    btn.title = on ? "Verwijder niet-interessant" : "Niet interessant";
  });
}

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
  return `
    <td class="td-status">${buildStatusHtml(c.naam)}</td>
    <td class="td-naam">${escHtml(c.naam)}${c.bron === "bizzy" ? ' <span class="bizzy-badge">B</span>' : ""}</td>
    <td>${t ? escHtml(t.activiteit) : escHtml(actLabel(c))}</td>
    <td class="td-num">${c.cw_brutomarge ? fmtK(c.cw_brutomarge) : (t && t.brutomarge ? fmtK(t.brutomarge) : "—")}</td>
    <td class="td-num top15-ebitda">${t ? escHtml(t.est_ebitda) : "—"}</td>
    <td class="td-num">${c.cw_fte != null ? c.cw_fte : (t ? t.fte : "—")}</td>
    <td>${t ? escHtml(t.opgericht || "—") : (c.oprichting ? escHtml(c.oprichting) : "—")}</td>
    <td class="td-adres">${adresLinkHtml(c)}</td>
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
    tr.innerHTML = _statusRow(c, t, orangeNotes, orangeNotesVincent, "fav-note");
    tbody.appendChild(tr);
  });

  _attachStatusHandlers(tbody);
  tbody.querySelectorAll(".fav-note").forEach(ta => {
    ta.addEventListener("input", () => saveStatusNote(ta.dataset.naam, ta.value, ta.dataset.who || "jeremy", "orange"));
  });
}

/* ════════════════════════════════════════════════════
 *  Event handlers (gedeeld)
 * ════════════════════════════════════════════════════ */

function _attachStatusHandlers(container) {
  container.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) { toggleFavorite(c); refreshMarkerIcon(c.naam); renderFavorieten(); renderTwijfel(); }
    });
  });
  container.querySelectorAll(".orange-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) { toggleOrange(c); refreshMarkerIcon(c.naam); renderFavorieten(); renderTwijfel(); }
    });
  });
  container.querySelectorAll(".red-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) { toggleRed(c); refreshMarkerIcon(c.naam); renderFavorieten(); renderTwijfel(); }
    });
  });
}

function _attachAllHandlers(container) {
  _attachStatusHandlers(container);
  attachNoteHandlers(container);
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
