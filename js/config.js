/* Houtkaart — Configuratie & constanten */

const PROV_LABELS = {};
const ACT_KLEUR = {};

const GROOTTE_LABELS = { G: "GROTE / DOMINANTE SPELER", M: "Middelgrote speler", K: "Lokale speler" };
const GROOTTE_RADIUS = { G: 13, M: 9, K: 6 };
const REGIO_IDS = new Set(["wvl", "ovl", "ant", "vbr", "lim", "hai", "bwa", "nam", "lui", "lux"]);

const EIGEN_LOCATIES = [
  { naam: "Drongen", ll: [51.0428, 3.6388] },
  { naam: "Hertsberge", ll: [51.1065, 3.2714] },
  { naam: "Koksijde", ll: [51.1170, 2.6377] },
];

// Haversine afstand (km) — gedeeld door map.js, search.js, analyse.js
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
