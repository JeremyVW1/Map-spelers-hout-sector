/* ═══════════════════════════════════════════
   Houtkaart — Configuratie & constanten
   ═══════════════════════════════════════════ */

const KLEUR_MAP = {};
const PROV_LABELS = {};
const ACT_KLEUR = {}; // activiteit → kleur mapping

const GROOTTE_LABELS = {
  G: "GROTE / DOMINANTE SPELER",
  M: "Middelgrote speler",
  K: "Lokale speler",
};

const GROOTTE_RADIUS = { G: 13, M: 9, K: 6 };

const REGIO_IDS = new Set(["wvl", "ovl", "ant", "vbr", "lim", "hai", "bwa", "nam"]);

const EIGEN_LOCATIES = [
  { naam: "Drongen", ll: [51.0428, 3.6388] },           // Sint-Gerolfstraat 43
  { naam: "Hertsberge", ll: [51.1065, 3.2714] },        // Rapaertstraat
  { naam: "Koksijde", ll: [51.1170, 2.6377] },            // Zeelaan 200
];
