/* Houtkaart — Analyse tab */

let analyseSortKey = "dichtste";
let analyseSortAsc = true;
let analyseActiveActs = new Set();
let analyseActiveRegios = new Set();

/* ───── Top 15 Overnamekandidaten ───── */
const TOP15 = [
  {
    rang: 1, naam: "Eurowood", adres: "Rijksweg 442, 8710 Wielsbeke",
    btw: "BE 0433.136.771", website: "eurowoodnv.be", opgericht: "1867",
    fte: 3.4, brutomarge: 755000, est_ebitda: "~€590K",
    activiteit: "Eiken import/handel", grootte: "M",
    digitaal: "Basis website, geen webshop",
    notitie: "5 generaties familiebedrijf, specialist Europees eiken. Zeer hoge marge per FTE (€222K). Klein team = behapbaar. Niche-speler met sterk netwerk."
  },
  {
    rang: 2, naam: "Parket Vanrobaeys", adres: "Flandria 2, 8750 Zwevezele (Wingene)",
    btw: "BE 0472.360.405", website: "parketvanrobaeys.be", opgericht: "2000",
    fte: 3, brutomarge: 649000, est_ebitda: "~€505K",
    activiteit: "Parket plaatsing & renovatie", grootte: "M",
    digitaal: "Eenvoudige website, geen webshop",
    notitie: "Hoge marge per FTE (€216K). Slechts 3 FTE = ideaal voor 2 overnemers. Parket is hoge-marge niche. Ruimte voor digitalisering en groei."
  },
  {
    rang: 3, naam: "Botanica Wood", adres: "Iepersestraat 459, 8800 Roeselare",
    btw: "BE 0444.953.846", website: "botanica-wood.be", opgericht: "1991",
    fte: 6.4, brutomarge: 906000, est_ebitda: "~€600K",
    activiteit: "Hout & weideafsluitingen", grootte: "M",
    digitaal: "Oudere website, geen webshop",
    notitie: "Sterke brutomarge €906K met beperkt team. Actief in afsluitingen (agro) = stabiele vraag. Opgericht 1991, mogelijk opvolgingsvraag."
  },
  {
    rang: 4, naam: "Bouwmaterialen Leus (Melle)", adres: "Veerweg 54, 9090 Melle",
    btw: "BE 0469.391.809", website: "leus.be", opgericht: "1999",
    fte: 5, brutomarge: 908000, est_ebitda: "~€670K",
    activiteit: "Bouwmaterialen + hout", grootte: "M",
    digitaal: "Professionele website, geen webshop",
    notitie: "Familiebedrijf 100+ jaar ervaring. Brutomarge €908K, 5 FTE. Breed assortiment (bouw + hout). Ruimte voor e-commerce en digitale bestelling."
  },
  {
    rang: 5, naam: "Woodsome", adres: "Kortrijksestraat 102A, 8860 Lendelede",
    btw: "BE 0462.698.809", website: "woodsome.be", opgericht: "1998",
    fte: 13, brutomarge: 1283000, est_ebitda: "~€660K",
    activiteit: "Schrijnwerk & houtbewerking", grootte: "M",
    digitaal: "Basis website",
    notitie: "Brutomarge €1,28M. 13 FTE is groter team maar ook hogere capaciteit. Schrijnwerk = hogere toegevoegde waarde. Ruimte voor procesoptimalisatie."
  },
  {
    rang: 6, naam: "Cornelis Hout", adres: "Noorwegenstraat 53, 9940 Evergem",
    btw: "BE 0417.760.489", website: "cornelishout.be", opgericht: "1977",
    fte: 7, brutomarge: 1734000, est_ebitda: "~€750K+",
    activiteit: "Houten bijgebouwen op maat", grootte: "M",
    digitaal: "Moderne website, geen webshop",
    notitie: "5e generatie, brutomarge €1,73M! Mogelijk boven target EBITDA. Producent carports/poolhouses. Sterk merk in regio. Topkandidaat als EBITDA in range valt."
  },
  {
    rang: 7, naam: "Houthandel Vanhaverbeke", adres: "Ambachtenstraat 22, 8870 Izegem",
    btw: "BE 0424.854.258", website: "hout-vanhaverbeke.be", opgericht: "1983",
    fte: 8.3, brutomarge: null, est_ebitda: "Te onderzoeken",
    activiteit: "Houthandel breed assortiment", grootte: "M",
    digitaal: "Basis website, geen webshop",
    notitie: "5 generaties houthandel. 8 FTE, geen omzet gepubliceerd. Traditioneel familiebedrijf = typisch overnamekandidaat. Verder financieel onderzoek nodig."
  },
  {
    rang: 8, naam: "Houtbouw Defreyne", adres: "Steenovenstraat 5, 8850 Ardooie",
    btw: "BE 0429.145.717", website: "defreyne.be", opgericht: "1986",
    fte: 5.9, brutomarge: null, est_ebitda: "Te onderzoeken",
    activiteit: "Houtbouw & tuinconstructies", grootte: "M",
    digitaal: "Nette website, geen webshop",
    notitie: "Producent tuinhuizen, carports, pergola's. 6 FTE, eigen atelier. Productie = hogere marge dan handel. Opgericht 1986 → mogelijk opvolgingsvraag."
  },
  {
    rang: 9, naam: "Goeminne Tuinhout", adres: "Kerkstraat 88, 9890 Gavere",
    btw: "BE 0446.722.414", website: "goeminnetuinhout.be", opgericht: "1992",
    fte: 5.4, brutomarge: null, est_ebitda: "Te onderzoeken",
    activiteit: "Tuinhout specialist", grootte: "M",
    digitaal: "Basis website, geen webshop",
    notitie: "Specialist in tuinhout. 5 FTE = behapbaar. Dicht bij Drongen. Niche met stabiele vraag. Geen gepubliceerde financiën → verder onderzoek."
  },
  {
    rang: 10, naam: "Tieltse Houthandel", adres: "Deinsesteenweg 8, 8700 Tielt",
    btw: "BE 0421.695.127", website: "tieltsehouthandel.be", opgericht: "1981",
    fte: 2.5, brutomarge: null, est_ebitda: "~€150-250K (geschat op omzet €1,8M)",
    activiteit: "Houthandel, parket, terrassen", grootte: "K",
    digitaal: "Eenvoudige website, geen webshop",
    notitie: "Omzet €1,79M bekend. Slechts 2.5 FTE = micro-team. Klein maar winstgevend. Laagdrempelige overname. Opgericht 1981 → mogelijke pensioen eigenaar."
  },
  {
    rang: 11, naam: "Houthandel Driekoningen", adres: "Bruggestraat 130, 8730 Beernem",
    btw: "BE 0405.189.586", website: "houthandeldriekoningen.be", opgericht: "1966",
    fte: 9.9, brutomarge: null, est_ebitda: "Te onderzoeken",
    activiteit: "Houthandel groothandel", grootte: "M",
    digitaal: "Basis website",
    notitie: "Opgericht 1966 = bijna 60 jaar! 10 FTE. Klassieke houthandel, dicht bij Hertsberge. Hoge kans op opvolgingsproblematiek. Verder financieel onderzoek nodig."
  },
  {
    rang: 12, naam: "Houthandel Desmet", adres: "Kasteeldreef 10, 8760 Tielt",
    btw: "BE 0418.979.523", website: "houthandeldesmet.be", opgericht: "1978",
    fte: 5, brutomarge: 288000, est_ebitda: "~€50-100K",
    activiteit: "Houthandel, verwerking & plaatsing", grootte: "K",
    digitaal: "Zeer basic website",
    notitie: "Brutomarge €288K, 5 FTE. EBITDA laag maar bedrijf is goedkoop over te nemen. Opgericht 1978 → mogelijke opvolging. Breed aanbod: verkoop, verwerking, plaatsing."
  },
  {
    rang: 13, naam: "Janssens & Janssens (Oudenaarde)", adres: "Ind.park De Bruwaan 39, 9700 Oudenaarde",
    btw: "BE 0421.140.049", website: "janssensenjanssens.com", opgericht: "1980",
    fte: 8, brutomarge: 517000, est_ebitda: "~€130-170K",
    activiteit: "Houthandel & interieur", grootte: "M",
    digitaal: "Professionele website",
    notitie: "Brutomarge €517K, 8 FTE. Rand van EBITDA range. Sterk merk, meerdere vestigingen. Opgericht 1980. Mogelijk gecombineerde verkoop/service model met groei potentieel."
  },
  {
    rang: 14, naam: "Houtvercruysse", adres: "Bissegemstraat 165, 8560 Gullegem",
    btw: "BE 0421.483.212", website: "houtvercruysse.be", opgericht: "1981",
    fte: 8, brutomarge: null, est_ebitda: "Geschat op omzet €1,3M",
    activiteit: "Houthandel & import", grootte: "K",
    digitaal: "Website met productcatalogus, basis webshop",
    notitie: "Omzet €1,3M. Gespecialiseerd in speciale houtsoorten + steigerhout. 8 FTE. Import-component = hogere marge mogelijk. FSC gecertificeerd."
  },
  {
    rang: 15, naam: "W&A Parket", adres: "Antwerpse Steenweg 148, 9080 Lochristi",
    btw: "BE 0442.151.932", website: "wa-parket.be", opgericht: null,
    fte: 5.6, brutomarge: 378000, est_ebitda: "~€140-170K",
    activiteit: "Parket levering & plaatsing", grootte: "M",
    digitaal: "Basis website",
    notitie: "Familiebedrijf, 28+ jaar ervaring. Brutomarge €378K. Specialist massief parket = premium segment. Dicht bij Drongen. Lage EBITDA maar stabiel."
  },
];

