/* Houtkaart — Analyse tab */

let analyseSortKey      = "dichtste";
let analyseSortAsc      = true;
let analyseActiveActs   = new Set();
let analyseActiveRegios = new Set();

function _top25StatusHtml(naam) {
  const isFav = isFavorite(naam);
  const isOr  = isOrange(naam);
  const isRd  = isRed(naam);
  const hasStatus = isFav || isOr || isRd;
  if (!hasStatus) {
    return `<button class="star-btn" data-naam="${escHtml(naam)}" title="Favoriet">☆</button>
      <button class="orange-btn" data-naam="${escHtml(naam)}" title="Twijfel">?</button>
      <button class="red-btn" data-naam="${escHtml(naam)}" title="Niet interessant">✕</button>`;
  } else if (isFav) {
    return `<button class="star-btn starred" data-naam="${escHtml(naam)}" title="Verwijder uit favorieten">★</button>`;
  } else if (isOr) {
    return `<button class="orange-btn marked-orange" data-naam="${escHtml(naam)}" title="Verwijder twijfel">?</button>`;
  } else if (isRd) {
    return `<button class="red-btn marked-red" data-naam="${escHtml(naam)}" title="Verwijder niet-interessant">✕</button>`;
  }
  return "";
}

/* ════════════════════════════════════════════════════
 *  Top 25 Overnamekandidaten
 * ════════════════════════════════════════════════════ */

function renderTop25() {
  const el = document.getElementById("top15-section");
  if (!el || !top15.length) return;

  let html = `
    <div class="top15-header">
      <h2>Top 50 Overnamekandidaten</h2>
      <p class="top15-subtitle">Rangschikking op basis van: EBITDA 150K–750K, omzet &lt;8M, groene zone, hoge marge, lage digitalisering, behapbaar voor 2 personen. Scroll voor meer.</p>
    </div>
    <div class="top15-table-wrap">
      <table class="analyse-table top15-table">
        <thead>
          <tr>
            <th>#</th><th>★</th><th>Naam</th><th>Bron</th><th>Activiteit</th>
            <th>Brutomarge</th><th>EBITDA</th><th>FTE</th><th>Opgericht</th>
            <th>Adres</th><th>BTW</th><th>Website</th>
            <th>🚗 H</th><th>🚗 D</th>
            <th>Digitaal</th><th>Beoordeling</th><th>Notes Jeremy</th><th>Notes Vincent</th>
          </tr>
        </thead>
        <tbody>`;

  top15.forEach(c => {
    const b = bedrijven.find(x => x.naam === c.naam || x.naam.startsWith(c.naam));
    const naam = b ? b.naam : c.naam;
    const isBizzy = b && b.bron === "bizzy";
    const ebitdaVal = b && b.bizzy_ebitda ? fmtK(b.bizzy_ebitda) : escHtml(c.est_ebitda);

    html += `
      <tr class="top15-row">
        <td class="top15-rang">${c.rang}</td>
        <td class="td-status">${_top25StatusHtml(naam)}</td>
        <td class="top15-naam">${escHtml(c.naam)}</td>
        <td>${isBizzy ? '<span class="bizzy-badge">Bizzy</span>' : ""}</td>
        <td>${escHtml(c.activiteit)}</td>
        <td class="td-num">${c.brutomarge ? fmtK(c.brutomarge) : "—"}</td>
        <td class="td-num top15-ebitda">${ebitdaVal}</td>
        <td class="td-num">${c.fte}</td>
        <td>${escHtml(c.opgericht || "—")}</td>
        <td class="td-adres">${escHtml(c.adres)}</td>
        <td class="td-btw">${c.btw ? btwLinkHtml({ btw: c.btw }) : ""}</td>
        <td class="td-web">${webLinkHtml(c)}</td>
        <td class="td-num">${b && b.rijtijd_hertsberge != null ? b.rijtijd_hertsberge + "'" : "—"}</td>
        <td class="td-num">${b && b.rijtijd_drongen != null ? b.rijtijd_drongen + "'" : "—"}</td>
        <td class="top15-digitaal">${escHtml(c.digitaal)}</td>
        <td class="top15-notitie">${escHtml(c.notitie)}</td>
        <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(naam)}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(favNotes[naam] || "")}</textarea></td>
        <td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(naam)}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(favNotesVincent[naam] || "")}</textarea></td>
      </tr>`;
  });

  html += `</tbody></table></div>`;
  el.innerHTML = html;
  _attachAnalyseHandlers(el);
  attachNoteHandlers(el);
}

