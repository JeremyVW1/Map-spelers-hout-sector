/**
 * Voeg 2e ronde ontbrekende parketbedrijven toe (WVL + OVL)
 * Diepere zoektocht via goudengids, parket-info, companyweb
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN — parket ronde 2 ═══
  {
    naam: "Vermeersch Parket (Zedelgem)",
    provincie: "wvl", grootte: "M", lat: 51.1372, lng: 3.1375,
    webshop: "Nee",
    info: "Meester parqueteur sinds 1911. Specialist parketvloeren. Torhoutsesteenweg 155, 8210 Zedelgem. BTW: BE 0684.639.757.",
    activiteiten: ["parket"],
    btw: "BE 0684.639.757",
    adres: "Torhoutsesteenweg 155, 8210 Zedelgem",
  },
  {
    naam: "Parket Bram Bossuyt (Izegem)",
    provincie: "wvl", grootte: "K", lat: 50.9128, lng: 3.2113,
    webshop: "Nee",
    info: "Familiebedrijf. Plaatsing en renovatie massief en semi-massief parket. Showroom Izegem. Mandelstraat 69, 8870 Izegem.",
    activiteiten: ["parket"],
    adres: "Mandelstraat 69, 8870 Izegem",
  },
  {
    naam: "Danneels Interieur (Knokke-Heist)",
    provincie: "wvl", grootte: "K", lat: 51.3433, lng: 3.2870,
    webshop: "Nee",
    info: "Interieur en parketspecialist sinds 1997. Plafonds, wanden, kasten, parket. 't Walletje 80, Knokke-Heist.",
    activiteiten: ["parket"],
    adres: "'t Walletje 80, 8300 Knokke-Heist",
  },
  {
    naam: "Parketvloeren G. Mulliez (Oostrozebeke)",
    provincie: "wvl", grootte: "K", lat: 50.9292, lng: 3.3460,
    webshop: "Nee",
    info: "Parketspecialist sinds 2010, 10+ jaar ervaring. Waterstraat 4, 8780 Oostrozebeke. BTW: BE 0588.970.835.",
    activiteiten: ["parket"],
    btw: "BE 0588.970.835",
    adres: "Waterstraat 4, 8780 Oostrozebeke",
  },
  {
    naam: "B&N Hout (Wevelgem)",
    provincie: "wvl", grootte: "K", lat: 50.8097, lng: 3.1950,
    webshop: "Nee",
    info: "Fabrikant massief parket, 5 generaties. Ook trappen, vensterbanken, gevelbekleding. Salinusstraat 41, 8560 Wevelgem. BTW: BE 0892.082.472.",
    activiteiten: ["parket", "terrassen"],
    btw: "BE 0892.082.472",
    adres: "Salinusstraat 41, 8560 Wevelgem",
  },
  {
    naam: "Emex Interior (Knokke-Heist)",
    provincie: "wvl", grootte: "M", lat: 51.3363, lng: 3.2917,
    webshop: "Nee",
    info: "Haarden, parket, natuursteen, vloeren en interieur. 30+ jaar. Showrooms Knokke + Meulebeke. Natiënlaan 201, 8300 Knokke-Heist.",
    activiteiten: ["parket"],
    adres: "Natiënlaan 201, 8300 Knokke-Heist",
  },
  {
    naam: "Proworks (Poelkapelle)",
    provincie: "wvl", grootte: "K", lat: 50.9083, lng: 2.9497,
    webshop: "Nee",
    info: "Parket, houten terrassen, gevelbekleding, houten poorten. Meesters in hout.",
    activiteiten: ["parket", "terrassen"],
    adres: "Poelkapelle",
  },
  {
    naam: "Guy Van Borm (Ardooie)",
    provincie: "wvl", grootte: "K", lat: 50.9703, lng: 3.2119,
    webshop: "Nee",
    info: "Schrijnwerker. Parket en laminaat plaatsing. Regio Gent-Deinze-Waregem-Oostende-Knokke.",
    activiteiten: ["parket"],
    adres: "Ardooie",
  },
  {
    naam: "Parket Matthys Koen (Deinze)",
    provincie: "ovl", grootte: "K", lat: 50.9833, lng: 3.5261,
    webshop: "Nee",
    info: "Parketteur. 15+ jaar ervaring. Plaatsing en renovatie alle parket. Regio Deinze-Gent-Knokke.",
    activiteiten: ["parket"],
    adres: "Deinze",
  },

  // ═══ OOST-VLAANDEREN — parket ronde 2 ═══
  {
    naam: "Parquet De Flandre (Erpe-Mere)",
    provincie: "ovl", grootte: "M", lat: 50.9245, lng: 3.9478,
    webshop: "Ja",
    info: "Europese parketfabrikant (engineered flooring). Gentsesteenweg 44A, 9420 Erpe-Mere. BTW: BE 1017.207.029. Webshop.",
    activiteiten: ["parket", "import", "online"],
    btw: "BE 1017.207.029",
    adres: "Gentsesteenweg 44A, 9420 Erpe-Mere",
  },
  {
    naam: "Floordesign (Geraardsbergen)",
    provincie: "ovl", grootte: "K", lat: 50.7815, lng: 3.8780,
    webshop: "Nee",
    info: "Parketlegger en renovatie. Eigen showroom. Aalstsesteenweg 168, 9506 Smeerebbe-Vloerzegem. 8+ jaar ervaring.",
    activiteiten: ["parket"],
    adres: "Aalstsesteenweg 168, 9506 Smeerebbe-Vloerzegem",
  },
  {
    naam: "Parket Idee (Sint-Niklaas)",
    provincie: "ovl", grootte: "K", lat: 51.1575, lng: 4.1275,
    webshop: "Nee",
    info: "Specialist plaatsing, renovatie en restauratie houten vloeren. Nieuwkerkenstraat 129, 9100 Sint-Niklaas. BTW: BE 0840.910.519.",
    activiteiten: ["parket"],
    btw: "BE 0840.910.519",
    adres: "Nieuwkerkenstraat 129, 9100 Sint-Niklaas",
  },
  {
    naam: "PDW Parketvloeren (Hamme)",
    provincie: "ovl", grootte: "K", lat: 51.0958, lng: 4.1350,
    webshop: "Nee",
    info: "Familiebedrijf, 70+ jaar ervaring. Verkoop, plaatsing en restauratie parket. Roodkruisstraat 100, 9220 Hamme.",
    activiteiten: ["parket"],
    adres: "Roodkruisstraat 100, 9220 Hamme",
  },
  {
    naam: "Heylen & Co Parket (Scheldewindeke)",
    provincie: "ovl", grootte: "K", lat: 50.9465, lng: 3.7950,
    webshop: "Nee",
    info: "Parketspecialist regio Scheldewindeke/Oosterzele.",
    activiteiten: ["parket"],
    adres: "Scheldewindeke",
  },
  {
    naam: "Luc Callant Decoratieteam (Knokke)",
    provincie: "wvl", grootte: "K", lat: 51.3470, lng: 3.2650,
    webshop: "Nee",
    info: "Decoratiewinkel Knokke. Parketplaatsing, herstelling en onderhoud.",
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
console.log(`\n✓ ${added} parketbedrijven toegevoegd (totaal: ${bedrijven.length})`);
