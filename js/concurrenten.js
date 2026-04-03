/* Houtkaart — Concurrentenlaag NieuwParket BV
 *
 * Aparte laag met directe concurrenten voor parketrestauratie.
 * Markers met kleurcodering per concurrentiecategorie.
 * Pop-ups met bedrijfsinfo + afstand tot Knesselare.
 */

let concurrenten = [];
const concurrentMarkers = new Map(); // naam -> { marker, company }
let concurrentLayerVisible = true;
let activeConcurrentCats = new Set(["monument_direct", "restauratie_generiek", "premium_nieuw", "te_verifieren"]);

/* ─── NieuwParket referentiepunt ─── */
const NIEUWPARKET = {
  naam: "NieuwParket BV",
  adres: "Kerkstraat 42, 9910 Knesselare",
  lat: 51.1290,
  lng: 3.4160,
  zaakvoerder: "Geert Van Nieuwerburgh",
};

/* ─── Concurrentie kleuren ─── */
const CONC_KLEUREN = {
  monument_direct:     "#D50000",
  restauratie_generiek: "#FF6D00",
  premium_nieuw:       "#FFD600",
  te_verifieren:       "#9E9E9E",
};

const CONC_LABELS = {
  monument_direct:     "Monumentenfocus",
  restauratie_generiek: "Restauratie generiek",
  premium_nieuw:       "Premium nieuwplaatsing",
  te_verifieren:       "Te verifiëren",
};

const OVERLAP_LABELS = {
  hoog:   "Hoge overlapping",
  midden: "Middelmatige overlapping",
  laag:   "Lage overlapping",
};

/* ─── Haversine afstandsberekening (km) ─── */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function afstandTotKnesselare(c) {
  return Math.round(haversineKm(NIEUWPARKET.lat, NIEUWPARKET.lng, c.lat, c.lng));
}

/* ─── Concurrenten laden ─── */
async function loadConcurrenten() {
  try {
    const res = await fetch("data/concurrenten.json");
    if (!res.ok) throw new Error("concurrenten.json laden mislukt");
    concurrenten = await res.json();
  } catch (e) {
    console.warn("Concurrenten laden mislukt:", e);
    concurrenten = [];
  }
}

