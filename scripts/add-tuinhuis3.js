/**
 * Ronde 3 — tuinhuizen/carports/poolhouses/bijgebouwen
 * Via niche-zoektermen, stad-per-stad, cross-referentie, Christiaens dealers
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "De Wilde Houtconstructies (Staden)",
    provincie: "wvl", grootte: "M", lat: 50.9800, lng: 3.0150,
    webshop: "Nee",
    info: "Familiebedrijf, 30+ jaar. Houten dakconstructies, eiken bijgebouwen, gevelbekleding. Eik, thermowood, ceder, oregon. Kapelleriestraat 28, 8840 Staden.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Kapelleriestraat 28, 8840 Staden",
  },
  {
    naam: "DB Chalets / Tuinhuizen Deinze",
    provincie: "ovl", grootte: "K", lat: 50.9833, lng: 3.5261,
    webshop: "Nee",
    info: "Officieel Christiaens Yvan dealer. Van tuinhuis tot poolhouse. Expo terrein. Kapellestraat 98C, 9800 Deinze.",
    activiteiten: ["tuinhuis"],
    adres: "Kapellestraat 98C, 9800 Deinze",
  },
  {
    naam: "Vergo Tuinen (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8760, lng: 3.4055,
    webshop: "Nee",
    info: "Tuinaannemer. Tuinhuizen op maat, houten gebouwen, zwemvijvers. Regio Waregem-Kortrijk.",
    activiteiten: ["tuinhuis", "terrassen"],
    adres: "Waregem",
  },
  {
    naam: "Solid Wood Builds (Kortrijk regio)",
    provincie: "wvl", grootte: "K", lat: 50.8275, lng: 3.2645,
    webshop: "Nee",
    info: "Eiken bijgebouwen in massieve houtbouw. Bouwpakketten. Regio Kortrijk.",
    activiteiten: ["tuinhuis"],
    adres: "regio Kortrijk",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "VEH Outdoor Living (Ronse)",
    provincie: "ovl", grootte: "M", lat: 50.7510, lng: 3.6010,
    webshop: "Ja",
    info: "Tuinhuizen, poolhouses, terrassen, carports, poorten, afsluitingen. 25+ jaar ervaring. Webshop tuinmeubels. Nieuwe Pontstraat 2, 9600 Ronse. BTW: BE 0462.924.481.",
    activiteiten: ["tuinhuis", "terrassen", "online"],
    btw: "BE 0462.924.481",
    adres: "Nieuwe Pontstraat 2, 9600 Ronse",
  },
  {
    naam: "Felke (Stekene)",
    provincie: "ovl", grootte: "M", lat: 51.2100, lng: 4.0350,
    webshop: "Nee",
    info: "Producent houten bijgebouwen en woonuitbreidingen. 30+ jaar expertise. Belevingspark. Stekene. Zusterbedrijf Bogarden.",
    activiteiten: ["tuinhuis"],
    adres: "Stekene",
  },
  {
    naam: "Bogarden (Stekene)",
    provincie: "ovl", grootte: "M", lat: 51.2100, lng: 4.0350,
    webshop: "Nee",
    info: "Exclusief design houten bijgebouwen: poolhouses, gastenverblijven, buitenkeukens, carports. Kantoren Stekene + Knokke. Zusterbedrijf Felke.",
    activiteiten: ["tuinhuis"],
    adres: "Stekene",
  },
  {
    naam: "JT Renovaties & Tuinconcepten (Sint-Niklaas)",
    provincie: "ovl", grootte: "K", lat: 51.1550, lng: 4.1330,
    webshop: "Nee",
    info: "Carports, poolhouses, tuinhuizen, pergola's, bijgebouwen. Oude Heirbaan 70, 9100 Sint-Niklaas. BTW: BE 0788.707.988.",
    activiteiten: ["tuinhuis", "terrassen"],
    btw: "BE 0788.707.988",
    adres: "Oude Heirbaan 70, 9100 Sint-Niklaas",
  },
  {
    naam: "De Saegher (Moerbeke-Waas) — T Houtproject",
    provincie: "ovl", grootte: "K", lat: 51.1750, lng: 3.9750,
    webshop: "Nee",
    info: "Alias: T Houtproject. Poolhouses, tuinhuizen, carports, 3D-ontwerp. Bergstraat 81, 9180 Moerbeke-Waas.",
    activiteiten: ["tuinhuis"],
    adres: "Bergstraat 81, 9180 Moerbeke-Waas",
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