/* ════════════════════════════════════════════════════
 *  Checkboxen (regio & activiteit filters)
 * ════════════════════════════════════════════════════ */

function buildAnalyseCheckboxes(container, items, activeSet, defaultIds) {
  const allOn = !defaultIds;
  items.forEach(c => {
    const on = allOn || defaultIds.has(c.id);
    const label = document.createElement("label");
    label.className = "analyse-act-label" + (on ? " checked" : "");
    label.style.borderColor = c.kleur;
    label.style.color = c.kleur;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c.id;
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
  document.getElementById("analyse-btw-only").checked = true;

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

/* ════════════════════════════════════════════════════
 *  Filter
 * ════════════════════════════════════════════════════ */

function getAnalyseFiltered() {
  const grootte    = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly    = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (analyseActiveRegios.size && !analyseActiveRegios.has(c.provincie)) return false;
    if (analyseActiveActs.size && !(c.activiteiten || []).some(a => analyseActiveActs.has(a))) return false;
    if (grootte && c.grootte !== grootte) return false;
    if (groeneZone && !inGroeneZone(c)) return false;
    if (btwOnly && !c.btw) return false;
    return true;
  });
}

/* ════════════════════════════════════════════════════
 *  Hoofdrender
 * ════════════════════════════════════════════════════ */

function renderAnalyse() {
  const data = getAnalyseFiltered();

  data.sort((a, b) => {
    let va = _sortVal(a, analyseSortKey);
    let vb = _sortVal(b, analyseSortKey);
    if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    return (va < vb ? -1 : va > vb ? 1 : 0) * (analyseSortAsc ? 1 : -1);
  });

  // Sorteer-indicator
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    const base = th.textContent.replace(/ [▴▾]$/, "");
    th.textContent = th.dataset.sort === analyseSortKey
      ? base + (analyseSortAsc ? " ▴" : " ▾")
      : base;
  });

  renderTop25();
  renderStats(data);
  renderOpportuniteiten(data);

  const tbody = document.getElementById("analyse-tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = buildTableRow(c, {});
    tbody.appendChild(tr);
  });
  _attachAnalyseHandlers(tbody);
}

function _attachAnalyseHandlers(container) {
  attachStarHandlers(container);
  container.querySelectorAll(".orange-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) { toggleOrange(c); refreshMarkerIcon(c.naam); renderAnalyse(); }
    });
  });
  container.querySelectorAll(".red-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation(); e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) { toggleRed(c); refreshMarkerIcon(c.naam); renderAnalyse(); }
    });
  });
}

function _sortVal(c, key) {
  if (key === "favoriet") return isFavorite(c.naam) ? 0 : isOrange(c.naam) ? 1 : isRed(c.naam) ? 2 : 3;
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "dichtste") return gemRijtijd(c) ?? 999;
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] ?? 999;
  if (["cw_omzet", "cw_brutomarge", "cw_winst", "cw_fte", "bizzy_ebitda", "bizzy_revenue", "bizzy_fte"].includes(key)) return c[key] ?? -999999999;
  return c[key] || "";
}

/* ════════════════════════════════════════════════════
 *  Statistieken
 * ════════════════════════════════════════════════════ */

function _countBy(data, fn) {
  const counts = {};
  data.forEach(c => fn(c).forEach(k => { counts[k] = (counts[k] || 0) + 1; }));
  return counts;
}

