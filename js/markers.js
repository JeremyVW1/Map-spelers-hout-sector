/* Houtkaart — Markers & popups */

let markers = [];

function makeIcon(col, r, isGroot) {
  const s = r * 2 + 8;
  const ring = isGroot
    ? `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 4}" fill="none" stroke="${col}" stroke-width="1.5" opacity="0.28"/>`
    : "";
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${ring}<circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${col}" stroke="white" stroke-width="1.8" opacity="0.93"/></svg>`,
    className: "", iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

function buildPopup(c) {
  const col = getActivityColor(c);
  const provLabel = PROV_LABELS[c.provincie] || c.provincie;
  const sizeLabel = GROOTTE_LABELS[c.grootte] || "Onbekend";

  // Contactgegevens uit info-veld extraheren (legacy)
  let info = c.info || "";
  let tel = "", mail = "";
  const telMatch = info.match(/📞\s*([^\s📧🌐]+)/);
  const mailMatch = info.match(/📧\s*([^\s📞🌐]+)/);
  if (telMatch) tel = telMatch[1].trim();
  if (mailMatch) mail = mailMatch[1].trim();

  // Strip contactdata uit info
  info = info
    .replace(/📍[^📞📧🌐]*/g, "").replace(/📞[^\s📧🌐]*/g, "")
    .replace(/📧[^\s📞🌐]*/g, "").replace(/🌐[^\s📞📧]*/g, "")
    .replace(/\+32[\s.\-/\d]{6,}/g, "").replace(/0\d{1,3}[\s.\-/]\d{2}[\s.\-/\d]{4,}/g, "")
    .replace(/\S+@\S+\.\S+/g, "").replace(/(?:https?:\/\/)?(?:www\.)\S+/gi, "")
    .replace(/\s*\|\s*/g, " ").replace(/\s{2,}/g, " ").trim();

  const adres = c.adres || "";
  const website = c.website || "";

  // Activiteiten
  const acts = c.activiteiten || [];
  const actLabel = acts.length > 0 ? (categorieen.find(cat => cat.id === acts[0])?.label || acts[0]) : "Onbekend";
  const allActLabels = acts.map(a => categorieen.find(cat => cat.id === a)?.label || a);

  // Contactblok
  let contactHtml = '<div class="popup-contact">';
  if (adres) {
    contactHtml += `<a href="https://www.google.com/maps/search/${encodeURIComponent(adres + ", België")}" target="_blank" rel="noopener" class="popup-link">📍 ${adres}</a>`;
  }
  if (tel) {
    contactHtml += `<a href="tel:${tel.replace(/[^+\d]/g, "")}" class="popup-link">📞 ${tel}</a>`;
  }
  if (website) {
    const url = website.startsWith("http") ? website : "https://" + website;
    contactHtml += `<a href="${url}" target="_blank" rel="noopener" class="popup-link">🌐 ${website}</a>`;
  }
  contactHtml += "</div>";

  // Verrijkte bedrijfsdata
  let enrichHtml = "";
  if (c.btw || c.omzet || c.medewerkers || c.oprichting) {
    enrichHtml = '<div class="popup-enrich">';
    if (c.groep) enrichHtml += `<b>Groep:</b> ${c.groep}<br>`;
    if (c.btw) enrichHtml += `<b>BTW:</b> ${c.btw}<br>`;
    if (c.omzet) enrichHtml += `<b>Omzet:</b> ${c.omzet}<br>`;
    if (c.medewerkers) enrichHtml += `<b>Werknemers:</b> ${c.medewerkers}<br>`;
    if (c.oprichting) enrichHtml += `<b>Opgericht:</b> ${c.oprichting}<br>`;
    if (c.rechtsvorm) enrichHtml += `<b>Vorm:</b> ${c.rechtsvorm}<br>`;
    if (c.btw) {
      enrichHtml += `<a href="https://jaarrekening.be/nl/be/${c.btw.replace(/[^0-9]/g, "")}" target="_blank" rel="noopener" class="popup-link" style="font-size:10px">📊 Jaarrekeningen bekijken</a>`;
    }
    enrichHtml += "</div>";
  }

  // Rijtijden
  let rijtijdHtml = "";
  if (c.rijtijd_hertsberge != null || c.rijtijd_drongen != null) {
    rijtijdHtml = '<div class="popup-rijtijd">';
    if (c.rijtijd_hertsberge != null) rijtijdHtml += `🚗 Hertsberge: <b>${c.rijtijd_hertsberge} min</b>`;
    if (c.rijtijd_hertsberge != null && c.rijtijd_drongen != null) rijtijdHtml += " &nbsp;|&nbsp; ";
    if (c.rijtijd_drongen != null) rijtijdHtml += `Drongen: <b>${c.rijtijd_drongen} min</b>`;
    rijtijdHtml += "</div>";
  }

  return `
    <span class="popup-badge" style="background:${col}">${actLabel}</span>
    <span class="popup-prov">${provLabel}</span>
    <span class="popup-name">${c.naam}</span>
    ${info ? `<span class="popup-info">${info}</span>` : ""}
    ${acts.length > 1 ? `<span class="popup-acts">📋 ${allActLabels.join(", ")}</span>` : ""}
    ${contactHtml}
    ${enrichHtml}
    ${rijtijdHtml}
    <span class="popup-size ${c.grootte}">${sizeLabel}</span>
  `;
}

function getActivityColor(c) {
  const acts = c.activiteiten || [];
  return acts.length === 0 ? "#888" : (ACT_KLEUR[acts[0]] || "#888");
}

function render() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  getVisibleCompanies().forEach(c => {
    const col = getActivityColor(c);
    const r = GROOTTE_RADIUS[c.grootte] || 7;
    const m = L.marker([c.lat, c.lng], { icon: makeIcon(col, r, c.grootte === "G") })
      .addTo(map)
      .bindPopup(buildPopup(c), { maxWidth: 300 });
    markers.push(m);
  });
}
