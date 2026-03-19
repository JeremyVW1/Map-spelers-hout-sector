/* ═══════════════════════════════════════════
   Houtkaart — Markers & popups
   ═══════════════════════════════════════════ */

let markers = [];

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

function buildPopup(c) {
  const col = getActivityColor(c);
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
    if (adresMatch) contactHtml += `📍 ${adresMatch[1].trim()}<br>`;
    if (telMatch) contactHtml += `📞 ${telMatch[1].trim()}<br>`;
    if (mailMatch) contactHtml += `📧 ${mailMatch[1].trim()}<br>`;
    if (webMatch) contactHtml += `🌐 ${webMatch[1].trim()}`;
    contactHtml += "</div>";

    info = info
      .replace(/📍[^📞📧🌐]*/g, "")
      .replace(/📞[^\s📧🌐]*/g, "")
      .replace(/📧[^\s📞🌐]*/g, "")
      .replace(/🌐[^\s📞📧]*/g, "")
      .replace(/\s*\|\s*/g, " ")
      .trim();
  }

  const hasWarning = info.includes("⚠️");
  const infoClass = hasWarning ? "popup-info popup-warning" : "popup-info";

  // Verrijkte KBO data
  let enrichHtml = "";
  if (c.btw || c.groep_btw) {
    enrichHtml += '<div class="popup-enrich">';
    if (c.groep) enrichHtml += `<b>Groep:</b> ${c.groep}<br>`;
    enrichHtml += `<b>BTW:</b> ${c.btw || c.groep_btw || "?"}<br>`;
    if (c.groep_omzet) enrichHtml += `<b>Omzet:</b> ${c.groep_omzet}<br>`;
    const fte = c.medewerkers || c.groep_medewerkers;
    if (fte) enrichHtml += `<b>FTE:</b> ${fte}<br>`;
    if (c.rechtsvorm || c.groep_rechtsvorm)
      enrichHtml += `<b>Vorm:</b> ${c.rechtsvorm || c.groep_rechtsvorm}<br>`;
    enrichHtml += "</div>";
  }

  const acts = c.activiteiten || [];
  const actLabel = acts.length > 0
    ? categorieen.find((cat) => cat.id === acts[0])?.label || acts[0]
    : "Onbekend";

  return `
    <span class="popup-badge" style="background:${col}">${actLabel}</span>
    <span class="popup-prov">${provLabel}</span>
    <span class="popup-name">${c.naam}</span>
    <span class="popup-coords">📍 ${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}</span>
    <span class="${infoClass}">${info}</span>
    ${contactHtml}
    ${enrichHtml}
    <span class="popup-webshop">🌐 Webshop: <b>${c.webshop}</b></span>
    <span class="popup-size ${c.grootte}">${sizeLabel}</span>
  `;
}

function getActivityColor(c) {
  const acts = c.activiteiten || [];
  if (acts.length === 0) return "#888";
  return ACT_KLEUR[acts[0]] || "#888";
}

function render() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  const visible = getVisibleCompanies();
  visible.forEach((c) => {
    const col = getActivityColor(c);
    const r = GROOTTE_RADIUS[c.grootte] || 7;
    const icon = makeIcon(col, r, c.grootte === "G");
    const m = L.marker([c.lat, c.lng], { icon })
      .addTo(map)
      .bindPopup(buildPopup(c), { maxWidth: 300 });
    markers.push(m);
  });
}