/* ─── Marker icoon (diamant/ruit vorm) ─── */
function makeConcIcon(kleur, overlapping) {
  const size = overlapping === "hoog" ? 30 : overlapping === "midden" ? 24 : 20;
  const half = size / 2;
  const strokeW = overlapping === "hoog" ? 2.5 : 1.8;
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <polygon points="${half},2 ${size - 2},${half} ${half},${size - 2} 2,${half}"
        fill="${kleur}" stroke="#fff" stroke-width="${strokeW}" opacity="0.92"/>
    </svg>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

/* ─── Pop-up bouwen ─── */
function buildConcPopup(c) {
  const kleur = CONC_KLEUREN[c.categorie] || "#888";
  const catLabel = CONC_LABELS[c.categorie] || c.categorie;
  const olLabel = OVERLAP_LABELS[c.overlapping] || "";
  const km = afstandTotKnesselare(c);

  let contactHtml = '<div class="popup-contact">';
  if (c.adres) contactHtml += `<a href="https://www.google.com/maps/search/${encodeURIComponent(c.adres + ", België")}" target="_blank" rel="noopener" class="popup-link">📍 ${escHtml(c.adres)}</a>`;
  if (c.telefoon) contactHtml += `<a href="tel:${c.telefoon.replace(/[^+\d]/g, "")}" class="popup-link">📞 ${escHtml(c.telefoon)}</a>`;
  if (c.email) contactHtml += `<a href="mailto:${escHtml(c.email)}" class="popup-link">📧 ${escHtml(c.email)}</a>`;
  if (c.website) {
    const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
    contactHtml += `<a href="${escHtml(url)}" target="_blank" rel="noopener" class="popup-link">🌐 ${escHtml(c.website)}</a>`;
  }
  contactHtml += "</div>";

  let detailHtml = '<div class="popup-enrich">';
  if (c.btw) detailHtml += `<b>BTW:</b> ${escHtml(c.btw)}<br>`;
  if (c.nace) detailHtml += `<b>NACE:</b> ${escHtml(c.nace)}<br>`;
  if (c.zaakvoerder) detailHtml += `<b>Zaakvoerder:</b> ${escHtml(c.zaakvoerder)}<br>`;
  if (c.oprichting) detailHtml += `<b>Opgericht:</b> ${escHtml(c.oprichting)}<br>`;
  if (c.fte > 0) detailHtml += `<b>VTE:</b> ${c.fte}<br>`;
  if (c.omzet) detailHtml += `<b>Omzet:</b> ${escHtml(c.omzet)}<br>`;
  if (c.certificeringen) detailHtml += `<b>Erkenningen:</b> ${escHtml(c.certificeringen)}<br>`;
  if (c.klanten) detailHtml += `<b>Klanten:</b> ${escHtml(c.klanten)}<br>`;
  if (c.werkgebied) detailHtml += `<b>Werkgebied:</b> ${escHtml(c.werkgebied)}<br>`;
  if (c.btw) {
    const btwNum = c.btw.replace(/[^0-9]/g, "");
    detailHtml += `<a href="https://www.companyweb.be/nl/${btwNum}" target="_blank" rel="noopener" class="popup-link" style="font-size:10px">📊 CompanyWeb</a> `;
    detailHtml += `<a href="https://app.creditsafe.com/companies/BE-X-${btwNum.replace(/^0+/, "")}" target="_blank" rel="noopener" class="popup-link" style="font-size:10px">🔍 Creditsafe</a>`;
  }
  detailHtml += "</div>";

  const overlapClass = c.overlapping === "hoog" ? "conc-overlap-hoog" : c.overlapping === "midden" ? "conc-overlap-midden" : "conc-overlap-laag";

  return `
    <div class="popup-header-row">
      <div>
        <span class="popup-badge" style="background:${kleur}">${escHtml(catLabel)}</span>
        <span class="popup-prov">${escHtml(PROV_LABELS[c.provincie] || c.provincie)}</span>
      </div>
    </div>
    <span class="popup-name">${escHtml(c.naam)}</span>
    <span class="popup-info">${escHtml(c.beschrijving)}</span>
    ${c.monumenten_bewijs ? `<div class="conc-bewijs"><b>🏛 Monumentenbewijs:</b> ${escHtml(c.monumenten_bewijs)}</div>` : ""}
    ${contactHtml}
    ${detailHtml}
    <div class="conc-afstand">
      📏 <b>${km} km</b> tot Knesselare (NieuwParket)
    </div>
    <div class="conc-overlap ${overlapClass}">
      Overlapping: <b>${olLabel}</b>
    </div>
  `;
}

/* ─── Alle concurrent-markers aanmaken ─── */
function createConcurrentMarkers() {
  concurrenten.forEach(c => {
    const kleur = CONC_KLEUREN[c.categorie] || "#888";
    const m = L.marker([c.lat, c.lng], {
      icon: makeConcIcon(kleur, c.overlapping),
      zIndexOffset: 500,
    });
    m.bindPopup(() => buildConcPopup(c), { maxWidth: 360 });
    concurrentMarkers.set(c.naam, { marker: m, company: c });
  });
}

/* ─── Render: toon/verberg concurrent-markers ─── */
function renderConcurrenten() {
  concurrentMarkers.forEach(({ marker, company }) => {
    const shouldShow = concurrentLayerVisible && activeConcurrentCats.has(company.categorie);
    if (shouldShow) {
      if (!map.hasLayer(marker)) map.addLayer(marker);
    } else {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    }
  });
}

/* ─── NieuwParket eigen marker ─── */
function addNieuwParketMarker() {
  const size = 18;
  L.marker([NIEUWPARKET.lat, NIEUWPARKET.lng], {
    icon: L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="3"
          fill="#1B5E20" stroke="#fff" stroke-width="2" opacity="0.95"/>
        <text x="${size / 2}" y="${size / 2 + 1}" text-anchor="middle" dominant-baseline="middle"
          fill="#fff" font-size="9" font-weight="700">NP</text>
      </svg>`,
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    }),
    zIndexOffset: 10000,
  })
    .bindPopup(`
      <span class="popup-name" style="color:#1B5E20">🏠 ${escHtml(NIEUWPARKET.naam)}</span>
      <div class="popup-contact">
        <a href="https://www.google.com/maps/search/${encodeURIComponent(NIEUWPARKET.adres)}" target="_blank" rel="noopener" class="popup-link">📍 ${escHtml(NIEUWPARKET.adres)}</a>
      </div>
      <div class="popup-enrich"><b>Zaakvoerder:</b> ${escHtml(NIEUWPARKET.zaakvoerder)}<br>
      <b>Specialisatie:</b> Restauratie historisch parket, massief parket plaatsing<br>
      <b>Klanten:</b> Group Monument, Artes Group, Denys</div>
    `, { maxWidth: 300 })
    .addTo(map);

  // Label
  L.marker([NIEUWPARKET.lat, NIEUWPARKET.lng], {
    icon: L.divIcon({
      html: `<div style="background:#1B5E20;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(27,94,32,0.4)">NieuwParket</div>`,
      className: "",
      iconAnchor: [40, -6],
    }),
    zIndexOffset: 9999,
  }).addTo(map);
}

/* ─── Filters bouwen ─── */
function buildConcurrentFilters() {
  const row = document.getElementById("filter-concurrent");
  if (!row) return;

  // Toggle hele laag
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "fb conc-toggle on";
  toggleBtn.textContent = "◆ Concurrenten NieuwParket";
  toggleBtn.style.cssText = "background:#1B5E20;color:#fff;border-color:#1B5E20";
  toggleBtn.addEventListener("click", () => {
    concurrentLayerVisible = !concurrentLayerVisible;
    toggleBtn.classList.toggle("on", concurrentLayerVisible);
    toggleBtn.style.cssText = concurrentLayerVisible
      ? "background:#1B5E20;color:#fff;border-color:#1B5E20"
      : "";
    renderConcurrenten();
  });
  row.appendChild(toggleBtn);

  // Per categorie
  Object.entries(CONC_KLEUREN).forEach(([id, kleur]) => {
    const label = CONC_LABELS[id] || id;
    const btn = document.createElement("button");
    btn.className = "fb on";
    btn.textContent = label;
    btn.dataset.concCat = id;
    btn.style.cssText = `background:${kleur};color:${id === "premium_nieuw" ? "#333" : "#fff"};border-color:${kleur}`;
    btn.addEventListener("click", () => {
      if (activeConcurrentCats.has(id)) {
        activeConcurrentCats.delete(id);
        btn.classList.remove("on");
        btn.style.cssText = "";
      } else {
        activeConcurrentCats.add(id);
        btn.classList.add("on");
        btn.style.cssText = `background:${kleur};color:${id === "premium_nieuw" ? "#333" : "#fff"};border-color:${kleur}`;
      }
      renderConcurrenten();
    });
    row.appendChild(btn);
  });
}

/* ─── Legenda uitbreiden ─── */
function buildConcurrentLegend() {
  const el = document.getElementById("legend-content");
  if (!el) return;

  const group = document.createElement("div");
  group.className = "legend-group";
  group.innerHTML = '<span class="legend-group-title">Concurrenten NieuwParket</span>';
  const items = document.createElement("div");
  items.className = "legend-items";

  // NieuwParket zelf
  items.innerHTML += `<div class="legend-item"><div style="width:14px;height:14px;background:#1B5E20;border-radius:3px;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3);flex-shrink:0"></div><span>NieuwParket BV (referentie)</span></div>`;

  // Categorieën als ruit
  Object.entries(CONC_KLEUREN).forEach(([id, kleur]) => {
    items.innerHTML += `<div class="legend-item"><svg width="14" height="14" viewBox="0 0 14 14"><polygon points="7,1 13,7 7,13 1,7" fill="${kleur}" stroke="#fff" stroke-width="1.5"/></svg><span>${CONC_LABELS[id]}</span></div>`;
  });

  group.appendChild(items);
  el.appendChild(group);
}
