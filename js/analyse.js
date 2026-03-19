/* Houtkaart — Analyse tab */

let analyseSortKey = "naam";
let analyseSortAsc = true;
let analyseActiveActs = new Set();

function initAnalyse() {
  const regioSel = document.getElementById("analyse-regio");
  categorieen.filter(c => c.type === "regio").forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    regioSel.appendChild(opt);
  });

  // Activiteit checkboxes
  const actContainer = document.getElementById("analyse-activiteit-checks");
  categorieen.filter(c => c.type === "activiteit").forEach(c => {
    const label = document.createElement("label");
    label.className = "analyse-act-label checked";
    label.style.borderColor = c.kleur;
    label.style.color = c.kleur;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c.id;
    cb.checked = true;
    cb.addEventListener("change", () => {
      cb.checked ? analyseActiveActs.add(c.id) : analyseActiveActs.delete(c.id);
      label.classList.toggle("checked", cb.checked);
      renderAnalyse();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + c.label));
    actContainer.appendChild(label);
    analyseActiveActs.add(c.id);
  });

  // Standaard filters
  document.getElementById("analyse-groene-zone").checked = true;
  document.getElementById("analyse-btw-only").checked = true;

  document.querySelectorAll(".analyse-filters select, .analyse-filters > label input").forEach(el => {
    el.addEventListener("change", renderAnalyse);
  });

  // Sortering
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      if (analyseSortKey === th.dataset.sort) analyseSortAsc = !analyseSortAsc;
      else { analyseSortKey = th.dataset.sort; analyseSortAsc = true; }
      renderAnalyse();
    });
  });

  document.getElementById("analyse-export").addEventListener("click", exportCSV);
}

function getAnalyseFiltered() {
  const regio = document.getElementById("analyse-regio").value;
  const grootte = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (regio && c.provincie !== regio) return false;
    if (analyseActiveActs.size > 0 && !(c.activiteiten || []).some(a => analyseActiveActs.has(a))) return false;
    if (grootte && c.grootte !== grootte) return false;
    if (groeneZone && !inGroeneZone(c)) return false;
    if (btwOnly && !c.btw) return false;
    return true;
  });
}

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

  // Sorteer-indicator updaten
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    const base = th.textContent.replace(/ [▴▾]$/, "");
    th.textContent = th.dataset.sort === analyseSortKey ? base + (analyseSortAsc ? " ▴" : " ▾") : base;
  });

  renderStats(data);
  renderOpportuniteiten(data);

  const tbody = document.getElementById("analyse-tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    const acts = (c.activiteiten || []).map(a => categorieen.find(cat => cat.id === a)?.label || a).join(", ");
    const provLabel = PROV_LABELS[c.provincie] || c.provincie;
    const sizeLabel = { G: "Groot", M: "Midden", K: "Klein" }[c.grootte] || "";
    const webLink = c.website ? `<a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener">${c.website}</a>` : "";
    const btwLink = c.btw ? `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${c.btw}</a>` : "";

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
}

function getSortValue(c, key) {
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] != null ? c[key] : 999;
  if (key === "dichtste") {
    const rH = c.rijtijd_hertsberge, rD = c.rijtijd_drongen;
    return (rH != null && rD != null) ? Math.round((rH + rD) / 2) : 999;
  }
  return c[key] || "";
}

function makeWebLink(c) {
  if (!c.website) return "";
  const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
  return `<a href="${url}" target="_blank" rel="noopener" class="opp-link">🌐 ${c.website}</a>`;
}

