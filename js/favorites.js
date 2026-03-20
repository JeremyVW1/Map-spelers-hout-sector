/* Houtkaart — Favorieten (sterretjes) + Google Sheets sync */

const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";

let favorites = new Set();
let favNotes  = {};
let favNotesVincent = {};

function loadNotes() {
  try { favNotes = JSON.parse(localStorage.getItem("houtkaart_notes") || "{}"); } catch { favNotes = {}; }
  try { favNotesVincent = JSON.parse(localStorage.getItem("houtkaart_notes_vincent") || "{}"); } catch { favNotesVincent = {}; }
}

function saveNote(naam, text, who) {
  if (who === "vincent") {
    favNotesVincent[naam] = text;
    localStorage.setItem("houtkaart_notes_vincent", JSON.stringify(favNotesVincent));
  } else {
    favNotes[naam] = text;
    localStorage.setItem("houtkaart_notes", JSON.stringify(favNotes));
  }
  if (SHEET_SCRIPT_URL) {
    fetch(SHEET_SCRIPT_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_note", naam, notes: favNotes[naam] || "", notes_vincent: favNotesVincent[naam] || "" }),
    }).catch(() => {});
  }
}

async function loadFavorites() {
  const stored = localStorage.getItem("houtkaart_favs");
  if (stored) favorites = new Set(JSON.parse(stored));
  loadNotes();

  if (SHEET_SCRIPT_URL) {
    try {
      const res  = await fetch(SHEET_SCRIPT_URL);
      const data = await res.json();

      // Alleen overschrijven als Sheet data bevat (voorkom wissen bij lege response)
      if (data.length > 0) {
        favorites = new Set(data.map(r => r.naam));
        localStorage.setItem("houtkaart_favs", JSON.stringify([...favorites]));

        // Sync notes terug vanuit Google Sheets
        let notesChanged = false;
        data.forEach(r => {
          const sheetNote  = r.notes || r[""] || "";
          const sheetNoteV = r.notes_vincent || "";
          if (sheetNote && !favNotes[r.naam])        { favNotes[r.naam] = sheetNote; notesChanged = true; }
          if (sheetNoteV && !favNotesVincent[r.naam]) { favNotesVincent[r.naam] = sheetNoteV; notesChanged = true; }
        });
        if (notesChanged) {
          localStorage.setItem("houtkaart_notes", JSON.stringify(favNotes));
          localStorage.setItem("houtkaart_notes_vincent", JSON.stringify(favNotesVincent));
        }
      }
    } catch { /* localStorage fallback is al geladen */ }
  }
  updateFavCount();
}

function toggleFavorite(company) {
  const naam     = company.naam;
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
        naam: company.naam,
        provincie: provLabel(company),
        activiteiten: actLabel(company),
        grootte: GROOTTE_LONG[company.grootte] || "",
        adres: company.adres || "",
        btw: company.btw || "",
        website: company.website || "",
        rijtijd_hertsberge: company.rijtijd_hertsberge != null ? company.rijtijd_hertsberge : "",
        rijtijd_drongen: company.rijtijd_drongen != null ? company.rijtijd_drongen : "",
        notes: favNotes[company.naam] || "",
        notes_vincent: favNotesVincent[company.naam] || "",
      }),
    }).catch(() => {});
  }
}

function isFavorite(naam)  { return favorites.has(naam); }

function updateStarButtons(naam) {
  document.querySelectorAll(`.star-btn[data-naam="${CSS.escape(naam)}"]`).forEach(btn => {
    const active = isFavorite(naam);
    btn.classList.toggle("starred", active);
    btn.innerHTML = active ? "★" : "☆";
    btn.title     = active ? "Verwijder uit favorieten" : "Voeg toe aan favorieten";
  });
}

function updateFavCount() {
  const el = document.getElementById("fav-count");
  if (el) el.textContent = favorites.size;
}

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
    // Zoek top15-data voor extra velden (digitaal, notitie, est_ebitda, opgericht)
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