function renderTop15() {
  const el = document.getElementById("top15-section");
  if (!el) return;

  let html = `
    <div class="top15-header">
      <h2>🏆 Top 15 Overnamekandidaten</h2>
      <p class="top15-subtitle">Rangschikking op basis van: EBITDA 150K–750K, omzet &lt;8M, groene zone, hoge marge, lage digitalisering, behapbaar voor 2 personen</p>
    </div>
    <div class="top15-table-wrap">
      <table class="analyse-table top15-table">
        <thead>
          <tr>
            <th>#</th>
            <th>★</th>
            <th>Naam</th>
            <th>Activiteit</th>
            <th>Brutomarge</th>
            <th>Est. EBITDA</th>
            <th>FTE</th>
            <th>Opgericht</th>
            <th>Adres</th>
            <th>BTW</th>
            <th>Website</th>
            <th>🚗 H</th>
            <th>🚗 D</th>
            <th>Digitaal</th>
            <th>Beoordeling</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
  `;

  TOP15.forEach(c => {
    const btwClean = c.btw.replace(/[^0-9]/g, "");
    const btwLink = `<a href="https://www.companyweb.be/nl/${btwClean}" target="_blank" rel="noopener">${c.btw}</a>`;
    const webLink = c.website ? `<a href="https://${c.website}" target="_blank" rel="noopener">${c.website}</a>` : "";
    const margeStr = c.brutomarge ? `€${Math.round(c.brutomarge / 1000)}K` : "—";

    // Zoek het bedrijf in bedrijven array voor de ster
    const bedrijf = bedrijven.find(b => b.naam === c.naam || b.naam.startsWith(c.naam));
    const starClass = bedrijf && isFavorite(bedrijf.naam) ? "starred" : "";
    const starChar = bedrijf && isFavorite(bedrijf.naam) ? "★" : "☆";
    const dataNaam = bedrijf ? bedrijf.naam.replace(/"/g, "&quot;") : c.naam.replace(/"/g, "&quot;");

    html += `
      <tr class="top15-row">
        <td class="top15-rang">${c.rang}</td>
        <td class="td-star"><button class="star-btn ${starClass}" data-naam="${dataNaam}">${starChar}</button></td>
        <td class="top15-naam">${c.naam}</td>
        <td>${c.activiteit}</td>
        <td class="td-num">${margeStr}</td>
        <td class="td-num top15-ebitda">${c.est_ebitda}</td>
        <td class="td-num">${c.fte}</td>
        <td>${c.opgericht || "—"}</td>
        <td class="td-adres">${c.adres}</td>
        <td class="td-btw">${btwLink}</td>
        <td class="td-web">${webLink}</td>
        <td class="td-num">${bedrijf && bedrijf.rijtijd_hertsberge != null ? bedrijf.rijtijd_hertsberge + "'" : "—"}</td>
        <td class="td-num">${bedrijf && bedrijf.rijtijd_drongen != null ? bedrijf.rijtijd_drongen + "'" : "—"}</td>
        <td class="top15-digitaal">${c.digitaal}</td>
        <td class="top15-notitie">${c.notitie}</td>
        <td class="td-notes"><textarea class="fav-note top15-note" data-top15="${c.naam.replace(/"/g, "&quot;")}" placeholder="Notitie…">${favNotes["top15_" + c.naam] || ""}</textarea></td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  el.innerHTML = html;

  // Star click handlers voor top 15
  el.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const c = bedrijven.find(b => b.naam === btn.dataset.naam);
      if (c) {
        toggleFavorite(c);
        // Update ster direct
        const active = isFavorite(c.naam);
        btn.classList.toggle("starred", active);
        btn.innerHTML = active ? "★" : "☆";
      }
    });
  });

  // Notes auto-save voor top 15
  el.querySelectorAll(".top15-note").forEach(ta => {
    ta.addEventListener("input", () => saveNote("top15_" + ta.dataset.top15, ta.value));
  });
}

function buildAnalyseCheckboxes(container, items, activeSet, defaultIds) {
  const allOn = !defaultIds; // als geen defaultIds → alles aan
  items.forEach(c => {
    const on = allOn || defaultIds.has(c.id);
    const label = document.createElement("label");
    label.className = "analyse-act-label" + (on ? " checked" : "");
    label.style.borderColor = c.kleur;
    label.style.color = c.kleur;
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = c.id;
    cb.checked = on;
    cb.addEventListener("change", () => {
      cb.checked ? activeSet.add(c.id) : activeSet.delete(c.id);
      label.classList.toggle("checked", cb.checked);
      renderAnalyse();
    });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(" " + c.label));
    container.appendChild(label);
    if (on) activeSet.add(c.id);
  });
}

function initAnalyse() {
  // Regio checkboxes — standaard alleen WVL + OVL
  buildAnalyseCheckboxes(
    document.getElementById("analyse-regio-checks"),
    categorieen.filter(c => c.type === "regio"),
    analyseActiveRegios,
    new Set(["wvl", "ovl"])
  );

  // Activiteit checkboxes — standaard alles aan
  buildAnalyseCheckboxes(
    document.getElementById("analyse-activiteit-checks"),
    categorieen.filter(c => c.type === "activiteit"),
    analyseActiveActs
  );

  // Standaard filters
  document.getElementById("analyse-groene-zone").checked = true;
  document.getElementById("analyse-btw-only").checked = true;

  document.querySelectorAll(".analyse-filters select, .analyse-filters > label input").forEach(el =>
    el.addEventListener("change", renderAnalyse)
  );

  // Sortering
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      if (analyseSortKey === th.dataset.sort) analyseSortAsc = !analyseSortAsc;
      else { analyseSortKey = th.dataset.sort; analyseSortAsc = true; }
      renderAnalyse();
    });
  });

  document.getElementById("analyse-export").addEventListener("click", exportCSV);
}

function getAnalyseFiltered() {
  const grootte = document.getElementById("analyse-grootte").value;
  const groeneZone = document.getElementById("analyse-groene-zone").checked;
  const btwOnly = document.getElementById("analyse-btw-only").checked;

  return bedrijven.filter(c => {
    if (analyseActiveRegios.size > 0 && !analyseActiveRegios.has(c.provincie)) return false;
    if (analyseActiveActs.size > 0 && !(c.activiteiten || []).some(a => analyseActiveActs.has(a))) return false;
    if (grootte && c.grootte !== grootte) return false;
    if (groeneZone && !inGroeneZone(c)) return false;
    if (btwOnly && !c.btw) return false;
    return true;
  });
}

function renderAnalyse() {
  const data = getAnalyseFiltered();

  data.sort((a, b) => {
    let va = getSortValue(a, analyseSortKey);
    let vb = getSortValue(b, analyseSortKey);
    if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
    if (va < vb) return analyseSortAsc ? -1 : 1;
    if (va > vb) return analyseSortAsc ? 1 : -1;
    return 0;
  });

  // Sorteer-indicator updaten
  document.querySelectorAll("#analyse-table th[data-sort]").forEach(th => {
    const base = th.textContent.replace(/ [▴▾]$/, "");
    th.textContent = th.dataset.sort === analyseSortKey ? base + (analyseSortAsc ? " ▴" : " ▾") : base;
  });

  renderTop15();
  renderStats(data);
  renderOpportuniteiten(data);

  const tbody = document.getElementById("analyse-tbody");
  tbody.innerHTML = "";
  data.forEach(c => {
    const tr = document.createElement("tr");
    const acts = (c.activiteiten || []).map(a => categorieen.find(cat => cat.id === a)?.label || a).join(", ");
    const provLabel = PROV_LABELS[c.provincie] || c.provincie;
    const sizeLabel = { G: "Groot", M: "Midden", K: "Klein" }[c.grootte] || "";
    const webLink = c.website ? `<a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener">${c.website}</a>` : "";
    const btwLink = c.btw ? `<a href="https://www.companyweb.be/nl/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener">${c.btw}</a>` : "";

    const rH = c.rijtijd_hertsberge;
    const rD = c.rijtijd_drongen;
    let scoreText = "", scoreClass = "";
    if (rH != null && rD != null) {
      const gem = Math.round((rH + rD) / 2);
      scoreText = `⌀ ${gem}'`;
      if (gem <= 30) scoreClass = "score-top";
      else if (gem <= 45) scoreClass = "score-good";
      else if (gem <= 60) scoreClass = "score-ok";
    }

    const starClass = isFavorite(c.naam) ? "starred" : "";
    const starChar = isFavorite(c.naam) ? "★" : "☆";

    tr.innerHTML = `
      <td class="td-star"><button class="star-btn ${starClass}" data-naam="${c.naam.replace(/"/g, "&quot;")}">${starChar}</button></td>
      <td class="td-naam">${c.naam}</td>
      <td>${provLabel}</td>
      <td>${acts}</td>
      <td><span class="size-badge ${c.grootte}">${sizeLabel}</span></td>
      <td class="td-adres">${c.adres || ""}</td>
      <td class="td-btw">${btwLink}</td>
      <td class="td-web">${webLink}</td>
      <td class="td-num">${rH != null ? rH + "'" : ""}</td>
      <td class="td-num">${rD != null ? rD + "'" : ""}</td>
      <td class="td-num td-dichtste ${scoreClass}">${scoreText}</td>
    `;
    tbody.appendChild(tr);
  });

  // Star click handlers
  tbody.querySelectorAll(".star-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = bedrijven.find(b => b.naam === btn.dataset.naam);
      if (c) toggleFavorite(c);
    });
  });
}

