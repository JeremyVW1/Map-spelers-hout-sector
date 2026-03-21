/* Houtkaart — Kaart, doelgebied & eigen locaties */

let map;

function initMap() {
  map = L.map("map", { center: [50.8, 4.2], zoom: 8, zoomControl: true, scrollWheelZoom: true });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Wallonië achtergrond
  L.rectangle([[49.4, 2.5], [50.75, 6.4]], {
    color: "#880E4F", weight: 0, fillColor: "#f0e6ec", fillOpacity: 0.08,
  }).addTo(map);

  addTargetZone();
  addOwnLocations();
}

// Belgisch-Nederlandse grens (west → oost)
const BE_NL_GRENS = [
  [51.3753, 2.5390], [51.3480, 3.3680], [51.3760, 3.3850], [51.3480, 3.4480],
  [51.3660, 3.5850], [51.3920, 3.8300], [51.4260, 4.0200], [51.4480, 4.2400],
  [51.4960, 4.3700], [51.4830, 4.5200], [51.4420, 4.6300], [51.4480, 4.7800],
  [51.4870, 4.9400], [51.4380, 5.0400], [51.4470, 5.2200], [51.3970, 5.3700],
  [51.3720, 5.4700], [51.3260, 5.5800], [51.2400, 5.7000], [51.1700, 5.8600],
];

function isAboveBorder(lat, lng) {
  if (lng < BE_NL_GRENS[0][1] || lng > BE_NL_GRENS[BE_NL_GRENS.length - 1][1]) return lat > 51.35;
  for (let i = 0; i < BE_NL_GRENS.length - 1; i++) {
    const [lat1, lng1] = BE_NL_GRENS[i];
    const [lat2, lng2] = BE_NL_GRENS[i + 1];
    if (lng >= lng1 && lng <= lng2) {
      const grensLat = lat1 + ((lng - lng1) / (lng2 - lng1)) * (lat2 - lat1);
      return lat > grensLat;
    }
  }
  return lat > 51.35;
}

// Doelgebied: convex hull rond alle bedrijven met rijtijd ≤70 min + marge
function addTargetZone() {
  // Verzamel alle bedrijven in de groene zone
  const pts = bedrijven
    .filter(c => inGroeneZone(c))
    .map(c => [c.lat, c.lng]);

  if (pts.length < 3) return;

  // Convex hull (Graham scan)
  const hull = _convexHull(pts);
  if (hull.length < 3) return;

  // Maak de vorm zachter: voeg marge toe (~5km) en smooth
  const center = hull.reduce((a, p) => [a[0] + p[0] / hull.length, a[1] + p[1] / hull.length], [0, 0]);
  const expanded = hull.map(p => {
    const dx = p[0] - center[0];
    const dy = p[1] - center[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    const margin = 0.045; // ~5km in graden
    return [
      p[0] + (dx / dist) * margin,
      p[1] + (dy / dist) * margin,
    ];
  });

  // Filter punten boven BE-NL grens
  const clipped = expanded.map(p => isAboveBorder(p[0], p[1]) ? _clipToBorder(p, center) : p);

  L.polygon(clipped, {
    color: "#2E7D32", weight: 2, fillColor: "#4CAF50", fillOpacity: 0.08, dashArray: "8,4",
  }).addTo(map);
}

function _clipToBorder(point, center) {
  // Schuif punt naar beneden tot net onder de grens
  let [lat, lng] = point;
  for (let i = 0; i < 50; i++) {
    lat -= 0.005;
    if (!isAboveBorder(lat, lng)) return [lat, lng];
  }
  return [lat, lng];
}

function _convexHull(points) {
  const pts = points.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  if (pts.length <= 2) return pts;

  function cross(O, A, B) {
    return (A[0] - O[0]) * (B[1] - O[1]) - (A[1] - O[1]) * (B[0] - O[0]);
  }

  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) upper.pop();
    upper.push(pts[i]);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Eigen locatie markers
const ownLabelMarkers = [];

function addOwnLocations() {
  EIGEN_LOCATIES.forEach((loc) => {
    L.circle(loc.ll, {
      radius: 2500, color: "#8B1A1A", fillColor: "#8B1A1A",
      fillOpacity: 0.07, weight: 2, dashArray: "7,4",
    }).addTo(map);

    L.marker(loc.ll, {
      icon: L.divIcon({
        html: '<div style="color:#8B1A1A;font-size:14px;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.3)">▼</div>',
        className: "", iconSize: [14, 14], iconAnchor: [7, 0],
      }),
      zIndexOffset: 9999,
    }).addTo(map);

    const label = L.marker(loc.ll, {
      icon: L.divIcon({
        html: `<div class="own-marker" style="background:#8B1A1A;color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(139,26,26,0.4)">${loc.naam}</div>`,
        className: "", iconAnchor: [30, -4],
      }),
      zIndexOffset: 9998,
    });
    ownLabelMarkers.push(label);
  });

  function updateOwnLabels() {
    const zoom = map.getZoom();
    ownLabelMarkers.forEach((m) => {
      if (zoom >= 10) { if (!map.hasLayer(m)) map.addLayer(m); }
      else { if (map.hasLayer(m)) map.removeLayer(m); }
    });
  }
  map.on("zoomend", updateOwnLabels);
  updateOwnLabels();
}
