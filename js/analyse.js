/* Houtkaart — Analyse tab */

let analyseSortKey    = "dichtste";
let analyseSortAsc    = true;
let analyseActiveActs   = new Set();
let analyseActiveRegios = new Set();

/* ───── Top 15 Overnamekandidaten ───── */
function renderTop15() {
  const el = document.getElementById("top15-section");
  if (!el || !top15.length) return;

  let html = `
    <div class="top15-header">
      <h2>🏆 Top 25 Overnamekandidaten</h2>
      <p class="top15-subtitle">Rangschikking op basis van: EBITDA 150K–750K, omzet &lt;8M, groene zone, hoge marge, lage digitalisering, behapbaar voor 2 personen</p>
    </div>
    <div class="top15-table-wrap">
      <table class="analyse-table top15-table">
        <thead>
          <tr>
            <th>#</th><th>★</th><th>Naam</th><th>Activiteit</th>
            <th>Brutomarge</th><th>Est. EBITDA</th><th>FTE</th><th>Opgericht</th>
            <th>Adres</th><th>BTW</th><th>Website</th>
            <th>🚗 H</th><th>🚗 D</th>
            <th>Digitaal</th><th>Beoordeling</th><th>Notes Jeremy</th><th>Notes Vincent</th>
          </tr>
        </thead>
        <tbody>`;

  top15.forEach(c => {
    const btwLink  = c.btw ? btwLinkHtml({ btw: c.btw }) : "";
    const webUrl   = c.website ? (c.website.startsWith("http") ? c.website : "https://" + c.website) : "";
    const webLink  = c.website ? `<a href="${escHtml(webUrl)}" target="_blank" rel="noopener">${escHtml(c.website)}</a>` : "";
    const margeStr = c.brutomarge ? fmtK(c.brutomarge) : "—";

    const bedrijf   = bedrijven.find(b => b.naam === c.naam || b.naam.startsWith(c.naam));
    const starClass = bedrijf && isFavorite(bedrijf.naam) ? "starred" : "";
    const starChar  = bedrijf && isFavorite(bedrijf.naam) ? "★" : "☆";
    const dataNaam  = escHtml(bedrijf ? bedrijf.naam : c.naam);

    html += `
      <tr class="top15-row">
        <td class="top15-rang">${c.rang}</td>
        <td class="td-star"><button class="star-btn ${starClass}" data-naam="${dataNaam}">${starChar}</button></td>
        <td class="top15-naam">${escHtml(c.naam)}</td>
        <td>${escHtml(c.activiteit)}</td>
        <td class="td-num">${margeStr}</td>
        <td class="td-num top15-ebitda">${escHtml(c.est_ebitda)}</td>
        <td class="td-num">${c.fte}</td>
        <td>${escHtml(c.opgericht || "—")}</td>
        <td class="td-adres">${escHtml(c.adres)}</td>
        <td class="td-btw">${btwLink}</td>
        <td class="td-web">${webLink}</td>
        <td class="td-num">${bedrijf && bedrijf.rijtijd_hertsberge != null ? bedrijf.rijtijd_hertsberge + "'" : "—"}</td>
        <td class="td-num">${bedrijf && bedrijf.rijtijd_drongen != null ? bedrijf.rijtijd_drongen + "'" : "—"}</td>
        <td class="top15-digitaal">${escHtml(c.digitaal)}</td>
        <td class="top15-notitie">${escHtml(c.notitie)}</td>
        <td class="td-notes"><textarea class="fav-note top15-note" data-naam="${dataNaam}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(favNotes[bedrijf ? bedrijf.naam : c.naam] || "")}</textarea></td>
        <td class="td-notes"><textarea class="fav-note top15-note" data-naam="${dataNaam}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(favNotesVincent[bedrijf ? bedrijf.naam : c.naam] || "")}</textarea></td>
      </tr>`;
  });

  html += `</tbody></table></div>`;
  el.innerHTML = html;

  attachStarHandlers(el);
  attachNoteHandlers(el);
}

