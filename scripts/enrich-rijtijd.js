const fs = require('fs');
const http = require('http');

const H = { lat: 51.1065, lng: 3.2714 };
const D = { lat: 51.0428, lng: 3.6388 };
const maxKm = 40;

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inZone(c) {
  return distKm(c.lat, c.lng, H.lat, H.lng) <= maxKm &&
         distKm(c.lat, c.lng, D.lat, D.lng) <= maxKm;
}

function fetchOSRM(fromLat, fromLng, toLat, toLng) {
  return new Promise((resolve, reject) => {
    const url = `http://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.routes && j.routes[0]) {
            resolve(Math.round(j.routes[0].duration / 60));
          } else resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const data = JSON.parse(fs.readFileSync('data/bedrijven.json', 'utf8'));
  const zone = data.filter(c => inZone(c));
  console.log(`${zone.length} bedrijven in groene zone, rijtijden berekenen...`);

  let done = 0;
  for (const c of zone) {
    if (c.rijtijd_hertsberge && c.rijtijd_drongen) {
      done++;
      continue; // already enriched
    }
    const rH = await fetchOSRM(H.lat, H.lng, c.lat, c.lng);
    const rD = await fetchOSRM(D.lat, D.lng, c.lat, c.lng);
    if (rH !== null) c.rijtijd_hertsberge = rH;
    if (rD !== null) c.rijtijd_drongen = rD;
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${zone.length}...`);
    await new Promise(r => setTimeout(r, 120));
  }

  fs.writeFileSync('data/bedrijven.json', JSON.stringify(data, null, 2), 'utf8');
  console.log(`Klaar! ${done} bedrijven verrijkt met rijtijden.`);
}

main().catch(console.error);
