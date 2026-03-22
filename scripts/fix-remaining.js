const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));

const fixes = [
  { naam: "Cornelis Hout", adres: "Noorwegenstraat 53, 9940 Evergem" },
  { naam: "Callewood", adres: "9270 Kalken" },
  { naam: "Rodi NV", adres: "Lodderhoek 4, 8000 Brugge" },
  { naam: "moduus", adres: "Noorwegenstraat 22, 9940 Evergem" },
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
  for (const fix of fixes) {
    const matches = data.filter(c => c.naam.toLowerCase().includes(fix.naam.toLowerCase()));
    if (matches.length === 0) {
      console.log(`Not found: ${fix.naam}`);
      continue;
    }

    const geo = await geocode(fix.adres);
    if (!geo) {
      console.log(`Geocode failed: ${fix.naam} — ${fix.adres}`);
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    for (const c of matches) {
      const old = `[${c.lat},${c.lng}]`;
      c.lat = parseFloat(geo.lat.toFixed(4));
      c.lng = parseFloat(geo.lng.toFixed(4));
      console.log(`✅ ${c.naam}: ${old} → [${c.lat},${c.lng}] (${geo.display})`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2));
  console.log('\nSaved.');
}

main().catch(console.error);
