/* Houtkaart — Configuratie, constanten & gedeelde hulpfuncties */

/* ─── Constanten ─── */
const GROENE_ZONE_MIN     = 70;   // max 70 min rijden van beide locaties
const SEARCH_DEBOUNCE_MS  = 150;
const SEARCH_MAX_RESULTS  = 8;
const DEFAULT_REGIOS      = ["wvl", "ovl"];

const PROV_LABELS    = {};
const ACT_KLEUR      = {};

const GROOTTE_LABELS = { Groot: "GROTE / DOMINANTE SPELER", Middelgroot: "Middelgrote speler", Klein: "Lokale speler", Micro: "Micro-onderneming" };
const GROOTTE_SHORT  = { Groot: "Groot", Middelgroot: "Midden", Klein: "Klein", Micro: "Micro" };
const GROOTTE_LONG   = { Groot: "Groot", Middelgroot: "Middelgroot", Klein: "Klein", Micro: "Micro" };
const GROOTTE_RADIUS = { Groot: 13, Middelgroot: 10, Klein: 7, Micro: 5 };

const EIGEN_LOCATIES = [
  { naam: "Drongen",    ll: [51.0428, 3.6388] },
  { naam: "Hertsberge", ll: [51.1065, 3.2714] },
  { naam: "Koksijde",   ll: [51.1170, 2.6377] },
];

/* ─── Geo ─── */
function inGroeneZone(c) {
  // Alleen bedrijven met rijtijd data — max 70 min van beide locaties
  if (c.rijtijd_hertsberge == null || c.rijtijd_drongen == null) return false;
  return c.rijtijd_hertsberge <= GROENE_ZONE_MIN && c.rijtijd_drongen <= GROENE_ZONE_MIN;
}

/* ─── Formattering ─── */
function fmtK(n) {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000000) return sign + "€" + (abs / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (abs >= 1000)    return sign + "€" + Math.round(abs / 1000) + "K";
  return sign + "€" + Math.round(abs);
}

function escHtml(s) {
  if (s == null || s === "") return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ─── Data-helpers (hangen af van globale `categorieen`) ─── */
function actLabels(c)  { return (c.activiteiten || []).map(a => categorieen.find(cat => cat.id === a)?.label || a); }
function actLabel(c)   { return actLabels(c).join(", "); }
function sizeLabel(c)  { return GROOTTE_SHORT[c.grootte] || ""; }
function sizeLabelLong(c) { return GROOTTE_LONG[c.grootte] || ""; }
function provLabel(c)  { return PROV_LABELS[c.provincie] || c.provincie; }

function gemRijtijd(c) {
  if (c.rijtijd_hertsberge != null && c.rijtijd_drongen != null)
    return Math.round((c.rijtijd_hertsberge + c.rijtijd_drongen) / 2);
  return null;
}

function rijtijdClass(gem) {
  if (gem == null) return "";
  if (gem <= 30)  return "score-top";
  if (gem <= 45)  return "score-good";
  if (gem <= 60)  return "score-ok";
  return "";
}

function scoreText(c) {
  const gem = gemRijtijd(c);
  return gem != null ? `⌀ ${gem}'` : "";
}

function adresLinkHtml(c) {
  if (!c.adres) return "";
  const q = encodeURIComponent(c.adres);
  return `<a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${escHtml(c.adres)}</a>`;
}

function webLinkHtml(c) {
  if (!c.website) return "";
  const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
  return `<a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(c.website)}</a>`;
}

function btwLinkHtml(c) {
  if (!c.btw) return "";
  const num = c.btw.replace(/[^0-9]/g, "");
  return `<a href="https://www.companyweb.be/nl/${num}" target="_blank" rel="noopener" title="CompanyWeb">${escHtml(c.btw)}</a>`
    + ` <a href="https://app.creditsafe.com/companies/BE-X-${num.replace(/^0+/, "")}" target="_blank" rel="noopener" class="cs-link" title="Creditsafe">CS</a>`;
}

/* ─── Toast notificaties ─── */
function showToast(message, type = "info", duration = 4000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("toast-show"));
  setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}
