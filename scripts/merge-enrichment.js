/**
 * Verwerk verzamelde enrichment data in bedrijven.json
 * Voegt KBO/financiële data toe aan bestaande bedrijven
 */
const fs = require("fs");

const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

// Verzamelde data per bedrijfsnaam (of deel van naam)
const enrichment = {
  // ═══ GROEPEN (financiële data geldt voor alle vestigingen) ═══
  "_groep_cras": {
    groep: "Cras NV",
    groep_btw: "BE 0882.268.745",
    groep_omzet: "€112.336.185",
    groep_medewerkers: 230,
    groep_rechtsvorm: "NV",
    groep_oprichting: "2006",
    groep_website: "www.cras.be",
    groep_adres: "Industrielaan 5, 8790 Waregem",
  },
  "_groep_debeuckelaere": {
    groep: "Debeuckelaere Gebroeders NV",
    groep_btw: "BE 0424.964.621",
    groep_omzet: null,
    groep_medewerkers: null,
    groep_rechtsvorm: "NV",
    groep_oprichting: null,
    groep_website: "www.debeuckelaere.be",
    groep_adres: "Amersveldestraat 213, 8610 Kortemark",
  },

  // ═══ WEST-VLAANDEREN ═══
  "Vandenbroucke Hout": {
    btw: "BE 0414.141.993", adres: "Noendreef 1A, 8730 Beernem",
    rechtsvorm: "BV", website: "vandenbrouckehout.be",
  },
  "Botanica Wood": {
    btw: "BE 0444.953.846", adres: "Iepersestraat 459, 8800 Roeselare",
    rechtsvorm: "NV", website: "www.botanica-wood.be",
  },
  "Woodcenter": {
    btw: "BE 0434.661.354", adres: "Zuidstraat 7, 8560 Wevelgem",
    rechtsvorm: "NV", medewerkers: 6.4, website: "www.woodcenter.be",
  },
  "Houthandel Vanhaverbeke": {
    btw: "BE 0424.854.258", adres: "Ambachtenstraat 22, 8870 Izegem",
    rechtsvorm: "NV", medewerkers: 8.3,
  },
  "Houthandel Tavernier": {
    btw: "BE 0405.143.462", adres: "Gistelsteenweg 569, 8490 Jabbeke",
    rechtsvorm: "NV", medewerkers: 9.3, oprichting: "1965",
    website: "houthandeltavernier.be",
  },
  "Eurowood": {
    btw: "BE 0433.136.771", adres: "Rijksweg 442, 8710 Wielsbeke",
    rechtsvorm: "NV", medewerkers: 3.4, oprichting: "1867",
    website: "www.eurowood.be",
  },
  "Houtmagazijn Verdonckt": {
    btw: null, adres: "Doorniksesteenweg 202, 8580 Avelgem",
    oprichting: "1920", website: "houtmagazijnverdonckt.be",
  },
  "Hout Van Maele": {
    btw: null, adres: "Sint-Elooisstraat 90, 8020 Ruddervoorde",
    website: "www.houtvanmaele.be",
  },
  "Houthandel Decadt": {
    btw: "BE 0415.284.714", adres: "Vlamertinge (Ieper)",
    rechtsvorm: "NV",
  },

  // ═══ OOST-VLAANDEREN ═══
  "EXZO": {
    btw: "BE 0688.738.206", adres: "Léon Bekaertlaan 3E, 9880 Aalter",
    rechtsvorm: "BV", medewerkers: 8.9, oprichting: "2011",
    website: "www.exzo.be",
  },
  "Ecohout": {
    btw: null, adres: "Aalter",
    groep: "EXZO BV", groep_btw: "BE 0688.738.206",
    website: "www.ecohout.be",
  },
  "Desindo": {
    btw: "BE 0439.774.145", adres: "Wiedauwkaai 88, 9000 Gent",
    rechtsvorm: "BV", medewerkers: 12.9,
  },
  "Hout De Groote": {
    btw: "BE 0424.810.312", adres: "Eekstraat 26, 9160 Lokeren",
    rechtsvorm: "NV", medewerkers: 11,
  },
  "D'Haeseleer": {
    btw: "BE 0408.386.826", adres: "Oudenaardsesteenweg 5, 9420 Erpe-Mere",
    rechtsvorm: "BV", oprichting: "1971",
  },
  "Houthandel Steyaert": {
    btw: "BE 0401.047.785", adres: "Zuidmoerstraat 102, 9900 Eeklo",
    rechtsvorm: "BV",
  },
  "Houtshop Van der Gucht": {
    btw: "BE 0405.069.822", adres: "Kapelanielaan 7, 9140 Temse",
    rechtsvorm: "NV", medewerkers: 45.7, oprichting: "1968",
  },
  "De Meyer Outdoor Living": {
    btw: "BE 0871.370.893", adres: "Langendam 25A, 9940 Evergem",
    rechtsvorm: "NV", medewerkers: 15.5,
    website: "www.demeyer-nv.shop",
  },
  "Hertecant Hout": {
    btw: "BE 0400.011.469", adres: "Dendermonde",
    rechtsvorm: "NV",
  },
  "Hout Koklenberg": {
    btw: "BE 0873.770.258", adres: "Europark-Noord 47, 9100 Sint-Niklaas",
  },
  "Prindal": {
    btw: "BE 0418.995.260", adres: "Peyenbeek(Den) 4, 9400 Ninove",
    rechtsvorm: "BV", medewerkers: 4.8, oprichting: "1978",
  },
  "Houtland": {
    btw: "BE 0419.283.884", adres: "Eegene 45, 9200 Dendermonde",
    rechtsvorm: "BV", medewerkers: 25.4, oprichting: "1979",
    website: "www.houtland.be",
  },
  "Hanssens Hout": {
    btw: "BE 0400.089.663", adres: "Gent",
    rechtsvorm: "NV",
  },
  "Goeminne Tuinhout": {
    btw: null, adres: "Dikkelvenne (Gavere)",
    website: "goeminnetuinhout.be",
  },
};

// Match groepen aan vestigingen
const crasNames = ["Cras Woodshops", "Cras Wood"];
const debNames = ["Debeuckelaere", "Debeuckelae"];

let updated = 0;

bedrijven.forEach((b) => {
  // Check groep Cras
  if (crasNames.some((n) => b.naam.includes(n))) {
    Object.assign(b, enrichment["_groep_cras"]);
    updated++;
    return;
  }
  // Check groep Debeuckelaere
  if (debNames.some((n) => b.naam.includes(n))) {
    Object.assign(b, enrichment["_groep_debeuckelaere"]);
    updated++;
    return;
  }

  // Check individuele bedrijven
  for (const [key, data] of Object.entries(enrichment)) {
    if (key.startsWith("_groep_")) continue;
    if (b.naam.includes(key)) {
      Object.assign(b, data);
      updated++;
      return;
    }
  }
});

fs.writeFileSync("data/bedrijven.json", JSON.stringify(bedrijven, null, 2), "utf8");
console.log(`✓ ${updated} bedrijven verrijkt van ${bedrijven.length} totaal`);
console.log("Opgeslagen in data/bedrijven.json");
