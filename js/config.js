/* ═══════════════════════════════════════════
   Houtkaart — Configuratie & constanten
   ═══════════════════════════════════════════ */

const KLEUR_MAP = {};
const PROV_LABELS = {};

const GROOTTE_LABELS = {
  G: "GROTE / DOMINANTE SPELER",
  M: "Middelgrote speler",
  K: "Lokale speler",
};

const GROOTTE_RADIUS = { G: 13, M: 9, K: 6 };

const REGIO_IDS = new Set(["wvl", "ovl", "ant", "vbr", "lim", "hai", "bwa", "nam"]);

const EIGEN_LOCATIES = [
  { naam: "Drongen", ll: [51.0536, 3.6536] },
  { naam: "Hertsberghe", ll: [51.1292, 3.2031] },
  { naam: "Koksijde", ll: [51.0900, 2.6522] },
];
