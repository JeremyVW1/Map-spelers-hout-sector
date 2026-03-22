const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));

// Companies with specific addresses that need fixing
const fixes = [
  { index: 42, adres: "Peyenbeek 4, 9400 Ninove" },
  { index: 108, adres: "Peyenbeek 4, 9400 Ninove" },
  { index: 161, adres: "Mellestraat 226, 8501 Heule" },  // Messely Moorslede = same as Heule
  { index: 177, adres: "Doorniksesteenweg 202, 8580 Avelgem" },
  { index: 183, adres: "Mellestraat 226, 8501 Heule" },  // Messely duplicate
  { index: 210, adres: "Doorniksesteenweg 202, 8580 Avelgem" }, // Verdonckt dup
  { index: 221, adres: "Eegene 45, 9200 Dendermonde" },
  { index: 236, adres: "Doorniksesteenweg 202, 8580 Avelgem" }, // Verdonckt dup
  { index: 239, adres: "Torhoutse Steenweg 392, 8200 Brugge" },
  { index: 271, adres: "Boeregemstraat 22, 9810 Nazareth" },
  { index: 302, adres: "Gistelsteenweg 2B, 8490 Jabbeke" },
  { index: 328, adres: "Nieuwkerkenstraat 129, 9100 Sint-Niklaas" },
  { index: 395, adres: "Lodderhoek 4, 8000 Brugge" },
  { index: 401, adres: "Rekkem, 8930 Menen" },
  { index: 406, adres: "Kluizenhof 27, 9170 Sint-Gillis-Waas" },
];

function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ', Belgium')}&limit=1`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart-fix3/1.0' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.features && r.features.length > 0) {
            const c = r.features[0].geometry.coordinates;
            resolve({ lat: c[1], lng: c[0] });
          } else resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// Deduplicate by address to reduce geocoding calls
const uniqueAddrs = [...new Set(fixes.map(f => f.adres))];
const geoCache = {};

async function main() {
  // Geocode unique addresses
  for (const addr of uniqueAddrs) {
    const geo = await geocode(addr);
    if (geo) {
      geoCache[addr] = { lat: parseFloat(geo.lat.toFixed(4)), lng: parseFloat(geo.lng.toFixed(4)) };
      console.log(`📍 ${addr} → [${geoCache[addr].lat}, ${geoCache[addr].lng}]`);
    } else {
      console.log(`❌ ${addr} → failed`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  // Apply fixes
  let fixed = 0;
  for (const fix of fixes) {
    const geo = geoCache[fix.adres];
    if (!geo) continue;
    const c = data[fix.index];
    const old = `[${c.lat},${c.lng}]`;
    c.lat = geo.lat;
    c.lng = geo.lng;
    c.adres = fix.adres;
    console.log(`✅ [${fix.index}] ${c.naam}: ${old} → [${c.lat},${c.lng}]`);
    fixed++;
  }

  fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2));
  console.log(`\nFixed ${fixed} entries. Saved.`);
}

main().catch(console.error);
