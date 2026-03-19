/**
 * Tag ALLE bedrijven met activiteiten.
 * Elk bedrijf krijgt minstens 1 kernactiviteit (niet webshop).
 * "online" is enkel een toevoeging als ze ook een webshop hebben.
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

// Keywords per activiteit
const KEYWORDS = {
  parket: ["parket", "parketvloer", "vloerbedekkingen", "laminaat", "vinyl", "vloer"],
  tuinhuis: ["tuinhui", "poolhouse", "carport", "bijgebouw", "blokhu", "chalet", "garage op maat", "mantelzorg", "terrasoverkapping", "pergola", "tuingebouw", "tuinconstructie", "buitengebouw"],
  terrassen: ["terras", "gevelbekleding", "facade", "deck", "thermowood", "thermisch", "composiet", "buitenhout", "tuinhout", "buitenshowroom", "tuin+constructie", "tuin en constructie", "tuinhout + constructie", "tuin-en-hout", "gevel", "cladding", "bardage", "tuinproducten"],
  paarden: ["paarden", "weideomheining", "weide-omheining", "paardenomheining", "robinia", "kastanje omheining", "post & rail", "weidepoort", "hekwerk"],
  agro: ["agro", "landbouw", "stro", "hooi"],
  dhz: ["dhz", "brico", "gamma", "hubo", "doe-het-zelf", "leenbakker", "bouwmarkt"],
  import: ["importeur", "b2b groothandel", "b2b-only", "b2b en b2c", "groothandel b2b", "négoce", "négociant", "grossiste"],
  online: ["webshop"],
  houthandel: ["houthandel", "houtzagerij", "zagerij", "schrijnwerk", "constructiehout", "plaatmateriaal", "houtsoort", "zaagservice", "maatwerk", "isolatie", "deuren", "plafond", "dakhout", "panelen", "bouwmateria"],
};

// Activiteit-types die als provincie worden gebruikt (niet-regio bedrijven)
const ACTIVITEIT_TYPES = ["online", "dhz", "agro", "import", "parket", "tuinhuis", "paarden"];

let tagged = 0;

bedrijven.forEach((b) => {
  const infoLower = (b.info + " " + b.naam).toLowerCase();
  const acts = new Set(b.activiteiten || []);

  // Keyword matching
  for (const [act, keywords] of Object.entries(KEYWORDS)) {
    if (keywords.some((kw) => infoLower.includes(kw))) {
      acts.add(act);
    }
  }

  // Als provincie een activiteit-type is, voeg die toe
  if (ACTIVITEIT_TYPES.includes(b.provincie)) {
    acts.add(b.provincie);
  }

  // Webshop check: "online" enkel als webshop = "Ja"
  if (b.webshop === "Ja" || b.webshop === "Eigen webshop" || b.webshop === "Webshop") {
    acts.add("online");
  }

  // Handmatige overrides voor bedrijven die keywords missen
  const naam = b.naam.toLowerCase();
  // Cras + Debeuckelaere vestigingen = volledige houthandel + terrassen
  if (naam.includes("cras wood") || naam.includes("debeuckelaere")) {
    acts.add("houthandel");
    acts.add("terrassen");
  }
  // B2B groothandels
  if (naam.includes("dimec") || naam.includes("hendrickx hout") ||
      naam.includes("db hardwoods") || naam.includes("houtvercruysse") ||
      naam.includes("eurowood") || naam.includes("hanssens hout") ||
      naam.includes("lagae")) {
    acts.add("import");
  }
  // Eurowood = specialist eik
  if (naam.includes("eurowood")) {
    acts.add("houthandel");
  }
  // Hout- & Bouwmarkt = dhz
  if (naam.includes("bouwmarkt") || naam.includes("bouwmaterialen")) {
    acts.add("dhz");
  }

  // Als er nog GEEN kernactiviteit is (exclusief "online"), voeg "houthandel" toe
  const kernActiviteiten = [...acts].filter((a) => a !== "online");
  if (kernActiviteiten.length === 0) {
    acts.add("houthandel");
  }

  b.activiteiten = [...acts];
  tagged++;
});

fs.writeFileSync("data/bedrijven.json", JSON.stringify(bedrijven, null, 2), "utf8");
console.log(`✓ ${tagged} bedrijven getagd met activiteiten`);

// Stats
const actCounts = {};
bedrijven.forEach((b) => {
  (b.activiteiten || []).forEach((a) => {
    actCounts[a] = (actCounts[a] || 0) + 1;
  });
});
console.log("\nActiviteiten verdeling:");
Object.entries(actCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// Check: hoeveel zonder activiteit?
const zonder = bedrijven.filter((b) => !b.activiteiten || b.activiteiten.length === 0);
console.log(`\nZonder activiteit: ${zonder.length}`);
