/* ═══════════════════════════════════════════
   Houtkaart — Analyse tab
   Doel: overnamekandidaten & opportuniteiten
   ═══════════════════════════════════════════ */

let analyseSortKey = "naam";
let analyseSortAsc = true;
let analyseActiveActs = new Set();

function initAnalyse() {
  // Vul regio dropdown
  const regioSel = document.getElementById("analyse-regio");
  categorieen.filter(c => c.type === "regio").forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    regioSel.appendChild(opt);
  });

  // Vul activiteit checkboxes
  const actContainer = document.getElementById("analyse-activiteit-checks");
  categorieen.filter(c => c.type === "activiteit").forEach(c => {
    const label = document.createElement("label");
    label.className = "analyse-act-label";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c.id;
    cb.checked = true; // standaard alles aan
    cb.addEventListener("change", () => {
      if (cb.checked) {
        analyseActiveActs.add(c.id);
        label.classList.add("checked");
      } else {
        analyseActiveActs.delete(c.id);
        label.classList.remove("checked");
      }
      renderAnalyse();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + c.label));
    label.style.borderColor = c.kleur;
    label.style.color = c.kleur;
    label.classList.add("checked");
    actContainer.appendChild(label);
    analyseActiveActs.add(c.id);
  });

  // Standaard: groene zone aan, BTW aan
  document.getElementById("analyse-groene-zone").checked = true;
  document.getElementById("analyse-btw-only").checked = true;

  // Filters → re-render
  document.querySelectorAll(".analyse-filters select, .analyse-filters > label input").forEach(el => {
    el.addEventListener("change", renderAnalyse);
  });

  // Sortering
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (analyseSortKey === key) {
        analyseSortAsc = !analyseSortAsc;
      } else {
        analyseSortKey = key;
        analyseSortAsc = true;
      }
      renderAnalyse();
    });
  });

  // Export
  document.getElementById("analyse-export").addEventListener("click", exportCSV);
}

function getAnalyseFiltered() {
  const regio = document.getElementById("analyse-regio").value;
  const grootte = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (regio && c.provincie !== regio) return false;
    // Activiteiten: minstens 1 actieve activiteit moet matchen
    const cActs = c.activiteiten || [];
    if (analyseActiveActs.size > 0 && !cActs.some(a => analyseActiveActs.has(a))) return false;
    if (grootte && c.grootte !== grootte) return false;
    if (groeneZone && !inGroeneZone(c)) return false;
    if (btwOnly && !c.btw) return false;
    return true;
  });
}

function renderAnalyse() {
  const data = getAnalyseFiltered();

  // Sorteer
  data.sort((a, b) => {
    let va = getSortValue(a, analyseSortKey);
    let vb = getSortValue(b, analyseSortKey);
    if (typeof va === "string") {
      va = va.toLowerCase();
      vb = vb.toLowerCase();
    }
    if (va < vb) return analyseSortAsc ? -1 : 1;
    if (va > vb) return analyseSortAsc ? 1 : -1;
    return 0;
  });

  // Sorteer headers updaten
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    const base = th.textContent.replace(/ [▴▾]$/, "");
    if (th.dataset.sort === analyseSortKey) {
      th.textContent = base + (analyseSortAsc ? " ▴" : " ▾");
    } else {
      th.textContent = base;
    }
  });

  // Stats + opportuniteiten
  renderStats(data);
  renderOpportuniteiten(data);

  // Tabel
  const tbody = document.getElementById("analyse-tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    const acts = (c.activiteiten || []).map(a => {
      const cat = categorieen.find(cat => cat.id === a);
      return cat ? cat.label : a;
    }).join(", ");
    const provLabel = PROV_LABELS[c.provincie] || c.provincie;
    const sizeLabel = { G: "Groot", M: "Midden", K: "Klein" }[c.grootte] || "";
    const webLink = c.website
      ? `<a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener">${c.website}</a>`
      : "";
    const btwLink = c.btw
      ? `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${c.btw}</a>`
      : "";

    // Markeer waarschuwingen
    const hasWarning = (c.info || "").includes("⚠️");
    if (hasWarning) tr.classList.add("row-warning");

    // Bepaal dichtste vestiging
    const rH = c.rijtijd_hertsberge;
    const rD = c.rijtijd_drongen;
    let dichtsteText = "";
    if (rH != null && rD != null) {
      dichtsteText = rH <= rD ? `H ${rH}'` : `D ${rD}'`;
    } else if (rH != null) {
      dichtsteText = `H ${rH}'`;
    } else if (rD != null) {
      dichtsteText = `D ${rD}'`;
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
      <td class="td-num td-dichtste">${dichtsteText}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getSortValue(c, key) {
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] != null ? c[key] : 999;
  if (key === "dichtste") {
    const rH = c.rijtijd_hertsberge;
    const rD = c.rijtijd_drongen;
    if (rH != null && rD != null) return Math.min(rH, rD);
    if (rH != null) return rH;
    if (rD != null) return rD;
    return 999;
  }
  return c[key] || "";
}

// Helper: maak website link HTML
function makeWebLink(c) {
  if (!c.website) return "";
  const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
  return `<a href="${url}" target="_blank" rel="noopener" class="opp-link">🌐 ${c.website}</a>`;
}