/* ───── Checkboxen ───── */
function buildAnalyseCheckboxes(container, items, activeSet, defaultIds) {
  const allOn = !defaultIds;
  items.forEach(c => {
    const on    = allOn || defaultIds.has(c.id);
    const label = document.createElement("label");
    label.className = "analyse-act-label" + (on ? " checked" : "");
    label.style.borderColor = c.kleur;
    label.style.color = c.kleur;
    const cb  = document.createElement("input");
    cb.type   = "checkbox";
    cb.value  = c.id;
    cb.checked = on;
    cb.addEventListener("change", () => {
      cb.checked ? activeSet.add(c.id) : activeSet.delete(c.id);
      label.classList.toggle("checked", cb.checked);
      renderAnalyse();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + c.label));
    container.appendChild(label);
    if (on) activeSet.add(c.id);
  });
}

function initAnalyse() {
  buildAnalyseCheckboxes(
    document.getElementById("analyse-regio-checks"),
    categorieen.filter(c => c.type === "regio"),
    analyseActiveRegios,
    new Set(DEFAULT_REGIOS)
  );

  buildAnalyseCheckboxes(
    document.getElementById("analyse-activiteit-checks"),
    categorieen.filter(c => c.type === "activiteit"),
    analyseActiveActs
  );

  document.getElementById("analyse-groene-zone").checked = true;
  document.getElementById("analyse-btw-only").checked    = true;

  document.querySelectorAll(".analyse-filters select, .analyse-filters > label input").forEach(el =>
    el.addEventListener("change", renderAnalyse)
  );

  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      if (analyseSortKey === th.dataset.sort) analyseSortAsc = !analyseSortAsc;
      else { analyseSortKey = th.dataset.sort; analyseSortAsc = true; }
      renderAnalyse();
    });
  });

  document.getElementById("analyse-export").addEventListener("click", exportAnalyseCSV);
}

/* ───── Filter ───── */
function getAnalyseFiltered() {
  const grootte   = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly   = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (analyseActiveRegios.size > 0 && !analyseActiveRegios.has(c.provincie)) return false;
    if (analyseActiveActs.size > 0 && !(c.activiteiten || []).some(a => analyseActiveActs.has(a))) return false;
    if (grootte && c.grootte !== grootte) return false;
    if (groeneZone && !inGroeneZone(c)) return false;
    if (btwOnly && !c.btw) return false;
    return true;
  });
}

/* ───── Hoofdrender ───── */
function renderAnalyse() {
  const data = getAnalyseFiltered();

  data.sort((a, b) => {
    let va = getSortValue(a, analyseSortKey);
    let vb = getSortValue(b, analyseSortKey);
    if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return analyseSortAsc ? -1 : 1;
    if (va > vb) return analyseSortAsc ? 1 : -1;
    return 0;
  });

  // Sorteer-indicator
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    const base = th.textContent.replace(/ [▴▾]$/, "");
    th.textContent = th.dataset.sort === analyseSortKey ? base + (analyseSortAsc ? " ▴" : " ▾") : base;
  });

  renderTop15();
  renderStats(data);
  renderOpportuniteiten(data);

  const tbody = document.getElementById("analyse-tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = buildTableRow(c, {});
    tbody.appendChild(tr);
  });

  attachStarHandlers(tbody);
}

function getSortValue(c, key) {
  if (key === "favoriet") return isFavorite(c.naam) ? 0 : 1;
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] != null ? c[key] : 999;
  if (key === "dichtste") {
    const gem = gemRijtijd(c);
    return gem != null ? gem : 999;
  }
  if (key === "cw_omzet" || key === "cw_brutomarge" || key === "cw_winst" || key === "cw_fte")
    return c[key] != null ? c[key] : -999999999;
  return c[key] || "";
}

