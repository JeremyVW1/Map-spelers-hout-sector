/* Houtkaart — Filters & legenda */

let activeRegios = new Set();
let activeActiviteiten = new Set();

function buildFilters() {
  document.getElementById("btn-all").onclick = () => {
    activeRegios.clear();
    activeActiviteiten.clear();
    syncFilterButtons();
    render();
    updateCounter();
  };

  const regioRow = document.getElementById("filter-regio");
  addLabel(regioRow, "Regio:");
  makeFilterBtn(regioRow, "🟢 Max 1:10 rijden voor V&J", "groene_zone", "#2E7D32", "regio");
  categorieen.filter(c => c.type === "regio").forEach(c => makeFilterBtn(regioRow, c.label, c.id, c.kleur, "regio"));

  const actRow = document.getElementById("filter-activiteit");
  addLabel(actRow, "Activiteit:");
  categorieen.filter(c => c.type === "activiteit").forEach(c => makeFilterBtn(actRow, c.label, c.id, c.kleur, "activiteit"));
}

function addLabel(container, text) {
  const el = document.createElement("span");
  el.className = "filter-group-label";
  el.textContent = text;
  container.appendChild(el);
}

function makeFilterBtn(container, label, id, col, type) {
  const b = document.createElement("button");
  b.className = "fb";
  b.dataset.filterId = id;
  b.dataset.filterCol = col;
  b.dataset.filterType = type;
  b.textContent = label;
  b.onclick = () => {
    const set = type === "regio" ? activeRegios : activeActiviteiten;
    set.has(id) ? set.delete(id) : set.add(id);
    syncFilterButtons();
    render();
    updateCounter();
  };
  container.appendChild(b);
}

function syncFilterButtons() {
  const isAll = activeRegios.size === 0 && activeActiviteiten.size === 0;
  const allBtn = document.getElementById("btn-all");
  allBtn.classList.toggle("on", isAll);
  if (isAll) allBtn.style.cssText = "background:#1a1a2e;color:#fff;border-color:#1a1a2e";
  else allBtn.style.cssText = "";

  document.querySelectorAll(".fb[data-filter-id]").forEach(btn => {
    const set = btn.dataset.filterType === "regio" ? activeRegios : activeActiviteiten;
    const active = set.has(btn.dataset.filterId);
    btn.classList.toggle("on", active);
    const col = btn.dataset.filterCol;
    if (active) btn.style.cssText = `background:${col};color:#fff;border-color:${col}`;
    else btn.style.cssText = "";
  });
}

// Legenda
function buildLegend() {
  const el = document.getElementById("legend-content");

  // Grootte
  const szGroup = document.createElement("div");
  szGroup.className = "legend-group";
  szGroup.innerHTML = '<span class="legend-group-title">Grootte</span>';
  const szItems = document.createElement("div");
  szItems.className = "legend-items";
  [{ r: 13, l: "Groot / dominant" }, { r: 9, l: "Middelgroot" }, { r: 6, l: "Klein / lokaal" }].forEach(s => {
    const d = document.createElement("div");
    d.className = "legend-item";
    d.innerHTML = `<svg width="${s.r * 2 + 4}" height="${s.r * 2 + 4}"><circle cx="${s.r + 2}" cy="${s.r + 2}" r="${s.r}" fill="#888" opacity=".75"/></svg><span>${s.l}</span>`;
    szItems.appendChild(d);
  });
  szGroup.appendChild(szItems);
  el.appendChild(szGroup);

  // Zone
  const zoneGroup = document.createElement("div");
  zoneGroup.className = "legend-group";
  zoneGroup.innerHTML = '<span class="legend-group-title">Zone</span>';
  const zoneItems = document.createElement("div");
  zoneItems.className = "legend-items";
  zoneItems.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#4CAF50;border:1.5px dashed #2E7D32;opacity:0.7"></div><span>Max 1:10 rijden voor V&amp;J</span></div>
    <div class="legend-item"><div style="color:#8B1A1A;font-size:12px;font-weight:700;flex-shrink:0;width:12px;text-align:center">&#9660;</div><span>Eigen locatie</span></div>
  `;

  // Status
  const statusGroup = document.createElement("div");
  statusGroup.className = "legend-group";
  statusGroup.innerHTML = '<span class="legend-group-title">Status</span>';
  const statusItems = document.createElement("div");
  statusItems.className = "legend-items";
  statusItems.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="border:2.5px solid #f9a825;background:transparent"></div><span>Favoriet</span></div>
    <div class="legend-item"><div class="legend-dot" style="border:2.5px solid #e65100;background:transparent"></div><span>Twijfel</span></div>
    <div class="legend-item"><div class="legend-dot" style="border:2.5px solid #c62828;background:transparent"></div><span>Niet interessant</span></div>
  `;
  statusGroup.appendChild(statusItems);
  el.appendChild(statusGroup);
  zoneGroup.appendChild(zoneItems);
  el.appendChild(zoneGroup);

  // Mobiel toggle
  const toggle = document.getElementById("legend-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      el.classList.toggle("collapsed");
      toggle.textContent = el.classList.contains("collapsed") ? "▸ Legenda tonen" : "▾ Legenda verbergen";
    });
  }
}

function addLegendGroup(parent, title, items) {
  const group = document.createElement("div");
  group.className = "legend-group";
  group.innerHTML = `<span class="legend-group-title">${title}</span>`;
  const container = document.createElement("div");
  container.className = "legend-items";
  items.forEach(c => {
    const d = document.createElement("div");
    d.className = "legend-item";
    d.innerHTML = `<div class="legend-dot" style="background:${c.kleur}"></div><span>${c.label}</span>`;
    container.appendChild(d);
  });
  group.appendChild(container);
  parent.appendChild(group);
}

function updateCounter() {
  const el = document.getElementById("counter-num");
  if (el) el.textContent = getVisibleCompanies().length;
}
