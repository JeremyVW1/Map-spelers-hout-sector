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

// ─── Doelgebied (overlap max 1u rijden) ──────
function addTargetZone() {
  const h = EIGEN_LOCATIES[1].ll; // Hertsberghe
  const d = EIGEN_LOCATIES[0].ll; // Drongen
  const maxKm = 38; // ~50km weg / 1.3 omwegfactor

  const midLat = (h[0] + d[0]) / 2;
  const midLng = (h[1] + d[1]) / 2;
  const points = [];

  for (let angle = 0; angle < 360; angle += 5) {
    for (let r = maxKm; r > 0; r -= 2) {
      const lat = midLat + (r / 111) * Math.cos((angle * Math.PI) / 180);
      const lng = midLng + (r / (111 * Math.cos((midLat * Math.PI) / 180))) * Math.sin((angle * Math.PI) / 180);
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
function addOwnLocations() {
  EIGEN_LOCATIES.forEach((loc) => {
    L.circle(loc.ll, {
      radius: 2500, color: "#8B1A1A", fillColor: "#8B1A1A",
      fillOpacity: 0.07, weight: 2, dashArray: "7,4",
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
