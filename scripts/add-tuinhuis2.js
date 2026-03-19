/**
 * Ronde 2 — tuinhuizen/carports/poolhouses/bijgebouwen
 * Diepgaand via goudengids, stad-per-stad, fabrikantendealers, niche zoektermen
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "Rodi NV (Brugge)",
    provincie: "wvl", grootte: "M", lat: 51.1936, lng: 3.1700,
    webshop: "Nee",
    info: "Houtconstructies op maat: tuinhuizen, garages, carports, afsluitingen. Eigen atelier. Brugse Steenweg 278, Brugge.",
    activiteiten: ["tuinhuis", "houthandel"],
    adres: "Brugse Steenweg 278, 8000 Brugge",
  },
  {
    naam: "Daniel Decadt Houthandel (Proven/Poperinge)",
    provincie: "wvl", grootte: "M", lat: 50.9000, lng: 2.7000,
    webshop: "Nee",
    info: "Pionier in houten constructies WVL. Houthandel + zusterbedrijf Decadt Construct. Tuinhuizen, poolhouses, carports op maat. Roesbruggestraat 5, 8972 Proven. BTW: BE 0450.706.045.",
    activiteiten: ["tuinhuis", "houthandel", "terrassen"],
    btw: "BE 0450.706.045",
    adres: "Roesbruggestraat 5, 8972 Proven",
  },
  {
    naam: "Geoff's Eiken Bijgebouwen (Ooigem/Wielsbeke)",
    provincie: "wvl", grootte: "K", lat: 50.8950, lng: 3.3700,
    webshop: "Nee",
    info: "Schrijnwerkerij gespecialiseerd in massief eiken bijgebouwen: carports, poolhouses, tuinkantoren. Ooigem, Wielsbeke.",
    activiteiten: ["tuinhuis"],
    adres: "Ooigem, 8710 Wielsbeke",
  },
  {
    naam: "Fierens BVBA (Zedelgem)",
    provincie: "wvl", grootte: "K", lat: 51.1372, lng: 3.1375,
    webshop: "Nee",
    info: "Daktimmerwerken, massieve houtbouw, bijgebouwen, poolhouses, carports. Remi Claeysstraat 1, 8210 Zedelgem. BTW: BE 0879.946.386.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0879.946.386",
    adres: "Remi Claeysstraat 1, 8210 Zedelgem",
  },
  {
    naam: "Schrijnwerken Moerman (Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.2000, lng: 3.2200,
    webshop: "Nee",
    info: "Schrijnwerker met 12 jaar ervaring. Tuinhuizen, carports, buitenschrijnwerk. Oude Hoogweg 59, 8310 Brugge. BTW: BE 0751.859.074.",
    activiteiten: ["tuinhuis"],
    btw: "BE 0751.859.074",
    adres: "Oude Hoogweg 59, 8310 Brugge",
  },
  {
    naam: "Marnix Verkain Tuinhout (Ruddervoorde/Oostkamp)",
    provincie: "wvl", grootte: "K", lat: 51.1100, lng: 3.1800,
    webshop: "Nee",
    info: "Tuinhout specialist. Carports, tuinhuizen, poorten, afsluitingen, terrassen, zwembaden. Baliebrugstraat 10, 8020 Ruddervoorde.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Baliebrugstraat 10, 8020 Ruddervoorde",
  },
  {
    naam: "Verde Tuinhuizen (Rekkem/Menen)",
    provincie: "wvl", grootte: "M", lat: 50.7600, lng: 3.1100,
    webshop: "Nee",
    info: "2 winkels + 2 expoterreinen. Tuinhuizen (klassiek, cottage, modern), carports, garages, houten speeltoestellen. Rekkem, regio Kortrijk-Wevelgem.",
    activiteiten: ["tuinhuis"],
    adres: "Rekkem, 8930 Menen",
  },
  {
    naam: "Woodproject (Menen)",
    provincie: "wvl", grootte: "M", lat: 50.7958, lng: 3.1218,
    webshop: "Nee",
    info: "Specialist houten bijgebouwen. Showroom Menen. Poolhouses, tuinhuizen, carports, tuinkamers. Van ontwerp tot afwerking.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Menen",
  },
  {
    naam: "Tuinen De Soete (Sint-Andries/Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.1850, lng: 3.1900,
    webshop: "Nee",
    info: "Tuinontwerp en -aanleg. Tuinhuizen, carports, poolhouses, houtbergingen. Albert Serreynstraat 17, 8200 Sint-Andries.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Albert Serreynstraat 17, 8200 Sint-Andries",
  },
  {
    naam: "Espeel Jonas Houtbouw (regio Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8822, lng: 3.4200,
    webshop: "Nee",
    info: "Carports en houten bijgebouwen in eigen beheer. Padouk, eik, ceder, thermowood. Regio Waregem-Kortrijk-Meulebeke.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "regio Waregem",
  },
  {
    naam: "Tuinen Vandemaele (Zedelgem regio)",
    provincie: "wvl", grootte: "K", lat: 51.1400, lng: 3.1300,
    webshop: "Nee",
    info: "Tuinaanleg. Poolhouses, tuinhuizen, houten bijgebouwen op maat. Actief in heel WVL.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Zedelgem",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "Vetrabo Garden Dream (Sint-Gillis-Waas)",
    provincie: "ovl", grootte: "M", lat: 51.1700, lng: 4.1100,
    webshop: "Nee",
    info: "Tuinhuizen op maat. Classic Line en Trend Line collecties. Showroom + buitenexpo 24/7 toegankelijk. Kluizenhof 27, 9170 Sint-Gillis-Waas. BTW: BE 0440.559.647.",
    activiteiten: ["tuinhuis"],
    btw: "BE 0440.559.647",
    adres: "Kluizenhof 27, 9170 Sint-Gillis-Waas",
  },
  {
    naam: "Garden Home (Dendermonde)",
    provincie: "ovl", grootte: "K", lat: 51.0300, lng: 4.1000,
    webshop: "Nee",
    info: "Tuinhuizen en garages. Prefab panelen, snelle plaatsing (ook weekends). Sleutelbloemlaan 10, 9200 Dendermonde.",
    activiteiten: ["tuinhuis"],
    adres: "Sleutelbloemlaan 10, 9200 Dendermonde",
  },
  {
    naam: "Gardenas NV (Dendermonde)",
    provincie: "ovl", grootte: "M", lat: 51.0280, lng: 4.1010,
    webshop: "Nee",
    info: "Fabrikant tuinhuizen, blokhutten en tuinartikelen in hout. Eigen zagerij. FSC-gecertificeerd. Wissenstraat 3, 9200 Dendermonde. BTW: BE 0446.780.416.",
    activiteiten: ["tuinhuis", "houthandel"],
    btw: "BE 0446.780.416",
    adres: "Wissenstraat 3, 9200 Dendermonde",
  },
  {
    naam: "Steyaert Meubelen (Aalter)",
    provincie: "ovl", grootte: "K", lat: 51.0895, lng: 3.4320,
    webshop: "Nee",
    info: "Houtatelier: schrijnwerk, eiken bijgebouwen, poolhouses, ramen, deuren, meubelen op maat. Sint-Godelievestraat 26, 9880 Aalter.",
    activiteiten: ["tuinhuis"],
    adres: "Sint-Godelievestraat 26, 9880 Aalter",
  },
  {
    naam: "VDB Woodsolutions (Maldegem)",
    provincie: "ovl", grootte: "K", lat: 51.2050, lng: 3.4350,
    webshop: "Nee",
    info: "Houten bijgebouwen op maat sinds 2017. Poolhouses, carports. Fortuinstraat 40, 9990 Maldegem. BTW: BE 0674.594.418.",
    activiteiten: ["tuinhuis"],
    btw: "BE 0674.594.418",
    adres: "Fortuinstraat 40, 9990 Maldegem",
  },
  {
    naam: "De Saegher Construction (Moerbeke-Waas)",
    provincie: "ovl", grootte: "K", lat: 51.1750, lng: 3.9700,
    webshop: "Nee",
    info: "Totaalprojecten: poolhouses, tuinhuizen, carports, renovatie. 3D ontwerp. Bergstraat 81, 9180 Moerbeke-Waas. BTW: BE 0700.640.304.",
    activiteiten: ["tuinhuis"],
    btw: "BE 0700.640.304",
    adres: "Bergstraat 81, 9180 Moerbeke-Waas",
  },
  {
    naam: "Systimber (De Pinte)",
    provincie: "ovl", grootte: "M", lat: 51.0010, lng: 3.6500,
    webshop: "Nee",
    info: "Houten bijgebouwen en woningen in houtschakelbouw (gepatenteerd systeem). Tuinkantoren, bijgebouwen. Productie in Merelbeke. Experience center De Pinte. Den Beer 18, 9840 De Pinte.",
    activiteiten: ["tuinhuis"],
    adres: "Den Beer 18, 9840 De Pinte",
  },
  {
    naam: "moduus (Evergem)",
    provincie: "ovl", grootte: "M", lat: 51.1100, lng: 3.6300,
    webshop: "Nee",
    info: "Architecturale houten bijgebouwen en tuinkantoren. Onderdeel Aktual groep (40 jaar ervaring). Experience center Evergem. Noorwegenstraat 22, 9940 Evergem.",
    activiteiten: ["tuinhuis"],
    adres: "Noorwegenstraat 22, 9940 Evergem",
  },
  {
    naam: "Tuincenter De Stercke (Lochristi)",
    provincie: "ovl", grootte: "K", lat: 51.1010, lng: 3.8300,
    webshop: "Nee",
    info: "Tuincenter + officieel Christiaens Yvan dealer/servicepunt. 40 jaar ervaring. Plaatsing tuinhuizen van A tot Z. Antwerpse Steenweg 21a, 9080 Lochristi.",
    activiteiten: ["tuinhuis"],
    adres: "Antwerpse Steenweg 21a, 9080 Lochristi",
  },
  {
    naam: "SDP Schrijnwerken (Moerbeke-Waas)",
    provincie: "ovl", grootte: "K", lat: 51.1750, lng: 3.9700,
    webshop: "Nee",
    info: "Tuinhuizen, carports, poolhouses, houten terrassen, houtskeletbouw. Ooststraat 37, 9180 Moerbeke-Waas. BTW: BE 0828.419.293.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0828.419.293",
    adres: "Ooststraat 37, 9180 Moerbeke-Waas",
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
