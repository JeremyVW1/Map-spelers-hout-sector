/**
 * Ronde 5 — parket-info.be directories + extra vondsten
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));
const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ FABRIKANTEN ═══
  {
    naam: "Balterio / Spanolux (Sint-Baafs-Vijve)",
    provincie: "wvl", grootte: "G", lat: 50.9010, lng: 3.3540,
    webshop: "Nee",
    info: "Laminaatfabrikant. Divisie van Spanolux NV. Wakkensteenweg 37B, 8710 Sint-Baafs-Vijve.",
    activiteiten: ["parket", "import"],
    adres: "Wakkensteenweg 37B, 8710 Sint-Baafs-Vijve",
  },

  // ═══ WEST-VLAANDEREN ═══
  {
    naam: "Claerhout Interiors (Harelbeke)",
    provincie: "wvl", grootte: "K", lat: 50.8545, lng: 3.3050,
    webshop: "Nee",
    info: "Parketlegger. Massieve plankvloeren, stijlparketten, verouderd parket. Kortrijksesteenweg 20, 8530 Harelbeke.",
    activiteiten: ["parket"],
    adres: "Kortrijksesteenweg 20, 8530 Harelbeke",
  },
  {
    naam: "FL Decor (Meulebeke)",
    provincie: "wvl", grootte: "K", lat: 50.9510, lng: 3.2870,
    webshop: "Nee",
    info: "Parket specialist. Nijverheidsstraat 32, 8760 Meulebeke.",
    activiteiten: ["parket"],
    adres: "Nijverheidsstraat 32, 8760 Meulebeke",
  },
  {
    naam: "Dan-Parket (Izegem)",
    provincie: "wvl", grootte: "K", lat: 50.9130, lng: 3.2150,
    webshop: "Nee",
    info: "Parketlegger regio Izegem.",
    activiteiten: ["parket"],
    adres: "Izegem",
  },
  {
    naam: "Houtstudio (Roeselare)",
    provincie: "wvl", grootte: "K", lat: 50.9470, lng: 3.1260,
    webshop: "Nee",
    info: "Parket bij de vakman. Breed assortiment parketvloeren, van modern tot klassiek. Eigen plaatsingsteam. Roeselare.",
    activiteiten: ["parket"],
    adres: "Roeselare",
  },
  {
    naam: "Kyndt Parket (Knokke-Heist)",
    provincie: "wvl", grootte: "K", lat: 51.3460, lng: 3.2920,
    webshop: "Nee",
    info: "Parketlegger Westkapelle, Knokke-Heist.",
    activiteiten: ["parket"],
    adres: "Knokke-Heist",
  },
  {
    naam: "Solid International (Brugge)",
    provincie: "wvl", grootte: "M", lat: 51.2000, lng: 3.2200,
    webshop: "Nee",
    info: "Distributeur massief en meerlagig eiken parket + binnendeuren. Brugge.",
    activiteiten: ["parket", "import"],
    adres: "Brugge",
  },
  {
    naam: "Revan Flooring (Oostende)",
    provincie: "wvl", grootte: "M", lat: 51.2055, lng: 2.8760,
    webshop: "Nee",
    info: "Vloeren: parket, vinyl, kurk, spuitkurk, traprenovatie. Torhoutsesteenweg 649, Oostende. Vestiging ook in Roeselare.",
    activiteiten: ["parket"],
    adres: "Torhoutsesteenweg 649, 8400 Oostende",
  },
  {
    naam: "Antiek Bouw (Ieper)",
    provincie: "wvl", grootte: "K", lat: 50.8503, lng: 2.8850,
    webshop: "Nee",
    info: "Hout, parket, antieke bouwmaterialen. Lalegno dealer. Ieper.",
    activiteiten: ["parket", "houthandel"],
    adres: "Ieper",
  },
  {
    naam: "Cornilly (Moerkerke/Damme)",
    provincie: "wvl", grootte: "K", lat: 51.2400, lng: 3.3550,
    webshop: "Nee",
    info: "Parketlegger Moerkerke (Damme).",
    activiteiten: ["parket"],
    adres: "Moerkerke, 8340 Damme",
  },
  {
    naam: "Vermeylen Parket (Westrozebeke)",
    provincie: "wvl", grootte: "K", lat: 50.9150, lng: 2.9930,
    webshop: "Nee",
    info: "Parket en schilderwerken. Westrozebeke.",
    activiteiten: ["parket"],
    adres: "Westrozebeke",
  },
  {
    naam: "Vanhaelewyn (Gits/Hooglede)",
    provincie: "wvl", grootte: "K", lat: 50.9820, lng: 3.1050,
    webshop: "Nee",
    info: "Parketlegger Gits (Hooglede).",
    activiteiten: ["parket"],
    adres: "Gits, 8830 Hooglede",
  },

  // ═══ OOST-VLAANDEREN ═══
  {
    naam: "Kurk en Parket Hoorewege (Aalter)",
    provincie: "ovl", grootte: "K", lat: 51.0895, lng: 3.4320,
    webshop: "Nee",
    info: "Specialist kurk en parket. Showroom 1200+ opties. Lalegno dealer. Lostraat 17, 9880 Aalter.",
    activiteiten: ["parket"],
    adres: "Lostraat 17, 9880 Aalter",
  },
  {
    naam: "Foré NV (Eeklo)",
    provincie: "ovl", grootte: "K", lat: 51.1850, lng: 3.5610,
    webshop: "Nee",
    info: "Houthandel en parketdealer. Eeklo.",
    activiteiten: ["houthandel", "parket"],
    adres: "Eeklo",
  },
  {
    naam: "COnect Woodbelievers (Oudenaarde)",
    provincie: "ovl", grootte: "K", lat: 50.8450, lng: 3.6050,
    webshop: "Nee",
    info: "Hout en parketspecialist. Oudenaarde.",
    activiteiten: ["parket", "houthandel"],
    adres: "Oudenaarde",
  },
  {
    naam: "Het Parketpunt (Sint-Niklaas)",
    provincie: "ovl", grootte: "K", lat: 51.1550, lng: 4.1330,
    webshop: "Nee",
    info: "Interieurprojecten en decoratie. Laminaat, parket, vloeren, keukens. Driekoningenstraat 101, Sint-Niklaas.",
    activiteiten: ["parket"],
    adres: "Driekoningenstraat 101, 9100 Sint-Niklaas",
  },
  {
    naam: "DL Parket (Dendermonde)",
    provincie: "ovl", grootte: "K", lat: 51.0300, lng: 4.1000,
    webshop: "Nee",
    info: "Parketlegger Dendermonde.",
    activiteiten: ["parket"],
    adres: "Dendermonde",
  },
  {
    naam: "Lumaco (Ronse)",
    provincie: "ovl", grootte: "K", lat: 50.7510, lng: 3.6010,
    webshop: "Nee",
    info: "Parket en vloeren. Ronse.",
    activiteiten: ["parket"],
    adres: "Ronse",
  },
  {
    naam: "Stavan (Kuurne)",
    provincie: "wvl", grootte: "K", lat: 50.8550, lng: 3.2800,
    webshop: "Nee",
    info: "Parketbedrijf Kuurne.",
    activiteiten: ["parket"],
    adres: "Kuurne",
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
