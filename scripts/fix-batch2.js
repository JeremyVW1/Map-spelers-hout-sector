const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));

const fixes = [
  { index: 17, adres: "Mellestraat 226, 8501 Heule", searchQ: "Mellestraat 226, Heule" },
  { index: 125, adres: "Eegene 45, 9200 Dendermonde", searchQ: "Eegene 45, Dendermonde" },
  { index: 126, adres: "Kammenstraat 31, 9300 Aalst", searchQ: "Kammenstraat 31, Aalst" },
  { index: 133, adres: "Begijnendreef 38, 2300 Turnhout", searchQ: "Begijnendreef 38, Turnhout" },
  { index: 143, adres: "Lange Munte 7, 9860 Oosterzele", searchQ: "Lange Munte, Scheldewindeke" },
];

function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=be`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart-b2/1.0' } }, (res) => {
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
    const c = data[fix.index];
    const geo = await geocode(fix.searchQ);

    if (!geo) {
      console.log(`❌ [${fix.index}] ${c.naam}: geocode failed for "${fix.searchQ}"`);
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    const oldLat = c.lat, oldLng = c.lng;
    c.lat = parseFloat(geo.lat.toFixed(4));
    c.lng = parseFloat(geo.lng.toFixed(4));
    c.adres = fix.adres;
    console.log(`✅ [${fix.index}] ${c.naam}: [${oldLat},${oldLng}] → [${c.lat},${c.lng}]`);
    console.log(`   ${geo.display}`);

    await new Promise(r => setTimeout(r, 1500));
  }

  fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2));
  console.log('\nSaved.');
}

main().catch(console.error);