// Statistieken
function renderStats(data) {
  const actCounts = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actCounts[a] = (actCounts[a] || 0) + 1; }));
  const regioCounts = {};
  data.forEach(c => { const l = PROV_LABELS[c.provincie] || c.provincie; regioCounts[l] = (regioCounts[l] || 0) + 1; });
  const sizeCounts = { G: 0, M: 0, K: 0 };
  data.forEach(c => { sizeCounts[c.grootte] = (sizeCounts[c.grootte] || 0) + 1; });

  document.getElementById("analyse-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${data.length}</div><div class="stat-label">Bedrijven</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => inGroeneZone(c)).length}</div><div class="stat-label">In groene zone</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.btw).length}</div><div class="stat-label">Met BTW-nr</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.website).length}</div><div class="stat-label">Met website</div></div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per grootte</div>
      <div class="stat-bar-group">
        ${[["Groot", "G"], ["Midden", "M"], ["Klein", "K"]].map(([l, k]) =>
          `<div class="stat-bar-row"><span class="stat-bar-label">${l}</span><div class="stat-bar"><div class="stat-bar-fill ${k}" style="width:${data.length ? (sizeCounts[k] / data.length * 100) : 0}%"></div></div><span class="stat-bar-num">${sizeCounts[k]}</span></div>`
        ).join("")}
      </div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per activiteit</div>
      <div class="stat-chips">${Object.entries(actCounts).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
        const cat = categorieen.find(c => c.id === id);
        return `<span class="stat-chip" style="border-color:${cat ? cat.kleur : '#888'};color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id} <b>${n}</b></span>`;
      }).join("")}</div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per regio</div>
      <div class="stat-chips">${Object.entries(regioCounts).sort((a, b) => b[1] - a[1]).map(([l, n]) =>
        `<span class="stat-chip">${l} <b>${n}</b></span>`
      ).join("")}</div>
    </div>
  `;
}

// Opportuniteiten
function renderOpportuniteiten(data) {
  const el = document.getElementById("analyse-opps");
  if (!el) return;

  // Gebruik gefilterde data (regio + activiteit + grootte + groene zone + BTW filters)
  const overnameCandidates = data.filter(c => {
    const yr = parseInt(c.oprichting);
    return c.grootte === "K" && yr && yr < 2000;
  }).sort((a, b) => parseInt(a.oprichting) - parseInt(b.oprichting));

  const actFiltered = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actFiltered[a] = (actFiltered[a] || 0) + 1; }));
  const actTotal = {};
  bedrijven.forEach(c => (c.activiteiten || []).forEach(a => { actTotal[a] = (actTotal[a] || 0) + 1; }));

  const witteVlekken = Object.entries(actFiltered).filter(([, n]) => n <= 3).sort((a, b) => a[1] - b[1]);

  el.innerHTML = `
    ${overnameCandidates.length ? `
    <div class="opp-section">
      <h3>🎯 Overnamekandidaten <span class="opp-subtitle">(op basis van oprichtingsjaar en dus mogelijkheid geen opvolging)</span></h3>
      <p class="opp-desc">Kleine bedrijven opgericht voor 2000 (binnen huidige filters)</p>
      <div class="opp-list">
        ${overnameCandidates.slice(0, 15).map(c => `
          <div class="opp-item">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">Opgericht ${c.oprichting} · ${(c.activiteiten || []).map(a => categorieen.find(x => x.id === a)?.label || a).join(", ")}</span>
            ${makeWebLink(c)}
            ${c.btw ? `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" class="opp-link">📊 Jaarrekening</a>` : ""}
          </div>
        `).join("")}
      </div>
    </div>` : ""}
    <div class="opp-section">
      <h3>📊 Marktverzadiging</h3>
      <p class="opp-desc">Aantal spelers per activiteit (gefilterd vs. totaal)</p>
      <div class="opp-saturation">
        ${Object.entries(actFiltered).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          const total = actTotal[id] || 0;
          const pct = total ? Math.round(n / total * 100) : 0;
          return `<div class="sat-row">
            <span class="sat-label" style="color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id}</span>
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
          return `<div class="opp-item"><span class="opp-name" style="color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id}</span><span class="opp-detail">Slechts ${n} speler${n > 1 ? "s" : ""} in de zone</span></div>`;
        }).join("")}
      </div>
    </div>` : ""}
  `;
}

// CSV Export
function exportCSV() {
  const data = getAnalyseFiltered();
  const header = ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Omzet", "Medewerkers", "Oprichting", "Rijtijd Hertsberge", "Rijtijd Drongen", "Gem. rijtijd H+D"];
  const rows = data.map(c => [
    c.naam,
    PROV_LABELS[c.provincie] || c.provincie,
    (c.activiteiten || []).join("; "),
    { G: "Groot", M: "Middelgroot", K: "Klein" }[c.grootte] || "",
    c.adres || "", c.btw || "", c.website || "",
    c.omzet || "", c.medewerkers || "", c.oprichting || "",
    c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge : "",
    c.rijtijd_drongen != null ? c.rijtijd_drongen : "",
    (c.rijtijd_hertsberge != null && c.rijtijd_drongen != null) ? Math.round((c.rijtijd_hertsberge + c.rijtijd_drongen) / 2) : "",
  ]);

  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "houtkaart_analyse.csv";
  a.click();
  URL.revokeObjectURL(url);
}
