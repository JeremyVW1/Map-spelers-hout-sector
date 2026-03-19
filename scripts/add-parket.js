/**
 * Voeg ontbrekende parketbedrijven toe (WVL + OVL)
 * Gevonden via websearches op parket-info.be, goudengids.be, companyweb.be
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN — parket ═══
  {
    naam: "Parket Reyserhove (Jabbeke)",
    provincie: "wvl", grootte: "M", lat: 51.1808, lng: 3.0776,
    webshop: "Nee",
    info: "Parketfabrikant en -legger. 50+ jaar ervaring. Eigen productie + plaatsing. Gistelsteenweg 2B, 8490 Jabbeke.",
    activiteiten: ["parket"],
    adres: "Gistelsteenweg 2B, 8490 Jabbeke",
  },
  {
    naam: "Parket Vanackere (Wevelgem)",
    provincie: "wvl", grootte: "K", lat: 50.8097, lng: 3.1862,
    webshop: "Nee",
    info: "Parketshowroom en plaatsing. Roeselarestraat 305, 8560 Wevelgem.",
    activiteiten: ["parket"],
    adres: "Roeselarestraat 305, 8560 Wevelgem",
  },
  {
    naam: "Parket Center (Kuurne)",
    provincie: "wvl", grootte: "M", lat: 50.8540, lng: 3.2785,
    webshop: "Nee",
    info: "Parket, laminaat, kurk en vinyl vloeren. Lalegno dealer. Ter Ferrants 16, 8520 Kuurne. BTW: BE 0479.474.463.",
    activiteiten: ["parket"],
    btw: "BE 0479.474.463",
    adres: "Ter Ferrants 16, 8520 Kuurne",
  },
  {
    naam: "Parket Atelier (Ruiselede)",
    provincie: "wvl", grootte: "K", lat: 51.0588, lng: 3.3875,
    webshop: "Nee",
    info: "Specialist parketvloeren, houten vloeren en gevelbekleding. Showroom in Ruiselede. parketvloeren.be.",
    activiteiten: ["parket", "terrassen"],
    adres: "8510 Ruiselede",
  },
  {
    naam: "Woodstoxx (Menen)",
    provincie: "wvl", grootte: "M", lat: 50.7978, lng: 3.1310,
    webshop: "Nee",
    info: "Producent meerlagig parket en gevelbekleding. Zusterbedrijf Belgiqa. Experience centres in Antwerpen, Brussel, Gent, Menen. Hogeweg 245, 8930 Menen. BTW: BE 0887.365.995.",
    activiteiten: ["parket", "terrassen", "import"],
    btw: "BE 0887.365.995",
    adres: "Hogeweg 245, 8930 Menen",
  },
  {
    naam: "Lalegno (Waregem)",
    provincie: "wvl", grootte: "G", lat: 50.8728, lng: 3.3861,
    webshop: "Nee",
    info: "Grote parketfabrikant. Meerlagig parket, eik, bamboe, exotisch. Duurzaam. Sprietestraat 326, 8792 Waregem. BTW: BE 0462.371.281.",
    activiteiten: ["parket", "import"],
    btw: "BE 0462.371.281",
    adres: "Sprietestraat 326, 8792 Waregem",
  },
  {
    naam: "Cappelle Marnix Parket (Tielt)",
    provincie: "wvl", grootte: "K", lat: 51.0002, lng: 3.3226,
    webshop: "Nee",
    info: "Parketvloeren, houten vloeren en laminaat. Lalegno dealer. Galgenveldstraat 15, 8700 Tielt. BTW: BE 0479.332.527.",
    activiteiten: ["parket"],
    btw: "BE 0479.332.527",
    adres: "Galgenveldstraat 15, 8700 Tielt",
  },
  {
    naam: "Strolé Parket (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8822, lng: 3.4178,
    webshop: "Nee",
    info: "Parket, laminaat, vinyl, parketrenovatie. Albert Saverysstraat 12, 8790 Waregem. BTW: BE 0744.618.025.",
    activiteiten: ["parket"],
    btw: "BE 0744.618.025",
    adres: "Albert Saverysstraat 12, 8790 Waregem",
  },
  {
    naam: "Jagro (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8760, lng: 3.4055,
    webshop: "Nee",
    info: "Showroom parket, laminaat, vinyl, binnenbekleding. PEFC-gecertificeerd. Eikenlaan 86A, 8790 Waregem. BTW: BE 0704.644.721.",
    activiteiten: ["parket"],
    btw: "BE 0704.644.721",
    adres: "Eikenlaan 86A, 8790 Waregem",
  },
  {
    naam: "FCC Floor Contractors (Nieuwpoort)",
    provincie: "wvl", grootte: "K", lat: 51.1262, lng: 2.7498,
    webshop: "Nee",
    info: "Parketlegger en vloercontractor. Regio Nieuwpoort-Kust.",
    activiteiten: ["parket"],
    adres: "Nieuwpoort",
  },

  // ═══ OOST-VLAANDEREN — parket ═══
  {
    naam: "Gustaaf Seghers & Zonen (Beveren)",
    provincie: "ovl", grootte: "M", lat: 51.2100, lng: 4.2510,
    webshop: "Nee",
    info: "Ambachtelijk familiebedrijf, 4 generaties. Leider parketvakmanschap Vlaanderen. Zillebeek 26, 9120 Beveren. BTW: BE 0641.748.337.",
    activiteiten: ["parket"],
    btw: "BE 0641.748.337",
    adres: "Zillebeek 26, 9120 Beveren",
  },
  {
    naam: "De Waegeneer Parketvloeren (Aalst)",
    provincie: "ovl", grootte: "M", lat: 50.9190, lng: 4.0291,
    webshop: "Nee",
    info: "Familiebedrijf, 75+ jaar ervaring. Toonzaal Erembodegem. Levering, plaatsing en renovatie parket.",
    activiteiten: ["parket"],
    adres: "Erembodegem, 9320 Aalst",
  },
  {
    naam: "Parket Valentin (Erembodegem/Aalst)",
    provincie: "ovl", grootte: "K", lat: 50.9230, lng: 4.0195,
    webshop: "Nee",
    info: "Parketvloeren en spanplafonds. Vernieuwde showroom. Houten terrassen. Dreefstraat 32, 9320 Erembodegem. BTW: BE 0831.482.218.",
    activiteiten: ["parket", "terrassen"],
    btw: "BE 0831.482.218",
    adres: "Dreefstraat 32, 9320 Erembodegem",
  },
  {
    naam: "Floorever (Eeklo)",
    provincie: "ovl", grootte: "K", lat: 51.1872, lng: 3.5656,
    webshop: "Nee",
    info: "Parket, laminaat (Pergo verdeler), vinyl. 650m² showroom. Boelare 114, 9900 Eeklo. Ook vestiging Sint-Niklaas.",
    activiteiten: ["parket"],
    adres: "Boelare 114, 9900 Eeklo",
  },
  {
    naam: "Parketlounge (Destelbergen)",
    provincie: "ovl", grootte: "K", lat: 51.0510, lng: 3.8020,
    webshop: "Nee",
    info: "Familiebedrijf sinds 1991. Specialist gestabiliseerd parket. Showroom op afspraak in Destelbergen.",
    activiteiten: ["parket"],
    adres: "Destelbergen",
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
console.log(`\n✓ ${added} parketbedrijven toegevoegd (totaal: ${bedrijven.length})`);
