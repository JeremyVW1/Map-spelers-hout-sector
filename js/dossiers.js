/* Houtkaart — Dossiers tab */

let dossiers = [];

/* Bouw een set van alle weer te geven dossiers:
   1. Echte dossiers uit dossiers.json
   2. Favorieten die nog géén dossier hebben → auto-generated vanuit bedrijven.json */
function _allDossiers() {
  const dossierNamen = new Set(dossiers.map(d => d.naam));
  const merged = [...dossiers];

  // Voeg favorieten toe die nog geen dossier hebben
  for (const naam of favorites) {
    if (dossierNamen.has(naam)) continue;
    const c = bedrijvenMap.get(naam);
    if (!c) continue;

    const gem = (c.rijtijd_hertsberge && c.rijtijd_drongen)
      ? Math.round((c.rijtijd_hertsberge + c.rijtijd_drongen) / 2) : null;
    const inGroen = c.rijtijd_hertsberge <= 70 && c.rijtijd_drongen <= 70;

    const fin = [];
    if (c.cw_brutomarge || c.cw_winst) {
      fin.push({
        jaar: c.cw_jaar || null,
        brutomarge: c.cw_brutomarge || null,
        winst: c.cw_winst || null,
        ev: null,
        fte: c.cw_fte || c.bizzy_fte || null
      });
    }

    merged.push({
      naam: naam,
      categorie: "favoriet",
      score: 0,
      verdict: "Favoriet — nog geen diepgaande analyse",
      samenvatting: c.info || "",
      btw: c.btw || "",
      adres: c.adres || "",
      website: (c.website || "").replace(/^https?:\/\//, ""),
      provincie: c.provincie || "",
      groene_zone: inGroen,
      rijtijd_gem: gem,
      opgericht: "",
      eigenaar: "",
      opvolging: "",
      financieel: fin,
      sterktes: [],
      zwaktes: [],
      model: "",
      producten: (c.activiteiten || []).join(", "),
      _auto: true
    });
  }
  return merged;
}

function initDossiers() {
  const searchEl = document.getElementById("dossier-search");
  const catFilter = document.getElementById("dossier-cat-filter");
  if (searchEl) searchEl.addEventListener("input", renderDossiers);
  if (catFilter) catFilter.addEventListener("change", renderDossiers);
}

function renderDossiers() {
  const tbody = document.getElementById("dossier-tbody");
  const detail = document.getElementById("dossier-detail");
  if (!tbody) return;

  const q = (document.getElementById("dossier-search")?.value || "").toLowerCase();
  const cat = document.getElementById("dossier-cat-filter")?.value || "";

  const all = _allDossiers();

  let filtered = all.filter(d => {
    if (cat && d.categorie !== cat) return false;
    if (q) {
      // Fuzzy-ish: zoek in naam, samenvatting, eigenaar, btw, producten
      const haystack = [d.naam, d.samenvatting, d.eigenaar, d.btw, d.producten, d.verdict]
        .filter(Boolean).join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Sort: echte dossiers (score>0) eerst, dan op score desc, dan naam
  filtered.sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return a.naam.localeCompare(b.naam);
  });

  const scoreLabel = s => {
    if (s >= 5) return '<span class="dos-score dos-score-5">★★★★★</span>';
    if (s >= 4) return '<span class="dos-score dos-score-4">★★★★☆</span>';
    if (s >= 3) return '<span class="dos-score dos-score-3">★★★☆☆</span>';
    if (s >= 2) return '<span class="dos-score dos-score-2">★★☆☆☆</span>';
    if (s >= 1) return '<span class="dos-score dos-score-1">★☆☆☆☆</span>';
    return '<span class="dos-score dos-score-fav">★ Favoriet</span>';
  };

  const catBadge = c => {
    if (c === "parket") return '<span class="dos-cat dos-cat-parket">Parket</span>';
    if (c === "bouwpakket") return '<span class="dos-cat dos-cat-bouwpakket">Bouwpakket</span>';
    return '<span class="dos-cat dos-cat-favoriet">Favoriet</span>';
  };

  const modelBadge = m => {
    if (!m) return "";
    if (m.toLowerCase().includes("puur b2b")) return '<span class="dos-model dos-model-b2b">Puur B2B</span>';
    if (m.toLowerCase().includes("b2b")) return '<span class="dos-model dos-model-mixed">B2B + B2C</span>';
    return '<span class="dos-model dos-model-b2c">B2C</span>';
  };

  tbody.innerHTML = filtered.map(d => {
    const fin = d.financieel && d.financieel.length ? d.financieel[0] : {};
    const bm = fin.brutomarge ? "€" + (fin.brutomarge / 1000).toFixed(0) + "K" : "—";
    const w = fin.winst != null ? (fin.winst < 0 ? "-€" + Math.abs(fin.winst / 1000).toFixed(0) + "K" : "€" + (fin.winst / 1000).toFixed(0) + "K") : "—";
    const ev = fin.ev ? "€" + (fin.ev / 1000000).toFixed(1) + "M" : "—";
    const fte = fin.fte || "—";

    return `<tr class="dos-row${d._auto ? " dos-row-fav" : ""}" data-naam="${escHtml(d.naam)}">
      <td>${scoreLabel(d.score)}</td>
      <td class="td-naam dos-naam-cell">${escHtml(d.naam)}</td>
      <td>${catBadge(d.categorie)}</td>
      <td>${modelBadge(d.model)}</td>
      <td class="num">${bm}</td>
      <td class="num">${w}</td>
      <td class="num">${ev}</td>
      <td class="num">${fte}</td>
      <td>${escHtml(d.provincie || "").toUpperCase()}</td>
      <td>${d.rijtijd_gem != null ? d.rijtijd_gem + " min" : "—"}</td>
      <td class="dos-verdict-cell">${escHtml(d.verdict || "")}</td>
    </tr>`;
  }).join("");

  // Click handler for detail view
  tbody.querySelectorAll(".dos-row").forEach(row => {
    row.addEventListener("click", () => {
      const naam = row.dataset.naam;
      const d = all.find(x => x.naam === naam);
      if (d) showDossierDetail(d);
    });
  });

  // Update count
  const countEl = document.getElementById("dossier-count");
  if (countEl) countEl.textContent = filtered.length;

  // Hide detail if open
  if (detail) detail.classList.add("hidden");
}

function showDossierDetail(d) {
  const detail = document.getElementById("dossier-detail");
  if (!detail) return;

  const scoreStars = n => n > 0 ? "★".repeat(n) + "☆".repeat(5 - n) : "★ Favoriet";

  // Financial table
  let finHtml = "";
  if (d.financieel && d.financieel.length) {
    const rows = d.financieel.map(f => {
      const fmt = v => v != null ? (v < 0 ? "-€" + Math.abs(v).toLocaleString("nl-BE") : "€" + v.toLocaleString("nl-BE")) : "—";
      return `<tr>
        <td>${f.jaar || "—"}</td>
        <td class="num">${fmt(f.brutomarge)}</td>
        <td class="num">${fmt(f.winst)}</td>
        <td class="num">${f.ev ? fmt(f.ev) : "—"}</td>
        <td class="num">${f.fte || "—"}</td>
      </tr>`;
    }).join("");
    finHtml = `<table class="dos-fin-table">
      <thead><tr><th>Jaar</th><th>Brutomarge</th><th>Winst</th><th>Eigen Vermogen</th><th>FTE</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  } else {
    finHtml = '<p class="dos-no-data">Geen financiële data beschikbaar</p>';
  }

  // Lookup company in bedrijvenMap — try full name first, then without parenthetical
  const c = bedrijvenMap.get(d.naam) || bedrijvenMap.get(d.naam.split(" (")[0]) || {};
  const addr = d.adres || c.adres || "";
  const adresLink = addr ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}" target="_blank" rel="noopener">${escHtml(addr)}</a>` : "—";
  const web = d.website || (c.website || "").replace(/^https?:\/\//, "");
  const websiteLink = web ? `<a href="https://${web.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener">${escHtml(web)}</a>` : "—";

  const listItems = arr => arr && arr.length ? arr.map(s => `<li>${escHtml(s)}</li>`).join("") : "<li>Geen data</li>";

  const opvolgingClass = (d.opvolging || "").toLowerCase().includes("hoog") || (d.opvolging || "").toLowerCase().includes("zeer")
    ? "dos-risk-high"
    : (d.opvolging || "").toLowerCase().includes("gemiddeld")
      ? "dos-risk-medium"
      : "dos-risk-low";

  // Notes from favorites (if available)
  const notesJ = favNotes[d.naam] || "";
  const notesV = favNotesVincent[d.naam] || "";
  const notesHtml = (notesJ || notesV) ? `
    <div class="dos-card dos-card-wide">
      <h3>Notities</h3>
      ${notesJ ? `<p><strong>Jeremy:</strong> ${escHtml(notesJ)}</p>` : ""}
      ${notesV ? `<p><strong>Vincent:</strong> ${escHtml(notesV)}</p>` : ""}
    </div>` : "";

  // Favorite status badge
  const favBadge = favorites.has(d.naam) ? '<span class="dos-fav-badge">★ Favoriet</span>' : "";

  // Groene zone from bedrijven data
  const rH = c.rijtijd_hertsberge || null;
  const rD = c.rijtijd_drongen || null;
  const inGroen = d.groene_zone || (rH && rD && rH <= 70 && rD <= 70);
  const gem = d.rijtijd_gem || (rH && rD ? Math.round((rH + rD) / 2) : null);

  detail.innerHTML = `
    <div class="dos-detail-header">
      <button class="dos-back-btn" id="dos-back">&larr; Terug naar overzicht</button>
      <div class="dos-detail-title">
        <h2>${escHtml(d.naam)} ${favBadge}</h2>
        <div class="dos-detail-meta">
          <span class="dos-score dos-score-${d.score || "fav"}">${scoreStars(d.score)}</span>
          <span class="dos-cat dos-cat-${d.categorie}">${d.categorie === "parket" ? "Parket" : d.categorie === "bouwpakket" ? "Bouwpakket" : "Favoriet"}</span>
          ${d.model ? `<span class="dos-model">${escHtml(d.model)}</span>` : ""}
        </div>
      </div>
    </div>

    <div class="dos-detail-verdict">${escHtml(d.verdict || "")}</div>

    <div class="dos-detail-grid">
      <div class="dos-card">
        <h3>Samenvatting</h3>
        <p>${escHtml(d.samenvatting || c.info || "Geen samenvatting beschikbaar")}</p>
      </div>

      <div class="dos-card">
        <h3>Bedrijfsgegevens</h3>
        <table class="dos-info-table">
          <tr><td>BTW</td><td>${escHtml(d.btw || c.btw || "—")}</td></tr>
          <tr><td>Adres</td><td>${adresLink}</td></tr>
          <tr><td>Website</td><td>${websiteLink}</td></tr>
          <tr><td>Provincie</td><td>${escHtml((d.provincie || c.provincie || "").toUpperCase())}</td></tr>
          <tr><td>Grootte</td><td>${escHtml(c.grootte || "—")}</td></tr>
          <tr><td>Opgericht</td><td>${escHtml(d.opgericht || "—")}</td></tr>
          <tr><td>Rijtijd H</td><td>${rH ? rH + " min" : "—"}</td></tr>
          <tr><td>Rijtijd D</td><td>${rD ? rD + " min" : "—"}</td></tr>
          <tr><td>Rijtijd gem.</td><td>${gem != null ? gem + " min" : "—"}</td></tr>
          <tr><td>Groene zone</td><td>${inGroen ? "✓ Ja" : "✗ Nee"}</td></tr>
          <tr><td>Producten</td><td>${escHtml(d.producten || (c.activiteiten || []).join(", ") || "—")}</td></tr>
        </table>
      </div>

      ${d.eigenaar || d.opvolging ? `
      <div class="dos-card">
        <h3>Eigenaar & Opvolging</h3>
        <p><strong>Eigenaar:</strong> ${escHtml(d.eigenaar || "—")}</p>
        <p class="${opvolgingClass}"><strong>Opvolging:</strong> ${escHtml(d.opvolging || "—")}</p>
      </div>` : ""}

      <div class="dos-card ${d.eigenaar || d.opvolging ? "" : "dos-card-wide"}">
        <h3>Financiële Data</h3>
        ${finHtml}
        ${c.bizzy_ebitda ? `<p style="margin-top:8px;font-size:12px;color:#666"><strong>Bizzy EBITDA:</strong> €${c.bizzy_ebitda.toLocaleString("nl-BE")} | <strong>Bizzy Omzet:</strong> €${(c.bizzy_revenue || 0).toLocaleString("nl-BE")} | <strong>Bizzy FTE:</strong> ${c.bizzy_fte || "—"}</p>` : ""}
      </div>

      ${d.sterktes && d.sterktes.length ? `
      <div class="dos-card">
        <h3>Sterktes</h3>
        <ul class="dos-list dos-list-plus">${listItems(d.sterktes)}</ul>
      </div>` : ""}

      ${d.zwaktes && d.zwaktes.length ? `
      <div class="dos-card">
        <h3>Zwaktes</h3>
        <ul class="dos-list dos-list-minus">${listItems(d.zwaktes)}</ul>
      </div>` : ""}

      ${notesHtml}
    </div>
  `;

  detail.classList.remove("hidden");

  document.getElementById("dos-back").addEventListener("click", () => {
    detail.classList.add("hidden");
  });

  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}