/* ───── Statistieken ───── */
function renderStats(data) {
  const actCounts = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actCounts[a] = (actCounts[a] || 0) + 1; }));
  const regioCounts = {};
  data.forEach(c => { const l = provLabel(c); regioCounts[l] = (regioCounts[l] || 0) + 1; });
  const sizeCounts = { Groot: 0, Middelgroot: 0, Klein: 0, Micro: 0 };
  data.forEach(c => { sizeCounts[c.grootte] = (sizeCounts[c.grootte] || 0) + 1; });

  document.getElementById("analyse-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${data.length}</div><div class="stat-label">Bedrijven</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => inGroeneZone(c)).length}</div><div class="stat-label">In groene zone</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.btw).length}</div><div class="stat-label">Met BTW-nr</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.website).length}</div><div class="stat-label">Met website</div></div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per grootte</div>
      <div class="stat-bar-group">
        ${[["Groot", "Groot"], ["Middelgroot", "Middelgroot"], ["Klein", "Klein"], ["Micro", "Micro"]].map(([l, k]) =>
          `<div class="stat-bar-row"><span class="stat-bar-label">${l}</span><div class="stat-bar"><div class="stat-bar-fill ${k}" style="width:${data.length ? (sizeCounts[k] / data.length * 100) : 0}%"></div></div><span class="stat-bar-num">${sizeCounts[k]}</span></div>`
        ).join("")}
      </div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per activiteit</div>
      <div class="stat-chips">${Object.entries(actCounts).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
        const cat = categorieen.find(c => c.id === id);
        return `<span class="stat-chip" style="border-color:${cat ? cat.kleur : '#888'};color:${cat ? cat.kleur : '#888'}">${cat ? escHtml(cat.label) : id} <b>${n}</b></span>`;
      }).join("")}</div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per regio</div>
      <div class="stat-chips">${Object.entries(regioCounts).sort((a, b) => b[1] - a[1]).map(([l, n]) =>
        `<span class="stat-chip">${escHtml(l)} <b>${n}</b></span>`
      ).join("")}</div>
    </div>
  `;
}

/* ───── Opportuniteiten ───── */
function renderOpportuniteiten(data) {
  const el = document.getElementById("analyse-opps");
  if (!el) return;

  const actFiltered = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actFiltered[a] = (actFiltered[a] || 0) + 1; }));
  const actTotal = {};
  bedrijven.forEach(c => (c.activiteiten || []).forEach(a => { actTotal[a] = (actTotal[a] || 0) + 1; }));

  const witteVlekken = Object.entries(actFiltered).filter(([, n]) => n <= 3).sort((a, b) => a[1] - b[1]);

  el.innerHTML = `
    <div class="opp-section">
      <h3>📊 Marktverzadiging</h3>
      <p class="opp-desc">Aantal spelers per activiteit (gefilterd vs. totaal)</p>
      <div class="opp-saturation">
        ${Object.entries(actFiltered).map(([id, n]) => {
          const total = actTotal[id] || 0;
          const pct = total ? Math.round(n / total * 100) : 0;
          return [id, n, total, pct];
        }).sort((a, b) => b[3] - a[3]).map(([id, n, total, pct]) => {
          const cat = categorieen.find(c => c.id === id);
          return `<div class="sat-row">
            <span class="sat-label" style="color:${cat ? cat.kleur : '#888'}">${cat ? escHtml(cat.label) : id}</span>
            <div class="sat-bar"><div class="sat-fill" style="width:${pct}%;background:${cat ? cat.kleur : '#888'}"></div></div>
            <span class="sat-nums">${n} / ${total} (${pct}%)</span>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${witteVlekken.length ? `
    <div class="opp-section">
      <h3>🔍 Witte vlekken</h3>
      <p class="opp-desc">Activiteiten met ≤ 3 spelers binnen huidige filters — ruimte voor groei</p>
      <div class="opp-list">
        ${witteVlekken.map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          return `<div class="opp-item"><span class="opp-name" style="color:${cat ? cat.kleur : '#888'}">${cat ? escHtml(cat.label) : id}</span><span class="opp-detail">Slechts ${n} speler${n > 1 ? "s" : ""} in de zone</span></div>`;
        }).join("")}
      </div>
    </div>` : ""}
  `;
}

/* ───── CSV Export ───── */
function exportAnalyseCSV() {
  const data = getAnalyseFiltered();
  const csv  = buildCSV(data);
  downloadCSV(csv, "houtkaart_analyse.csv");
}
