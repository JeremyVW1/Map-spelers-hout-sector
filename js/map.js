/* ═══════════════════════════════════════════
   Houtkaart — Kaart, doelgebied & eigen locaties
   ═══════════════════════════════════════════ */

let map;

function initMap() {
  map = L.map("map", {
    center: [50.8, 4.2],
    zoom: 8,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Wallonië achtergrond
  L.rectangle([[49.4, 2.5], [50.75, 6.4]], {
    color: "#880E4F", weight: 0,
    fillColor: "#f0e6ec", fillOpacity: 0.08,
  }).addTo(map);

  addTargetZone();
  addOwnLocations();
}

// ─── Haversine afstand (km) ──────────────────
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Belgisch-Nederlandse grens (west → oost) ─
// Vereenvoudigde maar nauwkeurige grenscoördinaten
const BE_NL_GRENS = [
  [51.3753, 2.5390],  // Kust – De Panne / Sluis
  [51.3480, 3.3680],  // Zeeuws-Vlaanderen west
  [51.3760, 3.3850],  // Sas van Gent
  [51.3480, 3.4480],  // Zelzate
  [51.3660, 3.5850],  // Kanaal Terneuzen
  [51.3920, 3.8300],  // Hulst omgeving
  [51.4260, 4.0200],  // Kieldrecht / Doel
  [51.4480, 4.2400],  // Essen grensovergang
  [51.4960, 4.3700],  // Essen – Nispen
  [51.4830, 4.5200],  // Merksplas
  [51.4420, 4.6300],  // Turnhout-noord
  [51.4480, 4.7800],  // Ravels
  [51.4870, 4.9400],  // Hilvarenbeek
  [51.4380, 5.0400],  // Poppel / Reusel
  [51.4470, 5.2200],  // Postel
  [51.3970, 5.3700],  // Lommel-noord
  [51.3720, 5.4700],  // Overpelt
  [51.3260, 5.5800],  // Hamont
  [51.2400, 5.7000],  // Kinrooi
  [51.1700, 5.8600],  // Maaseik – Echt
];

// Check of een punt boven de BE-NL grens ligt (= in Nederland)
function isAboveBorder(lat, lng) {
  // Zoek de twee dichtstbijzijnde grenspunten qua lengtegraad
  if (lng < BE_NL_GRENS[0][1] || lng > BE_NL_GRENS[BE_NL_GRENS.length - 1][1]) {
    return lat > 51.35; // fallback buiten grensdata
  }
  for (let i = 0; i < BE_NL_GRENS.length - 1; i++) {
    const [lat1, lng1] = BE_NL_GRENS[i];
    const [lat2, lng2] = BE_NL_GRENS[i + 1];
    if (lng >= lng1 && lng <= lng2) {
      // Lineair interpoleren
      const t = (lng - lng1) / (lng2 - lng1);
      const grensLat = lat1 + t * (lat2 - lat1);
      return lat > grensLat;
    }
  }
  return lat > 51.35;
}

// ─── Doelgebied (overlap max 1u rijden) ──────
function addTargetZone() {
  const h = EIGEN_LOCATIES[1].ll; // Hertsberge (Rapaertstraat)
  const d = EIGEN_LOCATIES[0].ll; // Drongen (Sint-Gerolfstraat)
  const maxKm = 40; // OSRM-gevalideerd: alle randpunten < 60min rijden

  const midLat = (h[0] + d[0]) / 2;
  const midLng = (h[1] + d[1]) / 2;
  const points = [];

  for (let angle = 0; angle < 360; angle += 2) {
    for (let r = maxKm; r > 0; r -= 1) {
      const lat = midLat + (r / 111) * Math.cos((angle * Math.PI) / 180);
      const lng = midLng + (r / (111 * Math.cos((midLat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);
      if (isAboveBorder(lat, lng)) continue; // niet in Nederland
      if (distKm(lat, lng, h[0], h[1]) <= maxKm &&
          distKm(lat, lng, d[0], d[1]) <= maxKm) {
        points.push([lat, lng]);
        break;
      }
    }
  }

  if (points.length > 2) {
    L.polygon(points, {
      color: "#2E7D32", weight: 2,
      fillColor: "#4CAF50", fillOpacity: 0.08,
      dashArray: "8,4",
    }).addTo(map);
  }
}

// ─── Eigen locatie markers ───────────────────
const ownLabelMarkers = [];

function addOwnLocations() {
  EIGEN_LOCATIES.forEach((loc) => {
    L.circle(loc.ll, {
      radius: 2500, color: "#8B1A1A", fillColor: "#8B1A1A",
      fillOpacity: 0.07, weight: 2, dashArray: "7,4",
    }).addTo(map);

    // Vast pijltje (altijd zichtbaar, klein)
    L.marker(loc.ll, {
      icon: L.divIcon({
        html: `<div style="color:#8B1A1A;font-size:14px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.3)">▼</div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 0],
      }),
      zIndexOffset: 9999,
    }).addTo(map);

    // Label met naam (alleen bij voldoende zoom)
    const label = L.marker(loc.ll, {
      icon: L.divIcon({
        html: `<div class="own-marker" style="background:#8B1A1A;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(139,26,26,0.4)">${loc.naam}</div>`,
        className: "",
        iconAnchor: [30, -4],
      }),
      zIndexOffset: 9998,
    });
    ownLabelMarkers.push(label);
  });

  // Toon/verberg labels op basis van zoomniveau
  function updateOwnLabels() {
    const zoom = map.getZoom();
    ownLabelMarkers.forEach((m) => {
      if (zoom >= 10) {
        if (!map.hasLayer(m)) map.addLayer(m);
      } else {
        if (map.hasLayer(m)) map.removeLayer(m);
      }
    });
  }

  map.on("zoomend", updateOwnLabels);
  updateOwnLabels();
}
