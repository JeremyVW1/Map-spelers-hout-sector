/**
 * Voeg ontbrekende bedrijven toe aan bedrijven.json
 * Gevonden via belocal.be, bedrijvenpagina.be, goudengids.be websearches
 */
const fs = require("fs");
const bedrijven = JSON.parse(fs.readFileSync("data/bedrijven.json", "utf8"));

const bestaandeNamen = new Set(bedrijven.map((b) => b.naam.toLowerCase()));

const nieuw = [
  // ═══ WEST-VLAANDEREN — ontbrekend ═══
  {
    naam: "Houthandel Driekoningen (Beernem)",
    provincie: "wvl", grootte: "M", lat: 51.1339, lng: 3.3386,
    webshop: "Nee",
    info: "Houtzagerij en houthandel. Bruggestraat 130, 8730 Beernem. ~9.9 FTE.",
    btw: "BE 0405.189.586", rechtsvorm: "NV", medewerkers: 9.9,
    adres: "Bruggestraat 130, 8730 Beernem",
  },
  {
    naam: "Houthandel Himpe (Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.1936, lng: 3.1866,
    webshop: "Nee",
    info: "Houthandel Torhoutse Steenweg 392, 8200 Brugge (Sint-Andries).",
    btw: "BE 0421.693.147", rechtsvorm: "NV",
    adres: "Torhoutse Steenweg 392, 8200 Brugge",
  },
  {
    naam: "Houthandel Verbrugghe (Ieper)",
    provincie: "wvl", grootte: "K", lat: 50.8503, lng: 2.8850,
    webshop: "Nee",
    info: "Houthandel / VC Wood Ieper. Dehemlaan 4, 8900 Ieper. Opgericht 1992.",
    btw: "BE 0448.766.243", rechtsvorm: "BV", oprichting: "1992",
    adres: "Dehemlaan 4, 8900 Ieper",
  },
  {
    naam: "Houthandel N. De Vreese (Hooglede)",
    provincie: "wvl", grootte: "M", lat: 50.9850, lng: 3.0740,
    webshop: "Nee",
    info: "Houthandel. Kortemarktstraat 17B, 8830 Hooglede.",
    btw: "BE 0444.570.301", rechtsvorm: "NV",
    adres: "Kortemarktstraat 17B, 8830 Hooglede",
  },
  {
    naam: "Raes Marcel Houthandel (Hooglede)",
    provincie: "wvl", grootte: "K", lat: 50.9870, lng: 3.0710,
    webshop: "Nee",
    info: "Houthandel en zagerij. 8830 Hooglede.",
    btw: "BE 0422.276.038", rechtsvorm: "NV",
    adres: "8830 Hooglede",
  },
  {
    naam: "Horatec (Kuurne)",
    provincie: "wvl", grootte: "K", lat: 50.8520, lng: 3.2810,
    webshop: "Nee",
    info: "Houthandel/houtbewerking. 8520 Kuurne.",
    btw: "BE 0867.686.675", rechtsvorm: "NV",
    adres: "8520 Kuurne",
  },
  {
    naam: "Carpentier Hout (Kortemark)",
    provincie: "wvl", grootte: "K", lat: 51.0240, lng: 3.0440,
    webshop: "Nee",
    info: "Houthandel. 8610 Kortemark.",
    btw: "BE 0443.598.618", rechtsvorm: "BV",
    adres: "8610 Kortemark",
  },
  {
    naam: "Houthandel Anseeuw (Jabbeke)",
    provincie: "wvl", grootte: "K", lat: 51.1800, lng: 3.0870,
    webshop: "Nee",
    info: "Houthandel regio Jabbeke.",
  },
  {
    naam: "Van Den Hende (Kuurne)",
    provincie: "wvl", grootte: "K", lat: 50.8530, lng: 3.2830,
    webshop: "Nee",
    info: "Houthandel. Vlamingstraat 4, 8520 Kuurne.",
  },
  {
    naam: "Cube (Oostkamp)",
    provincie: "wvl", grootte: "K", lat: 51.1560, lng: 3.2390,
    webshop: "Nee",
    info: "Houthandel regio Oostkamp.",
  },
  {
    naam: "Huys Concept (Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.2080, lng: 3.2250,
    webshop: "Nee",
    info: "Houthandel. Kleine Pathoekeweg 40, 8000 Brugge.",
    btw: "BE 0405.118.124", rechtsvorm: "NV",
    adres: "Kleine Pathoekeweg 40, 8000 Brugge",
  },
  {
    naam: "Houthandel Leirman en Zonen (Gistel)",
    provincie: "wvl", grootte: "K", lat: 51.1580, lng: 2.9710,
    webshop: "Nee",
    info: "Houthandel. 8470 Gistel. Vestiging van Leirman-groep.",
    btw: "BE 0405.268.869", rechtsvorm: "BV",
    adres: "8470 Gistel",
  },

  // ═══ OOST-VLAANDEREN — ontbrekend ═══
  {
    naam: "Houthandel Deville-Claeys (Gent)",
    provincie: "ovl", grootte: "K", lat: 51.0540, lng: 3.7270,
    webshop: "Nee",
    info: "Houthandel regio Gent.",
  },
  {
    naam: "VC Wood Zottegem",
    provincie: "ovl", grootte: "K", lat: 50.8720, lng: 3.8110,
    webshop: "Nee",
    info: "Houthandel. Zottegem.",
  },
  {
    naam: "Van De Velde Hout (Wetteren)",
    provincie: "ovl", grootte: "K", lat: 51.0050, lng: 3.8810,
    webshop: "Nee",
    info: "Houthandel. Wetteren.",
  },
  {
    naam: "Houthandel Mollaert (Aalst)",
    provincie: "ovl", grootte: "K", lat: 50.9370, lng: 4.0380,
    webshop: "Nee",
    info: "Houthandel. Aalst.",
  },
  {
    naam: "Mannaert (Lebbeke)",
    provincie: "ovl", grootte: "K", lat: 51.0010, lng: 4.1360,
    webshop: "Nee",
    info: "Houthandel. Lebbeke.",
  },
  {
    naam: "Van Peteghem Hout en Interieur (Lochristi)",
    provincie: "ovl", grootte: "K", lat: 51.0990, lng: 3.8310,
    webshop: "Nee",
    info: "Houthandel en interieur. Lochristi.",
  },
  {
    naam: "Houtwereld (Maldegem)",
    provincie: "ovl", grootte: "K", lat: 51.2050, lng: 3.4370,
    webshop: "Nee",
    info: "Houthandel. Maldegem.",
  },
  {
    naam: "Van Impe-Moulart (Horebeke)",
    provincie: "ovl", grootte: "K", lat: 50.8360, lng: 3.6890,
    webshop: "Nee",
    info: "Houthandel. Horebeke.",
  },
  {
    naam: "Houthandel De Roose (Ninove)",
    provincie: "ovl", grootte: "K", lat: 50.8370, lng: 4.0240,
    webshop: "Nee",
    info: "Houthandel. Ninove.",
  },
  {
    naam: "Dewahout (Deinze)",
    provincie: "ovl", grootte: "M", lat: 50.9820, lng: 3.5250,
    webshop: "Ja",
    info: "Houthandel Deinze & Ronse. Ruim assortiment voor aannemer en particulier. 🌐 dewahout.be",
    website: "dewahout.be",
  },
  {
    naam: "Grimwood (Zulte)",
    provincie: "ovl", grootte: "K", lat: 50.9200, lng: 3.4500,
    webshop: "Nee",
    info: "Houthandel. Zulte.",
  },
  {
    naam: "Hout-Bois Van Steenberge (Zottegem)",
    provincie: "ovl", grootte: "K", lat: 50.8680, lng: 3.8150,
    webshop: "Nee",
    info: "Houthandel. Zottegem.",
  },
  {
    naam: "Lemahieu Group (Gent)",
    provincie: "ovl", grootte: "K", lat: 51.0540, lng: 3.7210,
    webshop: "Nee",
    info: "Houthandel. Gent.",
  },
  {
    naam: "Nieuwparket (Knesselare)",
    provincie: "ovl", grootte: "K", lat: 51.1430, lng: 3.4310,
    webshop: "Nee",
    info: "Parketspecialist. Knesselare/Aalter.",
    activiteiten: ["parket"],
  },
  {
    naam: "Quintelier (Dendermonde)",
    provincie: "ovl", grootte: "K", lat: 51.0280, lng: 4.1000,
    webshop: "Nee",
    info: "Houthandel. Dendermonde.",
  },
  {
    naam: "Hout Van Acker (Melsele)",
    provincie: "ovl", grootte: "K", lat: 51.2110, lng: 4.2880,
    webshop: "Nee",
    info: "Houthandel deuren. Melsele (Beveren).",
  },
  {
    naam: "Houthandel Van Bruyssel (Lokeren)",
    provincie: "ovl", grootte: "K", lat: 51.1020, lng: 3.9870,
    webshop: "Nee",
    info: "Houthandel. Lokeren.",
    btw: "BE 0425.558.992", rechtsvorm: "BV",
  },
  {
    naam: "Houthandel Roger Van Acker (Beveren)",
    provincie: "ovl", grootte: "K", lat: 51.2120, lng: 4.2530,
    webshop: "Nee",
    info: "Houthandel. Beveren-Waas.",
  },
  {
    naam: "Houthandel Piet Louwette (Sint-Niklaas)",
    provincie: "ovl", grootte: "K", lat: 51.1560, lng: 4.1380,
    webshop: "Nee",
    info: "Houthandel. Sint-Niklaas.",
  },
  {
    naam: "Vandewalle Houthandel (Sint-Niklaas)",
    provincie: "ovl", grootte: "K", lat: 51.1570, lng: 4.1310,
    webshop: "Nee",
    info: "Houthandel. Europark-Zuid, Sint-Niklaas.",
  },
  {
    naam: "Houthandel-Zagerij De Geyter (Lede)",
    provincie: "ovl", grootte: "K", lat: 50.9650, lng: 3.9830,
    webshop: "Nee",
    info: "Houthandel en zagerij. Wichelsesteenweg 196, 9340 Lede.",
    adres: "Wichelsesteenweg 196, 9340 Lede",
  },
  {
    naam: "Houthandel Van Herzeele (Nazareth)",
    provincie: "ovl", grootte: "K", lat: 50.9580, lng: 3.5960,
    webshop: "Nee",
    info: "Houthandel. Boeregemstraat 22, 9810 Nazareth.",
    adres: "Boeregemstraat 22, 9810 Nazareth",
  },

  // ═══ ANTWERPEN — ontbrekend ═══
  {
    naam: "Tilborghs Hout en Interieur (Kalmthout)",
    provincie: "ant", grootte: "K", lat: 51.3840, lng: 4.4690,
    webshop: "Nee",
    info: "Houthandel en interieur. Kalmthout.",
  },
  {
    naam: "Houthandel Thiels (Herselt)",
    provincie: "ant", grootte: "K", lat: 51.0520, lng: 4.8870,
    webshop: "Nee",
    info: "Houthandel. Herselt.",
  },
  {
    naam: "Houthandel De Roover (Willebroek)",
    provincie: "ant", grootte: "K", lat: 51.0640, lng: 4.3680,
    webshop: "Nee",
    info: "Houthandel. Willebroek.",
  },
  {
    naam: "Gijsbrechts (Hallaar)",
    provincie: "ant", grootte: "K", lat: 51.0550, lng: 4.5960,
    webshop: "Nee",
    info: "Houthandel. Hallaar (Heist-op-den-Berg).",
  },
  {
    naam: "Houthandel Segers (Schoten)",
    provincie: "ant", grootte: "K", lat: 51.2530, lng: 4.4970,
    webshop: "Nee",
    info: "Houthandel. Schoten.",
    btw: "BE 0474.349.103", rechtsvorm: "BV",
  },
  {
    naam: "Houthandel Marijnissen (Rijkevorsel)",
    provincie: "ant", grootte: "K", lat: 51.3480, lng: 4.7590,
    webshop: "Nee",
    info: "Houthandel. Rijkevorsel.",
    btw: "BE 0465.993.740", rechtsvorm: "BV",
  },
  {
    naam: "Houtzagerij Van Mechgelen (Arendonk)",
    provincie: "ant", grootte: "K", lat: 51.3210, lng: 5.0840,
    webshop: "Nee",
    info: "Houtzagerij en houthandel. Arendonk.",
    btw: "BE 0423.468.643", rechtsvorm: "BV",
  },
  {
    naam: "Houthandel Reynders (Meerhout)",
    provincie: "ant", grootte: "K", lat: 51.1310, lng: 5.0750,
    webshop: "Nee",
    info: "Houthandel. Meerhout.",
  },
  {
    naam: "Houthandel Hendricks (Mechelen)",
    provincie: "ant", grootte: "K", lat: 51.0280, lng: 4.4810,
    webshop: "Nee",
    info: "Houthandel. Mechelen.",
  },
  {
    naam: "Houthandel Helsen (Kasterlee)",
    provincie: "ant", grootte: "K", lat: 51.2410, lng: 4.9690,
    webshop: "Nee",
    info: "Houthandel. Kasterlee.",
  },
  {
    naam: "Houthandel Vervecken (Arendonk)",
    provincie: "ant", grootte: "K", lat: 51.3180, lng: 5.0880,
    webshop: "Nee",
    info: "Houthandel. Arendonk.",
  },
  {
    naam: "Houthandel Coomans (Laakdal)",
    provincie: "ant", grootte: "K", lat: 51.0870, lng: 4.9640,
    webshop: "Nee",
    info: "Houthandel. Laakdal.",
  },
  {
    naam: "Paulussen Houthandel (Retie)",
    provincie: "ant", grootte: "K", lat: 51.2660, lng: 5.0840,
    webshop: "Nee",
    info: "Houthandel. Retie.",
    btw: "BE 0471.393.175", rechtsvorm: "BV",
  },
  {
    naam: "Houtbedrijf Van Den Broeck (Retie)",
    provincie: "ant", grootte: "K", lat: 51.2700, lng: 5.0810,
    webshop: "Nee",
    info: "Houtbedrijf. Retie.",
  },
  {
    naam: "Hout Feyen (Dessel)",
    provincie: "ant", grootte: "K", lat: 51.2370, lng: 5.1150,
    webshop: "Nee",
    info: "Houthandel. Dessel.",
  },
  {
    naam: "Hout- & Bouwmarkt Kasterlee",
    provincie: "ant", grootte: "K", lat: 51.2430, lng: 4.9650,
    webshop: "Nee",
    info: "Hout- en bouwmarkt. Kasterlee.",
  },

  // ═══ TUINHUIZEN / CARPORT specialisten — ontbrekend ═══
  {
    naam: "DG Wood Construct (Izegem)",
    provincie: "wvl", grootte: "K", lat: 50.9150, lng: 3.2160,
    webshop: "Nee",
    info: "Carports, houtwerk en houtbouw. Izegem. 🌐 dgwoodconstruct.be",
    activiteiten: ["tuinhuis"],
  },
  {
    naam: "Koekuyt Tuindesign (Roeselare)",
    provincie: "wvl", grootte: "K", lat: 50.9460, lng: 3.1260,
    webshop: "Nee",
    info: "Zwembaden, carports, garages, tuinhuisjes. Roeselare.",
    activiteiten: ["tuinhuis"],
  },
  {
    naam: "Wood Arts (Avelgem)",
    provincie: "wvl", grootte: "K", lat: 50.7740, lng: 3.4440,
    webshop: "Nee",
    info: "Houten garages, carports, toegangspoorten. Avelgem. 🌐 woodarts.be",
    activiteiten: ["tuinhuis"],
  },
  {
    naam: "CSS Outdoor Living (Ninove)",
    provincie: "ovl", grootte: "K", lat: 50.8340, lng: 4.0280,
    webshop: "Nee",
    info: "Terrasoverkapping, pergola, carport. Ninove.",
    activiteiten: ["tuinhuis"],
  },

  // ═══ PARKET specialisten — ontbrekend ═══
  {
    naam: "Westparket (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8800, lng: 3.4270,
    webshop: "Nee",
    info: "Parketspecialist. Desselgem/Waregem. 🌐 westparket.be",
    activiteiten: ["parket"],
  },
  {
    naam: "JS Parket (Waregem)",
    provincie: "wvl", grootte: "K", lat: 50.8780, lng: 3.4310,
    webshop: "Nee",
    info: "Parket plaatsen, onderhouden, herstellen. Waregem. 🌐 jsparket.be",
    activiteiten: ["parket"],
  },
  {
    naam: "Blondeel Parket (Knokke-Heist)",
    provincie: "wvl", grootte: "K", lat: 51.3470, lng: 3.2640,
    webshop: "Nee",
    info: "Parketspecialist. Knokke-Heist.",
    activiteiten: ["parket"],
  },
  {
    naam: "Ka-parket (Blankenberge)",
    provincie: "wvl", grootte: "K", lat: 51.3130, lng: 3.1310,
    webshop: "Nee",
    info: "Parketvloeren sinds 2002. Blankenberge. 🌐 ka-parket.be",
    activiteiten: ["parket"],
  },
  {
    naam: "BV Parket (Diksmuide)",
    provincie: "wvl", grootte: "K", lat: 51.0330, lng: 2.8640,
    webshop: "Nee",
    info: "Parketvloeren. Quick-step, Parador, Parky. Beerst/Diksmuide.",
    activiteiten: ["parket"],
  },
  {
    naam: "Renoba Parket (Brugge)",
    provincie: "wvl", grootte: "K", lat: 51.2090, lng: 3.2240,
    webshop: "Nee",
    info: "Houten vloeren en parket. Brugge.",
    activiteiten: ["parket"],
  },

  // ═══ ONLINE WEBSHOPS — ontbrekend ═══
  {
    naam: "HoutOpMaatGezaagd.be",
    provincie: "online", grootte: "K", lat: 51.0500, lng: 3.7200,
    webshop: "Ja",
    info: "Online hout op maat bestellen. 🌐 houtopmaatgezaagd.be",
  },
  {
    naam: "Limtrade.be",
    provincie: "online", grootte: "K", lat: 51.0000, lng: 5.3500,
    webshop: "Ja",
    info: "Online hout webshop. Balken, hardhout, platen, tuinhout. 🌐 limtrade.be",
  },
  {
    naam: "Woodlet.be",
    provincie: "online", grootte: "K", lat: 51.0500, lng: 3.7300,
    webshop: "Ja",
    info: "Hout outlet / online houtverkoop. 🌐 woodlet.be",
  },
  {
    naam: "De Houtboer (online)",
    provincie: "online", grootte: "K", lat: 51.5000, lng: 5.4700,
    webshop: "Ja",
    info: "Online hout webshop B2B en B2C. 🌐 dehoutboer.com",
  },
];

let added = 0;
nieuw.forEach((b) => {
  const key = b.naam.toLowerCase();
  if (!bestaandeNamen.has(key)) {
    bedrijven.push(b);
    bestaandeNamen.add(key);
    added++;
  } else {
    console.log(`  ⏩ Overgeslagen (bestaat al): ${b.naam}`);
  }
});

fs.writeFileSync("data/bedrijven.json", JSON.stringify(bedrijven, null, 2), "utf8");
console.log(`✓ ${added} bedrijven toegevoegd (totaal: ${bedrijven.length})`);
