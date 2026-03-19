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
    btw: "BE 0446.722.414", adres: "Kerkstraat 88, 9890 Gavere",
    rechtsvorm: "BV", website: "goeminnetuinhout.be",
  },

  // ═══ BATCH 2 — WVL ═══
  "Dequidt": {
    btw: "BE 0405.252.340", adres: "Albert I Laan 27a, 8630 Veurne",
    rechtsvorm: "NV", medewerkers: 7.1,
  },
  "Verwée": {
    btw: "BE 0405.379.331", adres: "Heirweg 115, 8520 Kuurne",
    rechtsvorm: "NV",
  },
  "Tieltse Houthandel": {
    btw: "BE 0421.695.127", adres: "Deinsesteenweg 8, 8700 Tielt",
    rechtsvorm: "BV",
  },
  "Messely": {
    btw: "BE 0873.692.856", adres: "Heule/Kortrijk",
    rechtsvorm: "BV",
  },
  "Geldhof": {
    btw: "BE 0405.565.710", adres: "Iepersestraat 22, 8890 Moorslede",
    rechtsvorm: "NV", medewerkers: 4.8,
  },
  "Leirman": {
    btw: "BE 0405.494.642", adres: "Cardijnlaan 4, 8600 Diksmuide",
    rechtsvorm: "BV", oprichting: "1963",
  },
  "Beheyt": {
    btw: "BE 0450.980.714", adres: "Ieperseweg 26, 8970 Poperinge",
    rechtsvorm: "BV", oprichting: "1993", website: "www.beheyt.be",
  },
  "DB Hardwoods": {
    btw: "BE 0425.328.370", adres: "Roeselarestraat 154, 8880 Ledegem",
    rechtsvorm: "NV",
  },
  "Db Hardwoods": {
    btw: "BE 0425.328.370", adres: "Roeselarestraat 154, 8880 Ledegem",
    rechtsvorm: "NV",
  },
  "Loose": {
    btw: "BE 0414.807.335", adres: "Zandstraat 210, 8200 Brugge",
    rechtsvorm: "NV",
  },
  "Houtvercruysse": {
    btw: "BE 0421.483.212", adres: "Bissegemstraat 165, 8560 Gullegem",
    rechtsvorm: "BV",
  },
  "Desmet": {
    btw: "BE 0418.979.523", adres: "Kasteeldreef 10, 8760 Tielt",
    rechtsvorm: "BV",
  },
  "Stock Super Shop": {
    btw: "BE 0458.797.132", adres: "Rochesterlaan 3, 8470 Gistel",
    rechtsvorm: "NV",
  },

  // ═══ BATCH 2 — OVL ═══
  "De Regge": {
    btw: "BE 0476.593.464", adres: "Baaigemstraat 403, 9890 Gavere",
    rechtsvorm: "BV",
  },
  "Houtboerke": {
    btw: "BE 0445.566.431", adres: "Langerbruggekaai 5, 9000 Gent",
    rechtsvorm: "NV",
  },
  "Van Tornhout": {
    btw: "BE 0436.895.918", adres: "Landegemstraat 39, 9850 Deinze",
    rechtsvorm: "BV",
  },
  "Verhofstede": {
    btw: "BE 0420.253.389", adres: "Veldstraat 365, 9140 Temse",
    rechtsvorm: "BV", oprichting: "1980",
  },
  "Sackx": {
    btw: "BE 0426.353.305", adres: "Lange Munte 7, 9860 Oosterzele",
    rechtsvorm: "BV", oprichting: "1984",
  },
  "De Sutter": {
    btw: "BE 0425.103.686", adres: "Issegem 5, 9860 Oosterzele",
    rechtsvorm: "NV",
  },
  "Waasland": {
    btw: "BE 0405.597.580", adres: "Dorpvaart 74, 9180 Lokeren",
    rechtsvorm: "BV",
  },
  "Rouckhout": {
    btw: "BE 0406.347.549", adres: "Brusselsesteenweg 120, 9090 Melle",
    rechtsvorm: "BV",
  },

  // ═══ GROEP Janssens & Janssens ═══
  "_groep_janssens": {
    groep: "Janssens & Janssens Group",
    groep_btw: "BE 0821.735.597",
    groep_adres: "Industriepark De Bruwaan 39, 9700 Oudenaarde",
  },
};

// Match groepen aan vestigingen
const crasNames = ["Cras Woodshops", "Cras Wood"];
const debNames = ["Debeuckelaere", "Debeuckelae"];
const janssensNames = ["Janssens & Janssens", "Janssens en Janssens"];

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
  // Check groep Janssens & Janssens
  if (janssensNames.some((n) => b.naam.includes(n))) {
    Object.assign(b, enrichment["_groep_janssens"]);
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
