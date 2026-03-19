const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));

// Enrichment data from websearches
const enrichments = [
  // GROTE SPELERS
  { match: "Cras Woodshops (HQ Waregem)", btw: "BE0882.268.745", omzet: "€112 mln", werknemers: "230 FTE", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Heule", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Meulebeke", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Gent", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Merelbeke", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Roeselare", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops (HQ Waregem) — contact", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Heule (Kortrijk)", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Ardooie", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Gits (Hooglede)", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Cras Woodshops Meulebeke", btw: "BE0882.268.745", omzet: "€112 mln (groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  { match: "Dubois-Parquet (Waregem", btw: "BE0882.268.745", omzet: "€112 mln (Cras groep)", werknemers: "400+ (groep)", oprichting: "1878", website: "cras.be" },
  
  { match: "Desindo", btw: "BE0439.774.145", omzet: "n.b.", werknemers: "13 FTE", oprichting: "1990", website: "desindo.be" },
  { match: "Unilin", btw: "BE0405.414.072", omzet: "€1.640 mln", werknemers: "2.229 FTE", oprichting: "1960", website: "unilin.com" },
  { match: "Lalegno", btw: "BE0474.484.833", omzet: "€30-40 mln", werknemers: "~100", oprichting: "2003", website: "lalegno.com" },
  { match: "Verhelst Bouwmaterialen", btw: "BE0405.301.929", omzet: "€117 mln", werknemers: "270 FTE", oprichting: "1960", website: "verhelst.be" },
  { match: "Balterio", btw: "BE0441.533.409", omzet: "€168 mln", werknemers: "~500", oprichting: "2001", website: "balterio.com" },
  
  { match: "Debeuckelaere Roeselare", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  { match: "Debeuckelaere Tielt", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  { match: "Groep Debeuckelaere (Roeselare)", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  { match: "Groep Debeuckelaere (Tielt)", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  { match: "Groep Debeuckelaere (Gits", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  { match: "Debeuckelaere Gits", btw: "BE0424.964.621", werknemers: "?", oprichting: "1996", website: "debeuckelaere.com" },
  
  { match: "Agrodieren", btw: "BE0417.360.019", werknemers: "~50", oprichting: "1977", website: "agrodieren.be" },
  { match: "Ostyn", btw: "BE0458.025.288", werknemers: "?", oprichting: "1992", website: "ostyn.be" },
  
  // MIDDELGROTE SPELERS
  { match: "Vandenbroucke Hout", btw: "BE0414.141.993", omzet: "€9,8 mln", werknemers: "18 FTE", oprichting: "1974", website: "vandenbroucke.be" },
  { match: "Botanica Wood", btw: "BE0444.953.846", werknemers: "6 FTE", oprichting: "1992", website: "botanica-wood.be" },
  { match: "Houthandel Vanhaverbeke", btw: "BE0424.854.258", werknemers: "8 FTE", oprichting: "1983", website: "hout-vanhaverbeke.be" },
  { match: "Houthandel Steyaert", btw: "BE0401.047.785", omzet: "€12 mln", werknemers: "49 FTE", oprichting: "1929", website: "steyaerthoutshop.be" },
  { match: "Tieltse Houthandel", btw: "BE0421.695.127", omzet: "€1,8 mln", werknemers: "3 FTE", oprichting: "1981", website: "tieltsehouthandel.be" },
  { match: "Dewahout", btw: "BE0464.989.591", omzet: "€22 mln", werknemers: "32 FTE", oprichting: "?", website: "dewahout.be" },
  { match: "Goeminne Tuinhout", btw: "BE0446.722.414", werknemers: "5 FTE", oprichting: "1992", website: "goeminnetuinhout.be" },
  { match: "Carpentier Hardwood", btw: "BE0436.912.051", omzet: "€14,4 mln", werknemers: "32 FTE", oprichting: "1989", website: "carpentier.be" },
  { match: "Livinlodge", btw: "BE0436.912.051", omzet: "€14,4 mln (Carpentier)", werknemers: "32 FTE (Carpentier)", oprichting: "1989", website: "livinlodge.be" },
  { match: "Houtbouw Defreyne", btw: "BE0429.145.717", werknemers: "6 FTE", website: "defreyne.be" },
  { match: "Hout Van Maele", btw: "BE0803.507.319", werknemers: "4 FTE", oprichting: "2023", website: "houtvanmaele.be" },
  { match: "Cornelis Hout", btw: "BE0417.760.489", werknemers: "7 FTE", oprichting: "1977", website: "cornelishout.be" },
  { match: "Vanhauwood", btw: "BE0506.712.063", werknemers: "7 FTE", website: "vanhauwood.be" },
  { match: "Woodsome", btw: "BE0462.698.809", werknemers: "13 FTE", oprichting: "1998", website: "woodsome.be" },
  { match: "Rodi NV", btw: "BE0436.045.385", werknemers: "2 FTE", website: "rodinv.be" },
  
  // Bekende ketens
  { match: "Brico (Gent)", werknemers: "?", website: "brico.be", oprichting: "1973" },
  { match: "Brico (Brugge)", werknemers: "?", website: "brico.be", oprichting: "1973" },
  { match: "Gamma (Gent)", werknemers: "?", website: "gamma.be", oprichting: "1978" },
  { match: "Gamma (Kortrijk)", werknemers: "?", website: "gamma.be", oprichting: "1978" },
  { match: "Hubo (Gent)", werknemers: "?", website: "hubo.be", oprichting: "1969" },
  { match: "Leenbakker (Gent)", werknemers: "?", website: "leenbakker.be" },
  { match: "Gadero", werknemers: "?", website: "gadero.be" },
];

let updated = 0;
for (const e of enrichments) {
  // Find matching companies
  const matches = data.filter(c => c.naam.includes(e.match));
  for (const c of matches) {
    if (e.btw && !c.btw) c.btw = e.btw;
    if (e.omzet && !c.omzet) c.omzet = e.omzet;
    if (e.werknemers && e.werknemers !== "?" && !c.medewerkers) c.medewerkers = e.werknemers;
    if (e.oprichting && e.oprichting !== "?" && !c.oprichting) c.oprichting = e.oprichting;
    if (e.website && !c.website) c.website = e.website;
    updated++;
  }
}

fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Updated', updated, 'company records');

// Stats
const zone = data.filter(c => c.rijtijd_hertsberge != null);
const withBtw = zone.filter(c => c.btw);
const withOmzet = zone.filter(c => c.omzet);
const withWerknemers = zone.filter(c => c.medewerkers);
const withOprichting = zone.filter(c => c.oprichting);
const withWebsite = zone.filter(c => c.website);
console.log('\nGroene zone stats (' + zone.length + ' bedrijven):');
console.log('  BTW:', withBtw.length);
console.log('  Omzet:', withOmzet.length);
console.log('  Werknemers:', withWerknemers.length);
console.log('  Oprichting:', withOprichting.length);
console.log('  Website:', withWebsite.length);
