/**
 * Voeg ronde 4 ontbrekende parket/vloerenbedrijven toe
 * Via Lalegno dealers lijst, goudengids, diverse websearches
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "Parket Lefevere (Sint-Eloois-Winkel)",
    provincie: "wvl", grootte: "K", lat: 50.8883, lng: 3.2550,
    webshop: "Nee",
    info: "Parketvloeren, terrassen en trappen. Lalegno dealer. 't Lindeke 31 Zone C1, 8880 Sint-Eloois-Winkel.",
    activiteiten: ["parket", "terrassen"],
    adres: "'t Lindeke 31, 8880 Sint-Eloois-Winkel",
  },
  {
    naam: "Lecoutere Houthandel (Brugge)",
    provincie: "wvl", grootte: "M", lat: 51.1936, lng: 3.1700,
    webshop: "Nee",
    info: "Houthandel + Lalegno parketdealer. Dirk Martensstraat 16, 8200 Brugge. BTW: BE 0418.365.849.",
    activiteiten: ["houthandel", "parket"],
    btw: "BE 0418.365.849",
    adres: "Dirk Martensstraat 16, 8200 Brugge",
  },
  {
    naam: "Ardeco Parket & Producten (Spiere-Helkijn)",
    provincie: "wvl", grootte: "K", lat: 50.7340, lng: 3.3480,
    webshop: "Ja",
    info: "Parket en onderhoudsproducten. Webshop. Industripark 12a bus 7, 8587 Spiere-Helkijn.",
    activiteiten: ["parket", "online"],
    adres: "Industripark 12a bus 7, 8587 Spiere-Helkijn",
  },
  {
    naam: "DS Parket (Roeselare)",
    provincie: "wvl", grootte: "K", lat: 50.9463, lng: 3.1245,
    webshop: "Nee",
    info: "Parketlegger. Stormstraat 28, Roeselare.",
    activiteiten: ["parket"],
    adres: "Stormstraat 28, 8800 Roeselare",
  },
  {
    naam: "Renova Parket (Ingelmunster)",
    provincie: "wvl", grootte: "K", lat: 50.9220, lng: 3.2590,
    webshop: "Nee",
    info: "Specialist renovatie en onderhoud parketvloeren. Lalegno dealer. Bruggestraat 279, 8770 Ingelmunster.",
    activiteiten: ["parket"],
    adres: "Bruggestraat 279, 8770 Ingelmunster",
  },
  {
    naam: "Roofloors (Kortrijk)",
    provincie: "wvl", grootte: "K", lat: 50.8275, lng: 3.2645,
    webshop: "Nee",
    info: "Vloerbekleding: tapijt, parket, vinyl en meer. Hoevestraat 17-A1, 8500 Kortrijk.",
    activiteiten: ["parket"],
    adres: "Hoevestraat 17-A1, 8500 Kortrijk",
  },
  {
    naam: "Interior by Cornelis (Oostende)",
    provincie: "wvl", grootte: "K", lat: 51.2120, lng: 2.8950,
    webshop: "Nee",
    info: "Interieur, meubelen, parket, vinyl, laminaat. 2 showrooms Nieuwpoortsesteenweg, Oostende. Quick-Step dealer.",
    activiteiten: ["parket"],
    adres: "Nieuwpoortsesteenweg, 8400 Oostende",
  },
  {
    naam: "Atelier De Cuyper (Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.2093, lng: 3.2247,
    webshop: "Nee",
    info: "Expert parketrenovatie. Renoveren, restaureren, schuren, herstellen en afwerken houten vloeren.",
    activiteiten: ["parket"],
    adres: "Brugge",
  },
  {
    naam: "Stichelbaut (Knokke-Heist)",
    provincie: "wvl", grootte: "K", lat: 51.3480, lng: 3.2780,
    webshop: "Nee",
    info: "Verf- en decoratiespecialist. Parket, vloeren, raamdecoratie. Lalegno dealer. Vestigingen Knokke + Maldegem.",
    activiteiten: ["parket"],
    adres: "Knokke-Heist",
  },
  {
    naam: "Desomer-Plancke (Poperinge)",
    provincie: "wvl", grootte: "K", lat: 50.8540, lng: 2.7230,
    webshop: "Nee",
    info: "Houthandel en bouwmaterialen. Lalegno parketdealer. Poperinge.",
    activiteiten: ["houthandel", "parket"],
    adres: "Poperinge",
  },
  {
    naam: "Bouwcenter Frans Vlaeminck (Oostrozebeke)",
    provincie: "wvl", grootte: "K", lat: 50.9300, lng: 3.3400,
    webshop: "Nee",
    info: "Bouwmaterialen en Lalegno parketdealer. Oostrozebeke.",
    activiteiten: ["houthandel", "parket"],
    adres: "Oostrozebeke",
  },
  {
    naam: "Multi Bazar (Pittem)",
    provincie: "wvl", grootte: "K", lat: 51.0000, lng: 3.2700,
    webshop: "Nee",
    info: "Doe-het-zelf en bouwmaterialen. Lalegno parketdealer. Pittem.",
    activiteiten: ["dhz", "parket"],
    adres: "Pittem",
  },
  {
    naam: "Stove Decor (Ingelmunster)",
    provincie: "wvl", grootte: "K", lat: 50.9200, lng: 3.2500,
    webshop: "Nee",
    info: "Haarden en interieur. Lalegno parketdealer. Ingelmunster.",
    activiteiten: ["parket"],
    adres: "Ingelmunster",
  },
  {
    naam: "Verhelst Bouwmaterialen (Kuurne)",
    provincie: "wvl", grootte: "G", lat: 50.8500, lng: 3.2850,
    webshop: "Nee",
    info: "Grote multispecialist bouwmaterialen. Tegels, parket, laminaat. 11 vestigingen in WVL. Ringlaan 26b, 8520 Kuurne.",
    activiteiten: ["houthandel", "parket"],
    adres: "Ringlaan 26b, 8520 Kuurne",
  },
  {
    naam: "Impermo (Wevelgem)",
    provincie: "wvl", grootte: "M", lat: 50.8130, lng: 3.1920,
    webshop: "Ja",
    info: "Grootste tegelaanbod Benelux. Ook parket en laminaat. Showrooms in Wevelgem, Oostende, Wetteren, Geel, Wilrijk, Sint-Truiden, Sint-Pieters-Leeuw.",
    activiteiten: ["parket", "online"],
    adres: "Kortrijkstraat 305, 8560 Wevelgem",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "Laminaatshop (Dendermonde)",
    provincie: "ovl", grootte: "M", lat: 51.0284, lng: 4.1010,
    webshop: "Ja",
    info: "Laminaat, parket, vinyl. Quick-Step Experience Center. Showroom 650m². Baasrodestraat 114, 9200 Dendermonde. BTW: BE 0809.922.383.",
    activiteiten: ["parket", "online"],
    btw: "BE 0809.922.383",
    adres: "Baasrodestraat 114, 9200 Dendermonde",
  },
  {
    naam: "MBC Vloeren (Gent)",
    provincie: "ovl", grootte: "K", lat: 51.0435, lng: 3.7174,
    webshop: "Nee",
    info: "PVC vloeren, parketvloeren en laminaat. Gent.",
    activiteiten: ["parket"],
    adres: "Gent",
  },
  {
    naam: "Declerck Luc (Zomergem/Lievegem)",
    provincie: "ovl", grootte: "K", lat: 51.1167, lng: 3.5583,
    webshop: "Nee",
    info: "Houthandel en Lalegno parketdealer. Zomergem/Lievegem.",
    activiteiten: ["houthandel", "parket"],
    adres: "Zomergem",
  },
  {
    naam: "Bouwmaterialen Leus (Melle)",
    provincie: "ovl", grootte: "M", lat: 51.0000, lng: 3.8000,
    webshop: "Nee",
    info: "Bouwmaterialen sinds 1890. Showrooms Melle + Sleidinge. Tegels, vloeren, parket. Veerweg 54, Melle.",
    activiteiten: ["houthandel", "parket"],
    adres: "Veerweg 54, 9090 Melle",
  },
  {
    naam: "Renovest Projects (Ronse)",
    provincie: "ovl", grootte: "K", lat: 50.7520, lng: 3.6000,
    webshop: "Nee",
    info: "Renovatieprojecten en Lalegno parketdealer. Ronse.",
    activiteiten: ["parket"],
    adres: "Ronse",
  },
  {
    naam: "Janssen Parketwerken (Knokke)",
    provincie: "wvl", grootte: "K", lat: 51.3500, lng: 3.2900,
    webshop: "Nee",
    info: "Parketwerken. Lalegno dealer. Knokke.",
    activiteiten: ["parket"],
    adres: "Knokke-Heist",
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