function getSortValue(c, key) {
  if (key === "favoriet") return isFavorite(c.naam) ? 0 : 1;
  if (key === "activiteiten") return (c.activiteiten || [])[0] || "";
  if (key === "rijtijd_hertsberge" || key === "rijtijd_drongen") return c[key] != null ? c[key] : 999;
  if (key === "dichtste") {
    const rH = c.rijtijd_hertsberge, rD = c.rijtijd_drongen;
    return (rH != null && rD != null) ? Math.round((rH + rD) / 2) : 999;
  }
  return c[key] || "";
}

function makeWebLink(c) {
  if (!c.website) return "";
  const url = c.website.startsWith("http") ? c.website : "https://" + c.website;
  return `<a href="${url}" target="_blank" rel="noopener" class="opp-link">🌐 ${c.website}</a>`;
}

// Statistieken
function renderStats(data) {
  const actCounts = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actCounts[a] = (actCounts[a] || 0) + 1; }));
  const regioCounts = {};
  data.forEach(c => { const l = PROV_LABELS[c.provincie] || c.provincie; regioCounts[l] = (regioCounts[l] || 0) + 1; });
  const sizeCounts = { G: 0, M: 0, K: 0 };
  data.forEach(c => { sizeCounts[c.grootte] = (sizeCounts[c.grootte] || 0) + 1; });

  document.getElementById("analyse-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${data.length}</div><div class="stat-label">Bedrijven</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => inGroeneZone(c)).length}</div><div class="stat-label">In groene zone</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.btw).length}</div><div class="stat-label">Met BTW-nr</div></div>
    <div class="stat-card"><div class="stat-num">${data.filter(c => c.website).length}</div><div class="stat-label">Met website</div></div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per grootte</div>
      <div class="stat-bar-group">
        ${[["Groot", "G"], ["Midden", "M"], ["Klein", "K"]].map(([l, k]) =>
          `<div class="stat-bar-row"><span class="stat-bar-label">${l}</span><div class="stat-bar"><div class="stat-bar-fill ${k}" style="width:${data.length ? (sizeCounts[k] / data.length * 100) : 0}%"></div></div><span class="stat-bar-num">${sizeCounts[k]}</span></div>`
        ).join("")}
      </div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per activiteit</div>
      <div class="stat-chips">${Object.entries(actCounts).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
        const cat = categorieen.find(c => c.id === id);
        return `<span class="stat-chip" style="border-color:${cat ? cat.kleur : '#888'};color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id} <b>${n}</b></span>`;
      }).join("")}</div>
    </div>
    <div class="stat-card stat-wide">
      <div class="stat-label">Per regio</div>
      <div class="stat-chips">${Object.entries(regioCounts).sort((a, b) => b[1] - a[1]).map(([l, n]) =>
        `<span class="stat-chip">${l} <b>${n}</b></span>`
      ).join("")}</div>
    </div>
  `;
}

// Opportuniteiten
function renderOpportuniteiten(data) {
  const el = document.getElementById("analyse-opps");
  if (!el) return;

  // Gebruik gefilterde data (regio + activiteit + grootte + groene zone + BTW filters)
  const overnameCandidates = data.filter(c => {
    const yr = parseInt(c.oprichting);
    return c.grootte === "K" && yr && yr < 2000;
  }).sort((a, b) => parseInt(a.oprichting) - parseInt(b.oprichting));

  const actFiltered = {};
  data.forEach(c => (c.activiteiten || []).forEach(a => { actFiltered[a] = (actFiltered[a] || 0) + 1; }));
  const actTotal = {};
  bedrijven.forEach(c => (c.activiteiten || []).forEach(a => { actTotal[a] = (actTotal[a] || 0) + 1; }));

  const witteVlekken = Object.entries(actFiltered).filter(([, n]) => n <= 3).sort((a, b) => a[1] - b[1]);

  el.innerHTML = `
    ${overnameCandidates.length ? `
    <div class="opp-section">
      <h3>🎯 Overnamekandidaten <span class="opp-subtitle">(op basis van oprichtingsjaar en dus mogelijkheid geen opvolging)</span></h3>
      <p class="opp-desc">Kleine bedrijven opgericht voor 2000 (binnen huidige filters)</p>
      <div class="opp-list">
        ${overnameCandidates.slice(0, 15).map(c => `
          <div class="opp-item">
            <span class="opp-name">${c.naam}</span>
            <span class="opp-detail">Opgericht ${c.oprichting} · ${(c.activiteiten || []).map(a => categorieen.find(x => x.id === a)?.label || a).join(", ")}</span>
            ${makeWebLink(c)}
            ${c.btw ? `<a href="https://www.companyweb.be/nl/${c.btw.replace(/[^0-9]/g, '')}" target="_blank" class="opp-link">📊 Jaarrekening</a>` : ""}
          </div>
        `).join("")}
      </div>
    </div>` : ""}
    <div class="opp-section">
      <h3>📊 Marktverzadiging</h3>
      <p class="opp-desc">Aantal spelers per activiteit (gefilterd vs. totaal)</p>
      <div class="opp-saturation">
        ${Object.entries(actFiltered).sort((a, b) => b[1] - a[1]).map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          const total = actTotal[id] || 0;
          const pct = total ? Math.round(n / total * 100) : 0;
          return `<div class="sat-row">
            <span class="sat-label" style="color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id}</span>
            <div class="sat-bar"><div class="sat-fill" style="width:${pct}%;background:${cat ? cat.kleur : '#888'}"></div></div>
            <span class="sat-nums">${n} / ${total} (${pct}%)</span>
          </div>`;
        }).join("")}
      </div>
    </div>
    ${witteVlekken.length ? `
    <div class="opp-section">
      <h3>🔍 Witte vlekken</h3>
      <p class="opp-desc">Activiteiten met ≤ 3 spelers binnen huidige filters — ruimte voor groei</p>
      <div class="opp-list">
        ${witteVlekken.map(([id, n]) => {
          const cat = categorieen.find(c => c.id === id);
          return `<div class="opp-item"><span class="opp-name" style="color:${cat ? cat.kleur : '#888'}">${cat ? cat.label : id}</span><span class="opp-detail">Slechts ${n} speler${n > 1 ? "s" : ""} in de zone</span></div>`;
        }).join("")}
      </div>
    </div>` : ""}
  `;
}

// CSV Export
function exportCSV() {
  const data = getAnalyseFiltered();
  const header = ["Naam", "Regio", "Activiteiten", "Grootte", "Adres", "BTW", "Website", "Omzet", "Medewerkers", "Oprichting", "Rijtijd Hertsberge", "Rijtijd Drongen", "Gem. rijtijd H+D"];
  const rows = data.map(c => [
    c.naam,
    PROV_LABELS[c.provincie] || c.provincie,
    (c.activiteiten || []).join("; "),
    { G: "Groot", M: "Middelgroot", K: "Klein" }[c.grootte] || "",
    c.adres || "", c.btw || "", c.website || "",
    c.omzet || "", c.medewerkers || "", c.oprichting || "",
    c.rijtijd_hertsberge != null ? c.rijtijd_hertsberge : "",
    c.rijtijd_drongen != null ? c.rijtijd_drongen : "",
    (c.rijtijd_hertsberge != null && c.rijtijd_drongen != null) ? Math.round((c.rijtijd_hertsberge + c.rijtijd_drongen) / 2) : "",
  ]);

  const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "houtkaart_analyse.csv";
  a.click();
  URL.revokeObjectURL(url);
}
