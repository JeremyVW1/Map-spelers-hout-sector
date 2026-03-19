/**
 * Voeg 3e ronde parketbedrijven toe — fabrikanten + ontbrekende dealers
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ GROTE FABRIKANTEN ═══
  {
    naam: "Unilin / Quick-Step (Wielsbeke)",
    provincie: "wvl", grootte: "G", lat: 50.9042, lng: 3.3755,
    webshop: "Ja",
    info: "Grootste parket/laminaat/vinyl fabrikant België. Merken: Quick-Step, Pergo. Mohawk Industries. Ooigemstraat 3, 8710 Wielsbeke.",
    activiteiten: ["parket", "import"],
    adres: "Ooigemstraat 3, 8710 Wielsbeke",
  },
  {
    naam: "Decospan (Menen)",
    provincie: "wvl", grootte: "G", lat: 50.7958, lng: 3.1218,
    webshop: "Nee",
    info: "Parketfabrikant. Merken: Cabbani, The Twelve, Esco. Fineer en parket. Lageweg 33, 8930 Menen.",
    activiteiten: ["parket", "import"],
    adres: "Lageweg 33, 8930 Menen",
  },
  {
    naam: "Deco-Floor Parketvloeren (Oostrozebeke)",
    provincie: "wvl", grootte: "K", lat: 50.9305, lng: 3.3430,
    webshop: "Nee",
    info: "Levering, plaatsing en onderhoud parket en laminaat. Tieltsteenweg 45, 8780 Oostrozebeke. BTW: BE 0836.908.080.",
    activiteiten: ["parket"],
    btw: "BE 0836.908.080",
    adres: "Tieltsteenweg 45, 8780 Oostrozebeke",
  },
  {
    naam: "Floor Depot (Zulte)",
    provincie: "ovl", grootte: "M", lat: 50.9350, lng: 3.4500,
    webshop: "Ja",
    info: "Grootste vloerenoutlet België. Laminaat, parket, vinyl. Groothandel aan outletprijzen. Olsenestraat 27, Zulte.",
    activiteiten: ["parket", "online"],
    adres: "Olsenestraat 27, 9800 Zulte",
  },
  {
    naam: "Gerko Parket (Ronse)",
    provincie: "ovl", grootte: "M", lat: 50.7500, lng: 3.6050,
    webshop: "Nee",
    info: "Fabrikant en afwerker Franse witte eik parket sinds 1993. Nieuwe Pontstraat 3, 9600 Ronse. BTW: BE 0449.721.791.",
    activiteiten: ["parket", "import"],
    btw: "BE 0449.721.791",
    adres: "Nieuwe Pontstraat 3, 9600 Ronse",
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
console.log(`\n✓ ${added} bedrijven toegevoegd (totaal: ${bedrijven.length})`);
