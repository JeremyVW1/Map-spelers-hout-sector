/* ═══════════════════════════════════════════
   Houtkaart — Kaart, markers & filters
   ═══════════════════════════════════════════ */

let bedrijven = [];
let categorieen = [];
let markers = [];
let activeRegios = new Set();      // geselecteerde regio's
let activeActiviteiten = new Set(); // geselecteerde activiteiten
let map;

const KLEUR_MAP = {};
const PROV_LABELS = {};
const GROOTTE_LABELS = {
  G: "GROTE / DOMINANTE SPELER",
  M: "Middelgrote speler",
  K: "Lokale speler",
};
const GROOTTE_RADIUS = { G: 13, M: 9, K: 6 };

// ─── INIT ─────────────────────────────────
async function init() {
  // Laad data
  const [bedrijvenRes, catRes] = await Promise.all([
    fetch("data/bedrijven.json"),
    fetch("data/categorieen.json"),
  ]);
  bedrijven = await bedrijvenRes.json();
  categorieen = await catRes.json();

  // Bouw lookup maps
  categorieen.forEach((c) => {
    KLEUR_MAP[c.id] = c.kleur;
    PROV_LABELS[c.id] = c.label;
  });

  // Init kaart
  map = L.map("map", {
    center: [50.8, 4.2],
    zoom: 8,
    zoomControl: true,
    scrollWheelZoom: true,
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Eigen locatie markers
  addOwnLocations();

  // Wallonië achtergrond
  L.rectangle(
    [
      [49.4, 2.5],
      [50.75, 6.4],
    ],
    {
      color: "#880E4F",
      weight: 0,
      fillColor: "#f0e6ec",
      fillOpacity: 0.08,
    }
  ).addTo(map);

  // UI opbouwen
  buildFilters();
  buildLegend();
  initSearch();

  // Standaard: WVL + OVL geselecteerd
  activeRegios.add("wvl");
  activeRegios.add("ovl");
  syncFilterButtons();

  // Eerste render
  render();
  updateCounter();
}

// ─── DOELGEBIED (max 1u rijden van Hertsberghe EN Drongen) ──
function addTargetZone() {
  // Hertsberghe: 51.100, 3.270  |  Drongen: 51.033, 3.643
  // 1 uur rijden ≈ 60-70km straal
  // Overlappend gebied: ruwweg een ellips rond de E40 corridor
  // Berekend als punten die < 70km van BEIDE locaties liggen
  const hertsberghe = [51.1, 3.27];
  const drongen = [51.0334, 3.6431];
  const maxKm = 38; // ~1 uur rijden via de weg ≈ 50km weg / 1.3 omwegfactor = ~38km hemelsbreed

  function distKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Genereer polygoon punten via sampling
  const points = [];
  for (let angle = 0; angle < 360; angle += 5) {
    // Zoek de maximale afstand langs deze hoek vanuit het middelpunt
    const midLat = (hertsberghe[0] + drongen[0]) / 2;
    const midLng = (hertsberghe[1] + drongen[1]) / 2;

    for (let r = maxKm; r > 0; r -= 2) {
      const lat = midLat + (r / 111) * Math.cos((angle * Math.PI) / 180);
      const lng = midLng + (r / (111 * Math.cos((midLat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);

      const d1 = distKm(lat, lng, hertsberghe[0], hertsberghe[1]);
      const d2 = distKm(lat, lng, drongen[0], drongen[1]);

      if (d1 <= maxKm && d2 <= maxKm) {
        points.push([lat, lng]);
        break;
      }
    }
  }

  if (points.length > 2) {
    L.polygon(points, {
      color: "#2E7D32",
      weight: 2,
      fillColor: "#4CAF50",
      fillOpacity: 0.08,
      dashArray: "8,4",
    }).addTo(map);
  }
}

// ─── EIGEN LOCATIES ─────────────────────────
function addOwnLocations() {
  // Teken eerst het doelgebied (onder de markers)
  addTargetZone();

  const locs = [
    { naam: "Drongen", ll: [51.0334, 3.6431] },
    { naam: "Hertsberghe", ll: [51.1, 3.27] },
    { naam: "Koksijde", ll: [51.1031, 2.6531] },
  ];

  locs.forEach((loc) => {
    L.circle(loc.ll, {
      radius: 2500,
      color: "#8B1A1A",
      fillColor: "#8B1A1A",
      fillOpacity: 0.07,
      weight: 2,
      dashArray: "7,4",
    }).addTo(map);

    L.marker(loc.ll, {
      icon: L.divIcon({
        html: `<div class="own-marker" style="background:#8B1A1A;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(139,26,26,0.4)">▼ ${loc.naam}</div>`,
        className: "",
        iconAnchor: [38, 26],
      }),
      zIndexOffset: 9999,
    }).addTo(map);
  });
}

// ─── MARKER ICOON ───────────────────────────
function makeIcon(col, r, isGroot) {
  const s = r * 2 + 8;
  const ring = isGroot
    ? `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 4}" fill="none" stroke="${col}" stroke-width="1.5" opacity="0.28"/>`
    : "";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${ring}<circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${col}" stroke="white" stroke-width="1.8" opacity="0.93"/></svg>`,
    className: "",
    iconSize: [s, s],
    iconAnchor: [s / 2, s / 2],
  });
}

// ─── POPUP CONTENT ──────────────────────────
function buildPopup(c) {
  const col = KLEUR_MAP[c.provincie] || "#888";
  const provLabel = PROV_LABELS[c.provincie] || c.provincie;
  const sizeLabel = GROOTTE_LABELS[c.grootte] || "Onbekend";

  // Extraheer contactgegevens uit info
  let info = c.info;
  let contactHtml = "";
  const telMatch = info.match(/📞\s*([^\s📧🌐]+)/);
  const mailMatch = info.match(/📧\s*([^\s📞🌐]+)/);
  const webMatch = info.match(/🌐\s*([^\s📞📧]+(?:\s*\|\s*[^\s📞📧]+)*)/);
  const adresMatch = info.match(/📍\s*([^📞📧🌐]+)/);

  if (adresMatch || telMatch || mailMatch || webMatch) {
    contactHtml = '<div class="popup-contact">';
    if (adresMatch)
      contactHtml += `📍 ${adresMatch[1].trim()}<br>`;
    if (telMatch)
      contactHtml += `📞 ${telMatch[1].trim()}<br>`;
    if (mailMatch)
      contactHtml += `📧 ${mailMatch[1].trim()}<br>`;
    if (webMatch)
      contactHtml += `🌐 ${webMatch[1].trim()}`;
    contactHtml += "</div>";

    // Verwijder contact-emoji's uit info
    info = info
      .replace(/📍[^📞📧🌐]*/g, "")
      .replace(/📞[^\s📧🌐]*/g, "")
      .replace(/📧[^\s📞🌐]*/g, "")
      .replace(/🌐[^\s📞📧]*/g, "")
      .replace(/\s*\|\s*/g, " ")
      .trim();
  }

  // Markeer waarschuwingen
  const hasWarning = info.includes("⚠️");
  const infoClass = hasWarning ? "popup-info popup-warning" : "popup-info";

  // Verrijkte data
  let enrichHtml = "";
  if (c.btw || c.groep_btw) {
    enrichHtml += '<div class="popup-enrich">';
    if (c.groep) enrichHtml += `<b>Groep:</b> ${c.groep}<br>`;
    enrichHtml += `<b>BTW:</b> ${c.btw || c.groep_btw || "?"}<br>`;
    if (c.groep_omzet) enrichHtml += `<b>Omzet:</b> ${c.groep_omzet}<br>`;
    const fte = c.medewerkers || c.groep_medewerkers;
    if (fte) enrichHtml += `<b>FTE:</b> ${fte}<br>`;
    if (c.rechtsvorm || c.groep_rechtsvorm) enrichHtml += `<b>Vorm:</b> ${c.rechtsvorm || c.groep_rechtsvorm}<br>`;
    enrichHtml += "</div>";
  }

  return `
    <span class="popup-badge" style="background:${col}">${provLabel}</span>
    <span class="popup-name">${c.naam}</span>
    <span class="popup-coords">📍 ${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}</span>
    <span class="${infoClass}">${info}</span>
    ${contactHtml}
    ${enrichHtml}
    <span class="popup-webshop">🌐 Webshop: <b>${c.webshop}</b></span>
    <span class="popup-size ${c.grootte}">${sizeLabel}</span>
  `;
}

// ─── RENDER MARKERS ─────────────────────────
function render() {
  // Verwijder bestaande markers
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  const visible = getVisibleCompanies();

  visible.forEach((c) => {
    const col = KLEUR_MAP[c.provincie] || "#888";
    const r = GROOTTE_RADIUS[c.grootte] || 7;
    const icon = makeIcon(col, r, c.grootte === "G");
    const m = L.marker([c.lat, c.lng], { icon })
      .addTo(map)
      .bindPopup(buildPopup(c), { maxWidth: 300 });
    markers.push(m);
  });
}

// ─── FILTERS (regio + activiteit, AND logica) ──
function buildFilters() {
  const bar = document.getElementById("controls");

  // "Reset" knop
  const allBtn = document.createElement("button");
  allBtn.className = "fb";
  allBtn.id = "btn-all";
  allBtn.textContent = "🗺 Alles";
  allBtn.onclick = () => {
    activeRegios.clear();
    activeActiviteiten.clear();
    syncFilterButtons();
    render();
    updateCounter();
  };
  bar.appendChild(allBtn);

  // Regio label + knoppen
  const regioLabel = document.createElement("span");
  regioLabel.className = "filter-group-label";
  regioLabel.textContent = "Regio:";
  bar.appendChild(regioLabel);

  categorieen.filter((c) => c.type === "regio").forEach((c) => {
    makeFilterBtn(bar, c.label, c.id, c.kleur, "regio");
  });

  // Scheidingslijn
  const div = document.createElement("div");
  div.className = "divider";
  bar.appendChild(div);

  // Activiteit label + knoppen
  const actLabel = document.createElement("span");
  actLabel.className = "filter-group-label";
  actLabel.textContent = "Activiteit:";
  bar.appendChild(actLabel);

  categorieen.filter((c) => c.type === "activiteit").forEach((c) => {
    makeFilterBtn(bar, c.label, c.id, c.kleur, "activiteit");
  });
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
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    syncFilterButtons();
    render();
    updateCounter();
  };

  container.appendChild(b);
}

function syncFilterButtons() {
  const allBtn = document.getElementById("btn-all");
  const isAll = activeRegios.size === 0 && activeActiviteiten.size === 0;

  // "Alles" knop
  if (isAll) {
    allBtn.classList.add("on");
    allBtn.style.background = "#1a1a2e";
    allBtn.style.color = "#fff";
    allBtn.style.borderColor = "#1a1a2e";
  } else {
    allBtn.classList.remove("on");
    allBtn.style.background = "";
    allBtn.style.color = "";
    allBtn.style.borderColor = "";
  }

  // Alle categorie-knoppen
  document.querySelectorAll(".fb[data-filter-id]").forEach((btn) => {
    const id = btn.dataset.filterId;
    const col = btn.dataset.filterCol;
    const type = btn.dataset.filterType;
    const set = type === "regio" ? activeRegios : activeActiviteiten;

    if (set.has(id)) {
      btn.classList.add("on");
      btn.style.background = col;
      btn.style.color = "#fff";
      btn.style.borderColor = col;
    } else {
      btn.classList.remove("on");
      btn.style.background = "";
      btn.style.color = "";
      btn.style.borderColor = "";
    }
  });
}

// ─── LEGENDA ────────────────────────────────
function buildLegend() {
  const el = document.getElementById("legend-content");

  // Regio groep
  const regioGroup = document.createElement("div");
  regioGroup.className = "legend-group";
  regioGroup.innerHTML = '<span class="legend-group-title">Regio</span>';
  const regioItems = document.createElement("div");
  regioItems.className = "legend-items";
  categorieen.filter((c) => c.type === "regio").forEach((c) => {
    const d = document.createElement("div");
    d.className = "legend-item";
    d.innerHTML = `<div class="legend-dot" style="background:${c.kleur}"></div><span>${c.label}</span>`;
    regioItems.appendChild(d);
  });
  regioGroup.appendChild(regioItems);
  el.appendChild(regioGroup);

  // Activiteit groep
  const actGroup = document.createElement("div");
  actGroup.className = "legend-group";
  actGroup.innerHTML = '<span class="legend-group-title">Activiteit</span>';
  const actItems = document.createElement("div");
  actItems.className = "legend-items";
  categorieen.filter((c) => c.type === "activiteit").forEach((c) => {
    const d = document.createElement("div");
    d.className = "legend-item";
    d.innerHTML = `<div class="legend-dot" style="background:${c.kleur}"></div><span>${c.label}</span>`;
    actItems.appendChild(d);
  });
  actGroup.appendChild(actItems);
  el.appendChild(actGroup);

  // Grootte groep
  const szGroup = document.createElement("div");
  szGroup.className = "legend-group";
  szGroup.innerHTML = '<span class="legend-group-title">Grootte</span>';
  const szItems = document.createElement("div");
  szItems.className = "legend-items";
  [
    { r: 13, l: "Groot / dominant" },
    { r: 9, l: "Middelgroot" },
    { r: 6, l: "Klein / lokaal" },
  ].forEach((s) => {
    const sp = document.createElement("div");
    sp.className = "legend-item";
    sp.innerHTML = `<svg width="${s.r * 2 + 4}" height="${s.r * 2 + 4}"><circle cx="${s.r + 2}" cy="${s.r + 2}" r="${s.r}" fill="#888" opacity=".75"/></svg><span>${s.l}</span>`;
    szItems.appendChild(sp);
  });
  szGroup.appendChild(szItems);
  el.appendChild(szGroup);

  // Mobiel toggle
  const toggle = document.getElementById("legend-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      el.classList.toggle("collapsed");
      toggle.textContent = el.classList.contains("collapsed")
        ? "▸ Legenda tonen"
        : "▾ Legenda verbergen";
    });
  }
}

// ─── COUNTER ────────────────────────────────
function updateCounter() {
  const visible = getVisibleCompanies();
  const el = document.getElementById("counter-num");
  if (el) el.textContent = visible.length;
}

// ─── START ──────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
