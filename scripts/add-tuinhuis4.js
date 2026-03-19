/**
 * Ronde 4 — tuinhuizen/bijgebouwen — laatste niche-vondsten
 * Strategie 6 (companyweb cross-ref), 7 (niche zoektermen), 8 (kruisverwijzingen)
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "Vandenauweele (Gistel)",
    provincie: "wvl", grootte: "K", lat: 51.1580, lng: 2.9700,
    webshop: "Nee",
    info: "Schrijnwerkerij sinds 1988. Houten bijgebouwen, ramen, deuren, dakkapellen, keukens, interieur. Brandhout. Torhoutse Baan 97, 8470 Gistel. BTW: BE 0433.187.251.",
    activiteiten: ["tuinhuis", "houthandel"],
    btw: "BE 0433.187.251",
    adres: "Torhoutse Baan 97, 8470 Gistel",
  },
  {
    naam: "Decadt Construct (Proven/Poperinge)",
    provincie: "wvl", grootte: "K", lat: 50.9000, lng: 2.7050,
    webshop: "Nee",
    info: "Zusterbedrijf Daniel Decadt houthandel. Ontwerp en bouw houten tuinhuizen, bijgebouwen, garages, carports op maat. 9.5 VTE. Roesbruggestraat 9, 8972 Poperinge. BTW: BE 0795.107.020.",
    activiteiten: ["tuinhuis"],
    btw: "BE 0795.107.020",
    adres: "Roesbruggestraat 9, 8972 Poperinge",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "Hout De Groote (Lokeren)",
    provincie: "ovl", grootte: "K", lat: 51.1000, lng: 3.9900,
    webshop: "Nee",
    info: "Houthandel. Tuinhout, tuinhuizen, afsluitingen, terrassen. Regio Lokeren-Sint-Niklaas-Temse.",
    activiteiten: ["houthandel", "tuinhuis", "terrassen"],
    adres: "Lokeren",
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
