/* Houtkaart — Favorieten (sterretjes) → Google Sheets sync */

const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyWtnahLygglfAqkJoygx2yJwV9ZkfENq2zJqX9ZWYBHvtWnWhyNwfrVATTS-NMlDZa/exec";

let favorites = new Set(); // Set van bedrijfsnamen

async function loadFavorites() {
  // Altijd localStorage laden als basis
  const stored = localStorage.getItem("houtkaart_favs");
  if (stored) favorites = new Set(JSON.parse(stored));

  // Als Sheets script geconfigureerd is, ook daar van laden
  if (SHEET_SCRIPT_URL) {
    try {
      const res = await fetch(SHEET_SCRIPT_URL);
      const data = await res.json();
      favorites = new Set(data.map(r => r.naam));
      localStorage.setItem("houtkaart_favs", JSON.stringify([...favorites]));
    } catch (e) { /* localStorage fallback is al geladen */ }
  }

  updateFavCount();
}

async function toggleFavorite(company) {
  const naam = company.naam;
  const wasActive = favorites.has(naam);

  if (wasActive) {
    favorites.delete(naam);
  } else {
    favorites.add(naam);
  }

  // Update localStorage
  localStorage.setItem("houtkaart_favs", JSON.stringify([...favorites]));

  // Sync naar Google Sheets
  if (SHEET_SCRIPT_URL) {
    try {
      await fetch(SHEET_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: wasActive ? "remove" : "add",
          naam: company.naam,
          provincie: PROV_LABELS[company.provincie] || company.provincie,
          activiteiten: (company.activiteiten || []).map(a => categorieen.find(x => x.id === a)?.label || a).join(", "),
          grootte: { G: "Groot", M: "Middelgroot", K: "Klein" }[company.grootte] || "",
          adres: company.adres || "",
          btw: company.btw || "",
          website: company.website || "",
          rijtijd_hertsberge: company.rijtijd_hertsberge != null ? company.rijtijd_hertsberge : "",
          rijtijd_drongen: company.rijtijd_drongen != null ? company.rijtijd_drongen : "",
        }),
      });
    } catch (e) { /* no-cors geeft altijd opaque response */ }
  }

  // Update UI
  updateStarButtons(naam);
  updateFavCount();
  renderFavorieten();
  renderAnalyse();
  render(); // Update goud randje op kaart
}

function isFavorite(naam) {
  return favorites.has(naam);
}

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

// Favorieten tab renderen
function renderFavorieten() {
  const tbody = document.getElementById("fav-tbody");
  const emptyMsg = document.getElementById("fav-empty");
  const table = document.getElementById("fav-table");
  if (!tbody) return;

  const favData = bedrijven.filter(c => isFavorite(c.naam));

  emptyMsg.style.display = favData.length === 0 ? "block" : "none";
  table.style.display = favData.length === 0 ? "none" : "";

  tbody.innerHTML = "";
  favData.forEach(c => {
    const tr = document.createElement("tr");
    const acts = (c.activiteiten || []).map(a => categorieen.find(cat => cat.id === a)?.label || a).join(", ");
    const provLabel = PROV_LABELS[c.provincie] || c.provincie;
    const sizeLabel = { G: "Groot", M: "Midden", K: "Klein" }[c.grootte] || "";
    const webLink = c.website ? `<a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener">${c.website}</a>` : "";
    const btwLink = c.btw ? `<a href="https://www.companyweb.be/nl/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${c.btw}</a>` : "";

    const rH = c.rijtijd_hertsberge;
    const rD = c.rijtijd_drongen;
    let scoreText = "", scoreClass = "";
    if (rH != null && rD != null) {
      const gem = Math.round((rH + rD) / 2);
      scoreText = `⌀ ${gem}'`;
      if (gem <= 30) scoreClass = "score-top";
      else if (gem <= 45) scoreClass = "score-good";
      else if (gem <= 60) scoreClass = "score-ok";
    }

    tr.innerHTML = `
      <td class="td-star"><button class="star-btn starred" data-naam="${c.naam.replace(/"/g, "&quot;")}">★</button></td>
      <td class="td-naam">${c.naam}</td>
      <td>${provLabel}</td>
      <td>${acts}</td>
      <td><span class="size-badge ${c.grootte}">${sizeLabel}</span></td>
      <td class="td-adres">${c.adres || ""}</td>
      <td class="td-btw">${btwLink}</td>
      <td class="td-web">${webLink}</td>
      <td class="td-num">${rH != null ? rH + "'" : ""}</td>
      <td class="td-num">${rD != null ? rD + "'" : ""}</td>
      <td class="td-num td-dichtste ${scoreClass}">${scoreText}</td>
    `;
    tbody.appendChild(tr);
  });

  // Star click handlers
  tbody.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = bedrijven.find(b => b.naam === btn.dataset.naam);
      if (c) toggleFavorite(c);
    });
  });
}

// Favorieten CSV export
function exportFavCSV() {
  const data = bedrijven.filter(c => isFavorite(c.naam));
  if (data.length === 0) return;
  const header = ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Rijtijd Hertsberge", "Rijtijd Drongen", "Gem. rijtijd H+D"];
  const rows = data.map(c => [
    c.naam,
    PROV_LABELS[c.provincie] || c.provincie,
    (c.activiteiten || []).join("; "),
    { G: "Groot", M: "Middelgroot", K: "Klein" }[c.grootte] || "",
    c.adres || "", c.btw || "", c.website || "",
    c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge : "",
    c.rijtijd_drongen != null ? c.rijtijd_drongen : "",
    (c.rijtijd_hertsberge != null && c.rijtijd_drongen != null) ? Math.round((c.rijtijd_hertsberge + c.rijtijd_drongen) / 2) : "",
  ]);
  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "houtkaart_favorieten.csv";
  a.click();
  URL.revokeObjectURL(url);
}
