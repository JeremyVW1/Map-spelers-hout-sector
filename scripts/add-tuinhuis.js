/**
 * Ronde 1 — tuinhuizen, carports, poolhouses, bijgebouwen
 * Diepgaande zoektocht via 8 strategieën (websearch, goudengids, fabrikantendealers, etc.)
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "Houtbouw Defreyne (Ardooie)",
    provincie: "wvl", grootte: "M", lat: 50.9700, lng: 3.2150,
    webshop: "Nee",
    info: "Fabrikant houten bijgebouwen: tuinhuizen, carports, pergola's, poolhouses, buitenkeukens. Steenovenstraat 5, 8850 Ardooie. BTW: BE 0429.145.717.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0429.145.717",
    adres: "Steenovenstraat 5, 8850 Ardooie",
  },
  {
    naam: "Chaletpark (Roeselare)",
    provincie: "wvl", grootte: "K", lat: 50.8850, lng: 3.1230,
    webshop: "Nee",
    info: "Op maat gemaakte tuinhuizen, showterrein. 10+ jaar ervaring. Geplaatst in heel België. Meensesteenweg 635, Roeselare.",
    activiteiten: ["tuinhuis"],
    adres: "Meensesteenweg 635, 8800 Roeselare",
  },
  {
    naam: "D&D Chalet & Tuincenter (Izegem)",
    provincie: "wvl", grootte: "M", lat: 50.9128, lng: 3.2150,
    webshop: "Nee",
    info: "Tuinhuizen, carports, pergola's, poolhouses op maat. 50+ jaar ervaring. Showroom. Krekelstraat 247, 8870 Izegem. BTW: BE 0463.456.201.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0463.456.201",
    adres: "Krekelstraat 247, 8870 Izegem",
  },
  {
    naam: "Livinlodge (Meulebeke)",
    provincie: "wvl", grootte: "M", lat: 50.9510, lng: 3.2870,
    webshop: "Nee",
    info: "Exclusieve houten bijgebouwen: poolhouses, carports, tuinhuizen, veranda's, tuinkantoren. Showroom Meulebeke. Premium merk.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "8760 Meulebeke",
  },
  {
    naam: "Woodsome (Lendelede)",
    provincie: "wvl", grootte: "M", lat: 50.8750, lng: 3.2450,
    webshop: "Nee",
    info: "Houten bijgebouwen op maat: poolhouses, tuinkamers, carports, garages. 25+ jaar ervaring. Kortrijksestraat 102A, 8860 Lendelede. BTW: BE 0462.698.809.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0462.698.809",
    adres: "Kortrijksestraat 102A, 8860 Lendelede",
  },
  {
    naam: "Oakwood Projects (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8822, lng: 3.4178,
    webshop: "Nee",
    info: "Eiken bijgebouwen op maat: zelfbouwpakketten voor carports, poolhouses, stallingen. Atelier in West-Vlaanderen.",
    activiteiten: ["tuinhuis"],
    adres: "Waregem",
  },
  {
    naam: "Tuinen Huyghe (Roeselare regio)",
    provincie: "wvl", grootte: "K", lat: 50.9470, lng: 3.1260,
    webshop: "Nee",
    info: "Houtconstructies, poolhouses, tuinaanleg. 30+ jaar ervaring regio Roeselare.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Roeselare",
  },
  {
    naam: "Decotuin (Torhout)",
    provincie: "wvl", grootte: "K", lat: 51.0663, lng: 3.1029,
    webshop: "Nee",
    info: "Tuinhuizen, blokhutten, carports. Torhout.",
    activiteiten: ["tuinhuis"],
    adres: "Torhout",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "Cornelis Hout (Evergem)",
    provincie: "ovl", grootte: "M", lat: 51.1100, lng: 3.6300,
    webshop: "Nee",
    info: "Producent houten bijgebouwen sinds 1920, 5 generaties. Bouwpakketten voor garages, carports, stallingen, poolhouses. Noorwegenstraat 53, 9940 Evergem.",
    activiteiten: ["tuinhuis", "houthandel"],
    adres: "Noorwegenstraat 53, 9940 Evergem",
  },
  {
    naam: "Green Oak Buildings (Ninove)",
    provincie: "ovl", grootte: "K", lat: 50.8350, lng: 4.0250,
    webshop: "Nee",
    info: "Exclusieve eiken bijgebouwen. Bouwpakketten of volledige uitvoering incl. grondwerk, metselwerk, montage. Ring Oost 13/A, 9400 Ninove.",
    activiteiten: ["tuinhuis"],
    adres: "Ring Oost 13/A, 9400 Ninove",
  },
  {
    naam: "Exclusive Oakwood (Vlierzele)",
    provincie: "ovl", grootte: "K", lat: 50.9400, lng: 3.8800,
    webshop: "Nee",
    info: "Familiebedrijf. Eiken carports, poolhouses, stallingen, garages. Ook zelfbouwpakketten. Sint-Fledericusstraat 29B, Vlierzele.",
    activiteiten: ["tuinhuis"],
    adres: "Sint-Fledericusstraat 29B, 9520 Vlierzele",
  },
  {
    naam: "Vanhauwood (Maldegem)",
    provincie: "ovl", grootte: "M", lat: 51.2050, lng: 3.4350,
    webshop: "Nee",
    info: "Meesters in houten bijgebouwen. Eiken poolhouses, carports, tuinhuizen, overkappingen. Werkt in heel België + Frankrijk + Nederland. Aalterbaan 205, 9990 Maldegem. BTW: BE 0506.712.063.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0506.712.063",
    adres: "Aalterbaan 205, 9990 Maldegem",
  },
  {
    naam: "Chalets Baka (Aalst/Erembodegem)",
    provincie: "ovl", grootte: "M", lat: 50.9230, lng: 4.0195,
    webshop: "Ja",
    info: "Tuinhuizen, blokhutten, carports, pergola's, paviljoenen. Familiebedrijf. Webshop. D'Uitseweg 139, 9320 Aalst.",
    activiteiten: ["tuinhuis", "online"],
    adres: "D'Uitseweg 139, 9320 Aalst",
  },
  {
    naam: "Callewood (Oost-Vlaanderen)",
    provincie: "ovl", grootte: "K", lat: 51.0000, lng: 3.7200,
    webshop: "Nee",
    info: "Bijgebouwen landelijk en modern: tuinhuizen, carports, terrasoverkappingen, poolhouses. Op afspraak.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Oost-Vlaanderen",
  },
  {
    naam: "Ronny Volckaert (Gavere)",
    provincie: "ovl", grootte: "K", lat: 50.9270, lng: 3.6700,
    webshop: "Nee",
    info: "Tuinhuizen en carports. Renovatiewerken. Gavere.",
    activiteiten: ["tuinhuis"],
    adres: "Gavere",
  },

  // ═══ NATIONAAL / KETENS ═══
  {
    naam: "Chalet Center (Elversele/Temse)",
    provincie: "ovl", grootte: "G", lat: 51.1200, lng: 4.1050,
    webshop: "Ja",
    info: "Grootste tuinhuizenfabrikant België sinds 1979. 11 showrooms (o.a. Elversele, Roeselare, Genk, Kampenhout, Kruisem, Geel, Wommelgem, Sint-Pieters-Leeuw). Belgische makelij.",
    activiteiten: ["tuinhuis", "online"],
    adres: "Elversele, 9140 Temse",
  },
  {
    naam: "Primewood (Westmalle)",
    provincie: "ant", grootte: "M", lat: 51.2950, lng: 4.6800,
    webshop: "Nee",
    info: "Eiken bijgebouwen op maat: carports, terrassen, poolhouses, stallingen, tuinberging. Traditioneel pen-en-gat verbindingen. Westmalle.",
    activiteiten: ["tuinhuis"],
    adres: "Westmalle",
  },
  {
    naam: "Royal Oak Buildings (Kalmthout)",
    provincie: "ant", grootte: "M", lat: 51.3800, lng: 4.4700,
    webshop: "Nee",
    info: "Exclusieve eiken bijgebouwen, 27 jaar, 2700+ realisaties. Carports, poolhouses, gastverblijven, woninguitbreidingen. Kalmthout + kantoor Schoten.",
    activiteiten: ["tuinhuis"],
    adres: "Kalmthout",
  },
];

let added = 0;
nieuw.forEach((b) => {
  const key = b.naam.toLowerCase();
  if (!bestaandeNamen.has(key)) {
    bedrijven.push(b);
    bestaandeNamen.add(key);
    added++;
    console.log(`  + ${b.naam}`);
  } else {
    console.log(`  ~ BESTAAT AL: ${b.naam}`);
  }
});

fs.writeFileSync("data/bedrijven.json", JSON.stringify(bedrijven, null, 2), "utf8");
console.log(`\n✓ ${added} tuinhuisbedrijven toegevoegd (totaal: ${bedrijven.length})`);