function renderStats(data) {
  const actCounts = _countBy(data, c => c.activiteiten || []);
  const regioCounts = {};
  data.forEach(c => { const l = provLabel(c); regioCounts[l] = (regioCounts[l] || 0) + 1; });
  const sizeCounts = { Groot: 0, Middelgroot: 0, Klein: 0, Micro: 0 };
  data.forEach(c => { sizeCounts[c.grootte] = (sizeCounts[c.grootte] || 0) + 1; });

  const sizeBar = (label, key) => {
    const pct = data.length ? (sizeCounts[key] / data.length * 100) : 0;
    return `<div class="stat-bar-row"><span class="stat-bar-label">${label}</span><div class="stat-bar"><div class="stat-bar-fill ${key}" style="width:${pct}%"></div></div><span class="stat-bar-num">${sizeCounts[key]}</span></div>`;
  };

  document.getElementById("analyse-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${data.length}</div><div class="stat-label">Bedrijven</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => inGroeneZone(c)).length}</div><div class="stat-label">In groene zone</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.btw).length}</div><div class="stat-label">Met BTW-nr</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.website).length}</div><div class="stat-label">Met website</div></div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per grootte</div>
      <div class="stat-bar-group">
        ${sizeBar("Groot", "Groot")}${sizeBar("Middelgroot", "Middelgroot")}${sizeBar("Klein", "Klein")}${sizeBar("Micro", "Micro")}
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

/* ════════════════════════════════════════════════════
 *  Opportuniteiten + Marktverzadiging
 * ════════════════════════════════════════════════════ */

function renderOpportuniteiten(data) {
  const el = document.getElementById("analyse-opps");
  if (!el) return;

  const actFiltered = _countBy(data, c => c.activiteiten || []);
  const actTotal = _countBy(bedrijven, c => c.activiteiten || []);

  const satRows = Object.entries(actFiltered).map(([id, n]) => {
    const total = actTotal[id] || 0;
    const pct = total ? Math.round(n / total * 100) : 0;
    return { id, n, total, pct };
  }).sort((a, b) => b.pct - a.pct);

  const witteVlekken = Object.entries(actFiltered)
    .filter(([, n]) => n <= 3)
    .sort((a, b) => a[1] - b[1]);

  el.innerHTML = `
    <div class="opp-section">
      <h3>Marktverzadiging</h3>
      <p class="opp-desc">Aantal spelers per activiteit (gefilterd vs. totaal)</p>
      <div class="opp-saturation">
        ${satRows.map(({ id, n, total, pct }) => {
          const cat = categorieen.find(c => c.id === id);
          const kleur = cat ? cat.kleur : "#888";
          return `<div class="sat-row">
            <span class="sat-label" style="color:${kleur}">${cat ? escHtml(cat.label) : id}</span>
            <div class="sat-bar"><div class="sat-fill" style="width:${pct}%;background:${kleur}"></div></div>
            <span class="sat-nums">${n} / ${total} (${pct}%)</span>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${witteVlekken.length ? `
    <div class="opp-section">
      <h3>Witte vlekken</h3>
      <p class="opp-desc">Activiteiten met ≤ 3 spelers binnen huidige filters — ruimte voor groei</p>
      <div class="opp-list">
        ${witteVlekken.map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          const kleur = cat ? cat.kleur : "#888";
          return `<div class="opp-item"><span class="opp-name" style="color:${kleur}">${cat ? escHtml(cat.label) : id}</span><span class="opp-detail">Slechts ${n} speler${n > 1 ? "s" : ""} in de zone</span></div>`;
        }).join("")}
      </div>
    </div>` : ""}
  `;
}

/* ════════════════════════════════════════════════════
 *  CSV Export
 * ════════════════════════════════════════════════════ */

function exportAnalyseCSV() {
  downloadCSV(buildCSV(getAnalyseFiltered()), "houtkaart_analyse.csv");
}
