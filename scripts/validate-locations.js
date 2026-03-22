const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));
const H = [51.1065, 3.2714]; const D = [51.0428, 3.6388];

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
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=be`;
    https.get(url, { headers: { 'User-Agent': 'houtkaart-validate/1.0' } }, (res) => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.length > 0) resolve({ lat: parseFloat(r[0].lat), lng: parseFloat(r[0].lon) });
          else resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// Extract city/location from company name
function extractLocation(naam) {
  // Pattern: "Name (City)" or "Name (City/Region)"
  const m = naam.match(/\(([^)]+)\)/);
  if (m) {
    let loc = m[1].replace(/\s*—.*/, '').replace(/\s*\/.*/, '').replace(/regio\s*/i, '').trim();
    // Remove descriptors
    loc = loc.replace(/HQ\s*/i, '').replace(/contact\s*/i, '').replace(/volledig profiel/i, '').trim();
    if (loc.length > 2) return loc;
  }
  return null;
}

const zone = data.filter(c => 
  distKm(c.lat, c.lng, H[0], H[1]) <= 40 && distKm(c.lat, c.lng, D[0], D[1]) <= 40
);

async function main() {
  console.log('Validating', zone.length, 'companies in green zone...\n');
  const issues = [];

  for (const c of zone) {
    // Use adres field if available, otherwise extract city from name
    let searchQuery = null;
    if (c.adres) {
      searchQuery = c.adres + ' Belgium';
    } else {
      const city = extractLocation(c.naam);
      if (city) searchQuery = c.naam.split('(')[0].trim() + ' ' + city + ' Belgium';
    }

    if (!searchQuery) continue;

    const geo = await geocode(searchQuery);
    if (!geo) { await new Promise(r => setTimeout(r, 1100)); continue; }

    const drift = distKm(c.lat, c.lng, geo.lat, geo.lng);
    if (drift > 5) { // More than 5km off
      issues.push({ 
        naam: c.naam, 
        stored: [c.lat, c.lng], 
        geocoded: [geo.lat, geo.lng], 
        drift: drift.toFixed(1) + 'km',
        query: searchQuery
      });
      console.log('⚠️  ' + c.naam + ': ' + drift.toFixed(1) + 'km off');
      console.log('    stored: ' + c.lat + ',' + c.lng + ' → geocoded: ' + geo.lat.toFixed(4) + ',' + geo.lng.toFixed(4));
    }

    await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit: 1 req/sec
  }

  console.log('\n=== SUMMARY ===');
  console.log('Checked:', zone.length, 'companies');
  console.log('Issues (>5km drift):', issues.length);
  if (issues.length > 0) {
    console.log('\nFixes needed:');
    issues.forEach(i => console.log('  ' + i.naam + ': ' + i.drift + ' off'));
  }
}

main().catch(console.error);
