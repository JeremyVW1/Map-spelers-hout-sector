/**
 * Voeg activiteiten-tags toe aan bedrijven die meerdere activiteiten doen.
 * Zoekt op keywords in info-tekst.
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

const ACTIVITEIT_KEYWORDS = {
  parket: ["parket", "parketvloer", "vloerbedekkingen"],
  tuinhuis: ["tuinhui", "poolhouse", "carport", "bijgebouw", "blokhu", "chalet", "garage op maat", "mantelzorg"],
  paarden: ["paarden", "weideomheining", "weide-omheining", "paardenomheining", "robinia", "kastanje omheining", "post & rail", "weidepoort"],
  agro: ["agro", "weide", "landbouw", "stro", "hooi"],
  online: ["webshop"],
  dhz: ["dhz", "brico", "gamma", "hubo", "doe-het-zelf"],
  import: ["importeur", "b2b groothandel", "b2b-only"],
};

let updated = 0;

bedrijven.forEach((b) => {
  const infoLower = (b.info + " " + b.naam).toLowerCase();
  const acts = new Set();

  for (const [act, keywords] of Object.entries(ACTIVITEIT_KEYWORDS)) {
    if (keywords.some((kw) => infoLower.includes(kw))) {
      acts.add(act);
    }
  }

  // Voeg de eigen categorie ook toe als activiteit (als het een activiteit-type is)
  const activiteitTypes = ["online", "dhz", "agro", "import", "parket", "tuinhuis", "paarden"];
  if (activiteitTypes.includes(b.provincie)) {
    acts.add(b.provincie);
  }

  if (acts.size > 0) {
    b.activiteiten = [...acts];
    updated++;
  }
});

fs.writeFileSync("data/bedrijven.json", JSON.stringify(bedrijven, null, 2), "utf8");
console.log(`✓ ${updated} bedrijven getagd met activiteiten`);

// Toon voorbeelden
bedrijven
  .filter((b) => b.activiteiten && b.activiteiten.length > 1)
  .slice(0, 10)
  .forEach((b) => console.log(`  ${b.naam}: [${b.activiteiten.join(", ")}]`));
