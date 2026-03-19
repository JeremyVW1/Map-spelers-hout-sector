/* ═══════════════════════════════════════════
   Houtkaart — Analyse tab
   Doel: overnamekandidaten & opportuniteiten
   ═══════════════════════════════════════════ */

let analyseSortKey = "naam";
let analyseSortAsc = true;

function initAnalyse() {
  // Vul regio dropdown
  const regioSel = document.getElementById("analyse-regio");
  categorieen.filter(c => c.type === "regio").forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    regioSel.appendChild(opt);
  });

  // Vul activiteit dropdown
  const actSel = document.getElementById("analyse-activiteit");
  categorieen.filter(c => c.type === "activiteit").forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    actSel.appendChild(opt);
  });

  // Filters → re-render
  document.querySelectorAll(".analyse-filters select, .analyse-filters input").forEach(el => {
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
  const act = document.getElementById("analyse-activiteit").value;
  const grootte = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (regio && c.provincie !== regio) return false;
    if (act && !(c.activiteiten || []).includes(act)) return false;
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

    tr.innerHTML = `
      <td class="td-naam">${c.naam}</td>
      <td>${provLabel}</td>
      <td>${acts}</td>
      <td><span class="size-badge ${c.grootte}">${sizeLabel}</span></td>
      <td class="td-adres">${c.adres || ""}</td>
      <td class="td-btw">${btwLink}</td>
      <td class="td-web">${webLink}</td>
      <td class="td-num">${c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge + "'" : ""}</td>
      <td class="td-num">${c.rijtijd_drongen != null ? c.rijtijd_drongen + "'" : ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getSortValue(c, key) {
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] != null ? c[key] : 999;
  return c[key] || "";
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

  // 2. Bedrijven met waarschuwing (gestopt, failliet, etc.)
  const warnings = data.filter(c => (c.info || "").includes("⚠️"));

  // 3. Concurrentie-dichtheid per activiteit in groene zone
  const actInZone = {};
  allInZone.forEach(c => (c.activiteiten || []).forEach(a => {
    actInZone[a] = (actInZone[a] || 0) + 1;
  }));
  const actTotal = {};
  bedrijven.forEach(c => (c.activiteiten || []).forEach(a => {
    actTotal[a] = (actTotal[a] || 0) + 1;
  }));

  // 4. Dichtste concurrenten — bedrijven < 10km van elkaar
  const clusters = findClusters(allInZone, 10);

  // 5. Witte vlekken — activiteiten met weinig spelers in zone
  const witteVlekken = Object.entries(actInZone)
    .filter(([, n]) => n <= 3)
    .sort((a, b) => a[1] - b[1]);

  // 6. Grote spelers zonder eigen vestiging dichtbij
  const groteVeraf = bedrijven.filter(c =>
    c.grootte === "G" &&
    c.rijtijd_hertsberge != null &&
    c.rijtijd_hertsberge > 30 &&
    c.rijtijd_drongen != null &&
    c.rijtijd_drongen > 30
  );

  el.innerHTML = `
    ${overnameCandidates.length ? `
    <div class="opp-section">
      <h3>🎯 Overnamekandidaten</h3>
      <p class="opp-desc">Kleine bedrijven in de groene zone, opgericht voor 2000 — mogelijk opvolgingsprobleem</p>
      <div class="opp-list">
        ${overnameCandidates.slice(0, 15).map(c => `
          <div class="opp-item">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">Opgericht ${c.oprichting} · ${(c.activiteiten || []).map(a => { const cat = categorieen.find(x => x.id === a); return cat ? cat.label : a; }).join(", ")}</span>
            ${c.btw ? `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" class="opp-link">📊 Jaarrekening</a>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    ${warnings.length ? `
    <div class="opp-section">
      <h3>⚠️ Gestopt / problemen</h3>
      <p class="opp-desc">Bedrijven met waarschuwing — klantenbasis mogelijk vrij</p>
      <div class="opp-list">
        ${warnings.map(c => `
          <div class="opp-item opp-warning">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">${c.info}</span>
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

    ${clusters.length ? `
    <div class="opp-section">
      <h3>🏘️ Concurrentieclusters</h3>
      <p class="opp-desc">Bedrijven met dezelfde activiteit binnen 10km — hoge lokale concurrentie</p>
      <div class="opp-list">
        ${clusters.slice(0, 10).map(cl => `
          <div class="opp-item">
            <span class="opp-name">${cl.names.join(" ↔ ")}</span>
            <span class="opp-detail">${cl.activity} · ${cl.distKm.toFixed(1)}km van elkaar</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}

    ${groteVeraf.length ? `
    <div class="opp-section">
      <h3>🏢 Grote spelers buiten bereik</h3>
      <p class="opp-desc">Dominante bedrijven die > 30 min rijden van beide vestigingen — hun markt is moeilijk te bedienen vanuit V&J</p>
      <div class="opp-list">
        ${groteVeraf.map(c => `
          <div class="opp-item">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">🚗 H: ${c.rijtijd_hertsberge}' · D: ${c.rijtijd_drongen}' · ${(c.activiteiten || []).map(a => { const cat = categorieen.find(x => x.id === a); return cat ? cat.label : a; }).join(", ")}</span>
          </div>
        `).join("")}
      </div>
    </div>
    ` : ""}
  `;
}

function findClusters(companies, maxKm) {
  const clusters = [];
  for (let i = 0; i < companies.length; i++) {
    for (let j = i + 1; j < companies.length; j++) {
      const a = companies[i], b = companies[j];
      const sharedActs = (a.activiteiten || []).filter(act => (b.activiteiten || []).includes(act));
      if (sharedActs.length === 0) continue;
      const d = distKmUtil(a.lat, a.lng, b.lat, b.lng);
      if (d <= maxKm && d > 0) {
        const actLabel = sharedActs.map(id => {
          const cat = categorieen.find(c => c.id === id);
          return cat ? cat.label : id;
        }).join(", ");
        clusters.push({
          names: [a.naam.replace(/\s*\([^)]*\)/, ""), b.naam.replace(/\s*\([^)]*\)/, "")],
          activity: actLabel,
          distKm: d,
        });
      }
    }
  }
  return clusters.sort((a, b) => a.distKm - b.distKm);
}

// ─── CSV Export ───────────────────────────────
function exportCSV() {
  const data = getAnalyseFiltered();
  const header = ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Omzet", "Medewerkers", "Oprichting", "Rijtijd Hertsberge", "Rijtijd Drongen"];
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
