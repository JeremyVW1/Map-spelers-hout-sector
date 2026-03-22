const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));
const START_INDEX = parseInt(process.argv[2] || '152');

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function geocode(query) {
  return new Promise((resolve) => {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + ' Belgium')}&limit=1`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart/1.0' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.features && r.features.length > 0) {
            const c = r.features[0].geometry.coordinates;
            const p = r.features[0].properties;
            resolve({ lat: c[1], lng: c[0], display: (p.name || '') + ' ' + (p.street || '') + ' ' + (p.city || '') });
          } else resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function extractLocation(naam) {
  const m = naam.match(/\(([^)]+)\)/);
  if (m) {
    let loc = m[1].replace(/\s*—.*/, '').replace(/\s*\/.*/, '').replace(/regio\s*/i, '').trim();
    loc = loc.replace(/HQ\s*/i, '').replace(/contact\s*/i, '').replace(/volledig profiel/i, '').trim();
    if (loc.length > 2) return loc;
  }
  return null;
}

async function main() {
  console.log(`Validating companies ${START_INDEX} to ${data.length - 1} using Photon...\n`);
  const issues = [];
  let checked = 0;

  for (let i = START_INDEX; i < data.length; i++) {
    const c = data[i];
    let searchQuery = null;

    if (c.adres) {
      searchQuery = c.adres;
    } else {
      const city = extractLocation(c.naam);
      if (city) searchQuery = c.naam.split('(')[0].trim() + ' ' + city;
    }

    if (!searchQuery) continue;

    const geo = await geocode(searchQuery);
    checked++;

    if (!geo) {
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    const drift = distKm(c.lat, c.lng, geo.lat, geo.lng);
    if (drift > 5) {
      issues.push({
        index: i, naam: c.naam, stored: [c.lat, c.lng],
        geocoded: [parseFloat(geo.lat.toFixed(4)), parseFloat(geo.lng.toFixed(4))],
        driftKm: parseFloat(drift.toFixed(1)),
        query: searchQuery, display: geo.display
      });
      console.log(`⚠️  [${i}] ${c.naam}: ${drift.toFixed(1)}km off`);
      console.log(`    stored: ${c.lat},${c.lng} → geocoded: ${geo.lat.toFixed(4)},${geo.lng.toFixed(4)}`);
      console.log(`    query: "${searchQuery}" → ${geo.display}`);
    } else if (drift > 2) {
      console.log(`⚡ [${i}] ${c.naam}: ${drift.toFixed(1)}km (minor)`);
    }

    if (checked % 50 === 0) console.log(`\n--- Progress: ${checked} checked ---\n`);
    await new Promise(r => setTimeout(r, 500)); // Photon is less strict on rate limits
  }

  console.log('\n=== SUMMARY ===');
  console.log('Checked:', checked);
  console.log('Issues (>5km):', issues.length);

  fs.writeFileSync('scripts/validation-issues-rest.json', JSON.stringify(issues, null, 2));

  if (issues.length > 0) {
    console.log('\nAll issues:');
    issues.forEach(i => console.log(`  [${i.index}] ${i.naam}: ${i.driftKm}km off`));
  }
}

main().catch(console.error);