// ─── Statistieken ─────────────────────────────
function renderStats(data) {
  const el = document.getElementById("analyse-stats");

  const actCounts = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actCounts[a] = (actCounts[a] || 0) + 1; }));

  const regioCounts = {};
  data.forEach(c => { const l = PROV_LABELS[c.provincie] || c.provincie; regioCounts[l] = (regioCounts[l] || 0) + 1; });

  const sizeCounts = { G: 0, M: 0, K: 0 };
  data.forEach(c => { sizeCounts[c.grootte] = (sizeCounts[c.grootte] || 0) + 1; });

  const metBtw = data.filter(c => c.btw).length;
  const metWebsite = data.filter(c => c.website).length;
  const inZone = data.filter(c => inGroeneZone(c)).length;

  el.innerHTML = `
    <div class="stat-card"><div class="stat-num">${data.length}</div><div class="stat-label">Bedrijven</div></div>
    <div class="stat-card"><div class="stat-num">${inZone}</div><div class="stat-label">In groene zone</div></div>
    <div class="stat-card"><div class="stat-num">${metBtw}</div><div class="stat-label">Met BTW-nr</div></div>
    <div class="stat-card"><div class="stat-num">${metWebsite}</div><div class="stat-label">Met website</div></div>
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

// ─── Opportuniteiten & Overname-analyse ───────
function renderOpportuniteiten(data) {
  const el = document.getElementById("analyse-opps");
  if (!el) return;

  const allInZone = bedrijven.filter(c => inGroeneZone(c));

  // 1. Overnamekandidaten: oud bedrijf (opgericht < 2000), klein, in groene zone
  const overnameCandidates = allInZone.filter(c => {
    const yr = parseInt(c.oprichting);
    return c.grootte === "K" && yr && yr < 2000;
  }).sort((a, b) => parseInt(a.oprichting) - parseInt(b.oprichting));

  // 2. Concurrentie-dichtheid per activiteit in groene zone
  const actInZone = {};
  allInZone.forEach(c => (c.activiteiten || []).forEach(a => {
    actInZone[a] = (actInZone[a] || 0) + 1;
  }));
  const actTotal = {};
  bedrijven.forEach(c => (c.activiteiten || []).forEach(a => {
    actTotal[a] = (actTotal[a] || 0) + 1;
  }));

  // 3. Witte vlekken — activiteiten met weinig spelers in zone
  const witteVlekken = Object.entries(actInZone)
    .filter(([, n]) => n <= 3)
    .sort((a, b) => a[1] - b[1]);

  el.innerHTML = `
    ${overnameCandidates.length ? `
    <div class="opp-section">
      <h3>🎯 Overnamekandidaten <span class="opp-subtitle">(op basis van oprichtingsjaar en dus mogelijkheid geen opvolging)</span></h3>
      <p class="opp-desc">Kleine bedrijven in de groene zone, opgericht voor 2000</p>
      <div class="opp-list">
        ${overnameCandidates.slice(0, 15).map(c => `
          <div class="opp-item">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">Opgericht ${c.oprichting} · ${(c.activiteiten || []).map(a => { const cat = categorieen.find(x => x.id === a); return cat ? cat.label : a; }).join(", ")}</span>
            ${makeWebLink(c)}
            ${c.btw ? `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" class="opp-link">📊 Jaarrekening</a>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}


    <div class="opp-section">
      <h3>📊 Marktverzadiging in groene zone</h3>
      <p class="opp-desc">Aantal spelers per activiteit in de groene zone vs. totaal</p>
      <div class="opp-saturation">
        ${Object.entries(actInZone).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          const label = cat ? cat.label : id;
          const total = actTotal[id] || 0;
          const pct = total ? Math.round(n / total * 100) : 0;
          return `<div class="sat-row">
            <span class="sat-label" style="color:${cat ? cat.kleur : '#888'}">${label}</span>
            <div class="sat-bar"><div class="sat-fill" style="width:${pct}%;background:${cat ? cat.kleur : '#888'}"></div></div>
            <span class="sat-nums">${n} / ${total} (${pct}%)</span>
          </div>`;
        }).join("")}
      </div>
    </div>

    ${witteVlekken.length ? `
    <div class="opp-section">
      <h3>🔍 Witte vlekken</h3>
      <p class="opp-desc">Activiteiten met ≤ 3 spelers in de groene zone — ruimte voor groei of nieuw bedrijf</p>
      <div class="opp-list">
        ${witteVlekken.map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          const label = cat ? cat.label : id;
          return `<div class="opp-item"><span class="opp-name" style="color:${cat ? cat.kleur : '#888'}">${label}</span><span class="opp-detail">Slechts ${n} speler${n > 1 ? "s" : ""} in de zone</span></div>`;
        }).join("")}
      </div>
    </div>
    ` : ""}


  `;
}

// ─── CSV Export ───────────────────────────────
function exportCSV() {
  const data = getAnalyseFiltered();
  const header = ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Omzet", "Medewerkers", "Oprichting", "Rijtijd Hertsberge", "Rijtijd Drongen", "Dichtste vestiging"];
  const rows = data.map(c => [
    c.naam,
    PROV_LABELS[c.provincie] || c.provincie,
    (c.activiteiten || []).join("; "),
    { G: "Groot", M: "Middelgroot", K: "Klein" }[c.grootte] || "",
    c.adres || "",
    c.btw || "",
    c.website || "",
    c.omzet || "",
    c.medewerkers || "",
    c.oprichting || "",
    c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge : "",
    c.rijtijd_drongen != null ? c.rijtijd_drongen : "",
    (() => { const h = c.rijtijd_hertsberge, d = c.rijtijd_drongen; if (h != null && d != null) return h <= d ? `H ${h}'` : `D ${d}'`; if (h != null) return `H ${h}'`; if (d != null) return `D ${d}'`; return ""; })(),
  ]);

  const csv = [header, ...rows].map(r =>
    r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "houtkaart_analyse.csv";
  a.click();
  URL.revokeObjectURL(url);
}
