const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));

// The 12 companies with known location issues + their correct physical addresses
const fixes = [
  { naam: "Houthandel Leirman", adres: "Manitobalaan 46, Gistel, Belgium" },
  { naam: "'t Houtboerke", adres: "Langerbruggekaai 5, Gent, Belgium" },
  { naam: "Houtvercruysse", adres: "Bissegemstraat 165, Gullegem, Belgium" },
  { naam: "Houthandel Loose", adres: "Zandstraat 210, Sint-Andries, Brugge, Belgium" },
  { naam: "Goeminne Tuinhout", adres: "Kerkstraat 88, Gavere, Belgium" },
  { naam: "Houthandel Himpe", adres: "Torhoutse Steenweg 392, Brugge, Belgium" },
  { naam: "Parket Lefevere", adres: "'t Lindeke 31, Sint-Eloois-Winkel, Belgium" },
  { naam: "Cornelis Hout", adres: "Noorwegenstraat 53, Evergem, Belgium" },
  { naam: "Callewood", adres: "Kalken, Laarne, Belgium" },
  { naam: "Rodi NV", adres: "Lodderhoek 4, Brugge, Belgium" },
  { naam: "moduus", adres: "Noorwegenstraat 22, Evergem, Belgium" },
];

function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=be`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart-fix/1.0' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.length > 0) resolve({ lat: parseFloat(r[0].lat), lng: parseFloat(r[0].lon), display: r[0].display_name });
          else resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  let fixed = 0;

  for (const fix of fixes) {
    // Find company in data (partial match on naam)
    const matches = data.filter(c => c.naam.toLowerCase().includes(fix.naam.toLowerCase()));
    if (matches.length === 0) {
      console.log(`❌ Not found: ${fix.naam}`);
      continue;
    }

    const geo = await geocode(fix.adres);
    if (!geo) {
      console.log(`❌ Geocode failed: ${fix.naam} — ${fix.adres}`);
      await new Promise(r => setTimeout(r, 1100));
      continue;
    }

    for (const c of matches) {
      const oldLat = c.lat, oldLng = c.lng;
      c.lat = parseFloat(geo.lat.toFixed(4));
      c.lng = parseFloat(geo.lng.toFixed(4));
      // Update adres field too
      const adresClean = fix.adres.replace(', Belgium', '').replace(', Brugge', '');
      if (!c.adres || c.adres.length < 5) c.adres = adresClean;
      console.log(`✅ ${c.naam}: [${oldLat},${oldLng}] → [${c.lat},${c.lng}] (${geo.display})`);
      fixed++;
    }

    await new Promise(r => setTimeout(r, 1100));
  }

  fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2));
  console.log(`\nDone! Fixed ${fixed} entries. Saved to bedrijven.json`);
}

main().catch(console.error);
