/* Houtkaart — Markers & popups */

let markers = [];

function makeIcon(col, r, isGroot, isFav, isOr, isRd) {
  const s = r * 2 + 8;
  const ring = isGroot
    ? `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 4}" fill="none" stroke="${col}" stroke-width="1.5" opacity="0.28"/>`
    : "";

  // Status ring: rood > oranje > favoriet
  let statusRing = "";
  let stroke = "white", strokeW = 1.8;
  if (isRd) {
    statusRing = `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 2}" fill="none" stroke="#c62828" stroke-width="2.5" opacity="0.8"/>`;
    stroke = "#c62828"; strokeW = 2;
  } else if (isOr) {
    statusRing = `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 2}" fill="none" stroke="#e65100" stroke-width="2.5" opacity="0.8"/>`;
    stroke = "#e65100"; strokeW = 2;
  } else if (isFav) {
    statusRing = `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 2}" fill="none" stroke="#f9a825" stroke-width="1.5" opacity="0.5"/>`;
    stroke = "#f9a825"; strokeW = 2.5;
  }

  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">${ring}${statusRing}<circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${col}" stroke="${stroke}" stroke-width="${strokeW}" opacity="0.93"/></svg>`,
    className: "", iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

function buildPopup(c) {
  const col       = getActivityColor(c);
  const prov      = provLabel(c);
  const sizeText  = GROOTTE_LABELS[c.grootte] || "Onbekend";
  const acts      = c.activiteiten || [];
  const actFirst  = acts.length > 0 ? (categorieen.find(cat => cat.id === acts[0])?.label || acts[0]) : "Onbekend";
  const allActs   = actLabels(c);

  // Contactgegevens uit info-veld (legacy)
  let info = c.info || "";
  let tel = "", mail = "";
  const telMatch  = info.match(/📞\s*([^\s📧🌐]+)/);
  const mailMatch = info.match(/📧\s*([^\s📞🌐]+)/);
  if (telMatch)  tel  = telMatch[1].trim();
  if (mailMatch) mail = mailMatch[1].trim();

  info = info
    .replace(/📍[^📞📧🌐]*/g, "").replace(/📞[^\s📧🌐]*/g, "")
    .replace(/📧[^\s📞🌐]*/g, "").replace(/🌐[^\s📞📧]*/g, "")
    .replace(/\+32[\s.\-/\d]{6,}/g, "").replace(/0\d{1,3}[\s.\-/]\d{2}[\s.\-/\d]{4,}/g, "")
    .replace(/\S+@\S+\.\S+/g, "").replace(/(?:https?:\/\/)?(?:www\.)\S+/gi, "")
    .replace(/\s*\|\s*/g, " ").replace(/\s{2,}/g, " ").trim();

  const adres   = c.adres || "";
  const website = c.website || "";

  // Contactblok
  let contactHtml = '<div class="popup-contact">';
  if (adres)   contactHtml += `<a href="https://www.google.com/maps/search/${encodeURIComponent(adres + ", België")}" target="_blank" rel="noopener" class="popup-link">📍 ${escHtml(adres)}</a>`;
  if (tel)     contactHtml += `<a href="tel:${tel.replace(/[^+\d]/g, "")}" class="popup-link">📞 ${escHtml(tel)}</a>`;
  if (website) { const url = website.startsWith("http") ? website : "https://" + website; contactHtml += `<a href="${url}" target="_blank" rel="noopener" class="popup-link">🌐 ${escHtml(website)}</a>`; }
  contactHtml += "</div>";

  // Verrijkte bedrijfsdata
  let enrichHtml = "";
  if (c.btw || c.omzet || c.medewerkers || c.oprichting) {
    enrichHtml = '<div class="popup-enrich">';
    if (c.groep)      enrichHtml += `<b>Groep:</b> ${escHtml(c.groep)}<br>`;
    if (c.btw)        enrichHtml += `<b>BTW:</b> ${escHtml(c.btw)}<br>`;
    if (c.omzet)      enrichHtml += `<b>Omzet:</b> ${escHtml(c.omzet)}<br>`;
    if (c.medewerkers) enrichHtml += `<b>Werknemers:</b> ${escHtml(c.medewerkers)}<br>`;
    if (c.oprichting) enrichHtml += `<b>Opgericht:</b> ${escHtml(c.oprichting)}<br>`;
    if (c.rechtsvorm) enrichHtml += `<b>Vorm:</b> ${escHtml(c.rechtsvorm)}<br>`;
    if (c.btw)        enrichHtml += `<a href="https://www.companyweb.be/nl/${c.btw.replace(/[^0-9]/g, "")}" target="_blank" rel="noopener" class="popup-link" style="font-size:10px">📊 Jaarrekeningen bekijken</a>`;
    enrichHtml += "</div>";
  }

  // CompanyWeb financieel
  let finHtml = "";
  if (c.cw_brutomarge != null || c.cw_omzet != null || c.cw_winst != null || c.cw_fte != null) {
    const yr = c.cw_jaar ? ` (${c.cw_jaar})` : "";
    finHtml = `<div class="popup-financials">
      <div class="popup-fin-title">📊 Financieel${yr}</div>
      ${c.cw_omzet != null      ? `<span class="popup-fin-item"><b>Omzet:</b> ${fmtK(c.cw_omzet)}</span>` : ""}
      ${c.cw_brutomarge != null  ? `<span class="popup-fin-item"><b>Brutomarge:</b> ${fmtK(c.cw_brutomarge)}</span>` : ""}
      ${c.cw_winst != null       ? `<span class="popup-fin-item"><b>Winst:</b> <span class="${c.cw_winst >= 0 ? "fin-pos" : "fin-neg"}">${fmtK(c.cw_winst)}</span></span>` : ""}
      ${c.cw_fte != null         ? `<span class="popup-fin-item"><b>Personeel:</b> ${c.cw_fte} FTE</span>` : ""}
    </div>`;
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

  const isFav = isFavorite(c.naam);
  const isOr  = isOrange(c.naam);
  const isRd  = isRed(c.naam);
  const hasStatus = isFav || isOr || isRd;

  // Als er een status is: toon alleen die knop. Anders: toon alle 3.
  let actionsHtml = "";
  if (!hasStatus) {
    actionsHtml = `
      <button class="star-btn" data-naam="${escHtml(c.naam)}" title="Favoriet">☆</button>
      <button class="orange-btn" data-naam="${escHtml(c.naam)}" title="Twijfel">?</button>
      <button class="red-btn" data-naam="${escHtml(c.naam)}" title="Niet interessant">✕</button>`;
  } else if (isFav) {
    actionsHtml = `<button class="star-btn starred" data-naam="${escHtml(c.naam)}" title="Verwijder uit favorieten">★</button>`;
  } else if (isOr) {
    actionsHtml = `<button class="orange-btn marked-orange" data-naam="${escHtml(c.naam)}" title="Verwijder twijfel">?</button>`;
  } else if (isRd) {
    actionsHtml = `<button class="red-btn marked-red" data-naam="${escHtml(c.naam)}" title="Verwijder niet-interessant">✕</button>`;
  }

  return `
    <div class="popup-header-row">
      <div>
        <span class="popup-badge" style="background:${col}">${escHtml(actFirst)}</span>
        <span class="popup-prov">${escHtml(prov)}</span>
      </div>
      <div class="popup-actions">${actionsHtml}</div>
    </div>
    <span class="popup-name">${escHtml(c.naam)}</span>
    ${info ? `<span class="popup-info">${escHtml(info)}</span>` : ""}
    ${acts.length > 1 ? `<span class="popup-acts">📋 ${escHtml(allActs.join(", "))}</span>` : ""}
    ${contactHtml}
    ${enrichHtml}
    ${finHtml}
    ${rijtijdHtml}
    <span class="popup-size ${c.grootte}">${escHtml(sizeText)}</span>
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
    const r   = GROOTTE_RADIUS[c.grootte] || 7;
    const m   = L.marker([c.lat, c.lng], {
      icon: makeIcon(col, r, c.grootte === "Groot", isFavorite(c.naam), isOrange(c.naam), isRed(c.naam))
    }).addTo(map).bindPopup(buildPopup(c), { maxWidth: 300 });

    m.on("popupopen", () => {
      const popup = document.querySelector(".leaflet-popup");
      if (!popup) return;

      const starBtn = popup.querySelector(".star-btn");
      if (starBtn) starBtn.addEventListener("click", e => {
        e.stopPropagation(); e.preventDefault();
        toggleFavorite(c);
      });

      const orangeBtn = popup.querySelector(".orange-btn");
      if (orangeBtn) orangeBtn.addEventListener("click", e => {
        e.stopPropagation(); e.preventDefault();
        toggleOrange(c);
        m.closePopup();
        render();
      });

      const redBtn = popup.querySelector(".red-btn");
      if (redBtn) redBtn.addEventListener("click", e => {
        e.stopPropagation(); e.preventDefault();
        toggleRed(c);
        m.closePopup();
        render();
      });
    });
    markers.push(m);
  });
}
