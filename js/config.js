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

function webLinkHtml(c) {
  if (!c.website) return "";
  const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
  return `<a href="${url}" target="_blank" rel="noopener">${escHtml(c.website)}</a>`;
}

function btwLinkHtml(c) {
  if (!c.btw) return "";
  const num = c.btw.replace(/[^0-9]/g, "");
  return `<a href="https://www.companyweb.be/nl/${num}" target="_blank" rel="noopener">${escHtml(c.btw)}</a>`;
}

/* ─── Gedeelde tabel-rij bouwer ─── */
function buildTableRow(c, opts) {
  const gem = gemRijtijd(c);
  const sc  = rijtijdClass(gem);
  const st  = scoreText(c);
  const isFav = isFavorite(c.naam);
  const isOr  = isOrange(c.naam);
  const isRd  = isRed(c.naam);
  const hasStatus = isFav || isOr || isRd;

  let statusHtml = "";
  if (!hasStatus) {
    statusHtml = `
      <button class="star-btn" data-naam="${escHtml(c.naam)}" title="Favoriet">☆</button>
      <button class="orange-btn" data-naam="${escHtml(c.naam)}" title="Twijfel">?</button>
      <button class="red-btn" data-naam="${escHtml(c.naam)}" title="Niet interessant">✕</button>`;
  } else if (isFav) {
    statusHtml = `<button class="star-btn starred" data-naam="${escHtml(c.naam)}" title="Verwijder uit favorieten">★</button>`;
  } else if (isOr) {
    statusHtml = `<button class="orange-btn marked-orange" data-naam="${escHtml(c.naam)}" title="Verwijder twijfel">?</button>`;
  } else if (isRd) {
    statusHtml = `<button class="red-btn marked-red" data-naam="${escHtml(c.naam)}" title="Verwijder niet-interessant">✕</button>`;
  }

  let h = "";
  if (opts.rang != null) h += `<td class="top15-rang">${opts.rang}</td>`;
  h += `<td class="td-status">${statusHtml}</td>`;
  h += `<td class="td-naam">${escHtml(c.naam)}${c.bron === "bizzy" ? ' <span class="bizzy-badge">B</span>' : ""}</td>`;
  h += `<td>${provLabel(c)}</td>`;
  h += `<td>${escHtml(actLabel(c))}</td>`;
  h += `<td><span class="size-badge ${c.grootte}">${sizeLabel(c)}</span></td>`;

  // Financieel
  h += `<td class="td-num">${c.cw_omzet ? fmtK(c.cw_omzet) : ""}</td>`;
  h += `<td class="td-num">${c.cw_brutomarge ? fmtK(c.cw_brutomarge) : ""}</td>`;
  h += `<td class="td-num" style="color:#1565C0;font-weight:600">${c.bizzy_ebitda ? fmtK(c.bizzy_ebitda) : ""}</td>`;
  h += `<td class="td-num" style="color:#1565C0">${c.bizzy_revenue ? fmtK(c.bizzy_revenue) : ""}</td>`;
  const wClass = c.cw_winst != null ? (c.cw_winst >= 0 ? "fin-pos" : "fin-neg") : "";
  h += `<td class="td-num ${wClass}">${c.cw_winst != null ? fmtK(c.cw_winst) : ""}</td>`;
  h += `<td class="td-num" style="color:#1565C0">${c.bizzy_fte != null ? c.bizzy_fte : ""}</td>`;
  h += `<td class="td-num">${c.cw_fte != null ? c.cw_fte : ""}</td>`;

  h += `<td class="td-adres">${escHtml(c.adres || "")}</td>`;
  h += `<td class="td-btw">${btwLinkHtml(c)}</td>`;
  h += `<td class="td-web">${webLinkHtml(c)}</td>`;
  h += `<td class="td-num">${c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge + "'" : ""}</td>`;
  h += `<td class="td-num">${c.rijtijd_drongen != null ? c.rijtijd_drongen + "'" : ""}</td>`;
  h += `<td class="td-num td-dichtste ${sc}">${st}</td>`;

  // Extra kolommen
  if (opts.top15) {
    h += `<td class="top15-digitaal">${escHtml(opts.digitaal || "")}</td>`;
    h += `<td class="top15-notitie">${escHtml(opts.notitie || "")}</td>`;
  }
  if (opts.showNotes) {
    h += `<td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="jeremy" placeholder="Notitie Jeremy…">${escHtml(favNotes[c.naam] || "")}</textarea></td>`;
    h += `<td class="td-notes"><textarea class="fav-note" data-naam="${escHtml(c.naam)}" data-who="vincent" placeholder="Notitie Vincent…">${escHtml(favNotesVincent[c.naam] || "")}</textarea></td>`;
  }
  return h;
}

/* ─── Gedeelde CSV bouwer ─── */
function buildCSV(data, extraCols) {
  const base = ["Naam", "Regio", "Activiteiten", "Grootte", "Omzet (CW)", "Brutomarge (CW)", "EBITDA (Bizzy)", "Omzet (Bizzy)", "Winst (CW)", "FTE (Bizzy)", "FTE (CW)", "Adres", "BTW", "Website", "Rijtijd Hertsberge", "Rijtijd Drongen", "Gem. rijtijd H+D"];
  const header = extraCols ? [...base, ...extraCols] : base;

  const rows = data.map(c => {
    const baseRow = [
      c.naam, provLabel(c), actLabel(c), sizeLabelLong(c),
      c.cw_omzet || "", c.cw_brutomarge || "", c.bizzy_ebitda != null ? c.bizzy_ebitda : "", c.bizzy_revenue != null ? c.bizzy_revenue : "", c.cw_winst != null ? c.cw_winst : "", c.bizzy_fte != null ? c.bizzy_fte : "", c.cw_fte != null ? c.cw_fte : "",
      c.adres || "", c.btw || "", c.website || "",
      c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge : "",
      c.rijtijd_drongen != null ? c.rijtijd_drongen : "",
      gemRijtijd(c) != null ? gemRijtijd(c) : "",
    ];
    return baseRow;
  });
  return [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Gedeelde event handlers ─── */
function attachStarHandlers(container) {
  container.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      const c = bedrijvenMap.get(btn.dataset.naam);
      if (c) toggleFavorite(c);
    });
  });
}

function attachNoteHandlers(container) {
  container.querySelectorAll(".fav-note").forEach(ta => {
    ta.addEventListener("input", () => saveNote(ta.dataset.naam, ta.value, ta.dataset.who || "jeremy"));
  });
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
