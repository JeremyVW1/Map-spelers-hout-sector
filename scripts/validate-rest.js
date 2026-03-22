const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));
const START_INDEX = 152; // Continue from where previous run stopped

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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=be`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart-v2/1.0' } }, (res) => {
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
  console.log(`Validating companies ${START_INDEX} to ${data.length - 1}...\n`);
  const issues = [];
  let checked = 0;

  for (let i = START_INDEX; i < data.length; i++) {
    const c = data[i];
    let searchQuery = null;

    if (c.adres) {
      searchQuery = c.adres + ', Belgium';
    } else {
      const city = extractLocation(c.naam);
      if (city) searchQuery = c.naam.split('(')[0].trim() + ' ' + city + ', Belgium';
    }

    if (!searchQuery) continue;

    const geo = await geocode(searchQuery);
    checked++;

    if (!geo) {
      console.log(`⏭️  [${i}] ${c.naam}: geocode failed`);
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    const drift = distKm(c.lat, c.lng, geo.lat, geo.lng);
    if (drift > 5) {
      issues.push({
        index: i, naam: c.naam, stored: [c.lat, c.lng],
        geocoded: [geo.lat, geo.lng], driftKm: parseFloat(drift.toFixed(1)),
        query: searchQuery, display: geo.display
      });
      console.log(`⚠️  [${i}] ${c.naam}: ${drift.toFixed(1)}km off`);
      console.log(`    stored: ${c.lat},${c.lng} → geocoded: ${geo.lat.toFixed(4)},${geo.lng.toFixed(4)}`);
    } else if (drift > 2) {
      console.log(`⚡ [${i}] ${c.naam}: ${drift.toFixed(1)}km (minor)`);
    }

    if (checked % 50 === 0) console.log(`\n--- Progress: ${checked} checked from index ${START_INDEX} ---\n`);
    await new Promise(r => setTimeout(r, 1500)); // Longer delay to avoid rate limiting
  }

  console.log('\n=== SUMMARY (rest) ===');
  console.log('Checked:', checked);
  console.log('Issues (>5km):', issues.length);

  // Merge with existing issues if available
  let allIssues = issues;
  try {
    const prev = JSON.parse(fs.readFileSync('scripts/validation-issues-all.json', 'utf8'));
    allIssues = prev.concat(issues);
  } catch(e) {}
  fs.writeFileSync('scripts/validation-issues-all.json', JSON.stringify(allIssues, null, 2));

  if (issues.length > 0) {
    console.log('\nNew issues:');
    issues.forEach(i => console.log(`  ${i.naam}: ${i.driftKm}km off`));
  }
}

main().catch(console.error);
