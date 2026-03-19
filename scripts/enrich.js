/**
 * Data-enrichment script — KBO + web search
 * Zoekt per bedrijf: ondernemingsnummer, adres, rechtsvorm, oprichting, etc.
 *
 * Gebruik: node scripts/enrich.js
 */

const fs = require("fs");
const https = require("https");
const http = require("http");

const DATA_FILE = "data/bedrijven.json";
const OUTPUT_FILE = "data/bedrijven_verrijkt.json";

// ─── HTTP helper ─────────────────────────────
function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HoutkaartResearch/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith("/")) {
          const u = new URL(url);
          redirectUrl = u.origin + redirectUrl;
        }
        return fetchUrl(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

// ─── KBO zoek op naam ────────────────────────
async function searchKBO(bedrijfsnaam) {
  // Maak zoeknaam schoon
  let cleanName = bedrijfsnaam
    .replace(/\s*\(.*?\)\s*/g, " ")  // Verwijder alles tussen haakjes
    .replace(/\s*(HQ|vestiging|—|–|-|\/)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Zoek via KBO publieke zoekpagina
  const searchUrl = `https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischaliasaliasaliasaliasaliasform.html?searchWord=${encodeURIComponent(cleanName)}&_oudBtn=on&pession=&searchType=contains`;

  try {
    const html = await fetchUrl(`https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischaliasaliasaliasaliasaliasform.html?searchWord=${encodeURIComponent(cleanName)}&_oudBtn=on&searchType=contains`);

    // Zoek ondernemingsnummers in de resultaten
    const matches = html.match(/ondernemingsnummer=(\d{10})/g);
    if (matches && matches.length > 0) {
      // Pak het eerste resultaat
      const nummer = matches[0].replace("ondernemingsnummer=", "");
      return nummer;
    }

    // Probeer ook met kortere naam (eerste 2 woorden)
    const shortName = cleanName.split(" ").slice(0, 2).join(" ");
    if (shortName !== cleanName && shortName.length > 3) {
      const html2 = await fetchUrl(`https://kbopub.economie.fgov.be/kbopub/zoeknaamfonetischaliasaliasaliasaliasaliasform.html?searchWord=${encodeURIComponent(shortName)}&_oudBtn=on&searchType=contains`);
      const matches2 = html2.match(/ondernemingsnummer=(\d{10})/g);
      if (matches2 && matches2.length > 0) {
        return matches2[0].replace("ondernemingsnummer=", "");
      }
    }
  } catch (err) {
    console.log(`  KBO zoek fout voor "${cleanName}":`, err.message);
  }
  return null;
}

// ─── KBO detail ophalen ──────────────────────
async function getKBODetail(nummer) {
  try {
    const html = await fetchUrl(`https://kbopub.economie.fgov.be/kbopub/toonondernemingps.html?ondernemingsnummer=${nummer}`);

    const result = {
      ondernemingsnummer: formatBTW(nummer),
    };

    // Rechtsvorm
    const rechtsMatch = html.match(/Rechtsvorm[^<]*<[^>]*>[^<]*<[^>]*>\s*([^<]+)/i);
    if (rechtsMatch) result.rechtsvorm = rechtsMatch[1].trim();

    // Oprichtingsdatum
    const datumMatch = html.match(/Begindatum[^<]*<[^>]*>[^<]*<[^>]*>\s*(\d{1,2}\s+\w+\s+\d{4})/i);
    if (datumMatch) result.oprichting = datumMatch[1].trim();

    // Adres - zoek in de HTML
    const adresMatch = html.match(/Adres van de maatschappelijke zetel[^<]*(?:<[^>]*>)*\s*([^<]+(?:<br\s*\/?>)?[^<]*)/i);
    if (adresMatch) {
      result.adres_kbo = adresMatch[1].replace(/<[^>]*>/g, ", ").replace(/\s+/g, " ").trim();
    }

    // Status
    if (html.includes("Actief")) result.status = "Actief";
    else if (html.includes("Stopzetting")) result.status = "Stopgezet";

    // NACE codes
    const naceMatches = html.match(/(\d{2}\.\d{3})\s*-\s*([^<]+)/g);
    if (naceMatches) {
      result.nace_codes = naceMatches.slice(0, 3).map(m => m.trim());
    }

    return result;
  } catch (err) {
    console.log(`  KBO detail fout voor ${nummer}:`, err.message);
    return { ondernemingsnummer: formatBTW(nummer) };
  }
}

function formatBTW(nummer) {
  // 0882268745 → BE 0882.268.745
  const n = nummer.padStart(10, "0");
  return `BE ${n.slice(0, 4)}.${n.slice(4, 7)}.${n.slice(7)}`;
}

// ─── Sleep helper ────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── MAIN ────────────────────────────────────
async function main() {
  const bedrijven = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

  // Filter OVL + WVL
  const targets = bedrijven.filter(b => b.provincie === "ovl" || b.provincie === "wvl");
  console.log(`\n🔍 Start enrichment voor ${targets.length} bedrijven (OVL + WVL)\n`);

  let enriched = 0;
  let notFound = 0;

  for (let i = 0; i < targets.length; i++) {
    const b = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${b.naam}`);

    // Zoek KBO nummer
    const nummer = await searchKBO(b.naam);

    if (nummer) {
      console.log(`  ✓ KBO: ${formatBTW(nummer)}`);

      // Haal details op
      const detail = await getKBODetail(nummer);

      // Voeg toe aan bedrijf
      b.kbo = detail;
      enriched++;

      if (detail.rechtsvorm) console.log(`    Rechtsvorm: ${detail.rechtsvorm}`);
      if (detail.oprichting) console.log(`    Oprichting: ${detail.oprichting}`);
      if (detail.status) console.log(`    Status: ${detail.status}`);
    } else {
      console.log(`  ✗ Niet gevonden in KBO`);
      notFound++;
    }

    // Wacht even om KBO niet te overbelasten (1-2 sec)
    await sleep(1500);
  }

  // Schrijf volledig bestand (alle bedrijven, met verrijkte OVL/WVL)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bedrijven, null, 2), "utf8");

  console.log(`\n═══════════════════════════════════`);
  console.log(`✓ Verrijkt: ${enriched}/${targets.length}`);
  console.log(`✗ Niet gevonden: ${notFound}/${targets.length}`);
  console.log(`📄 Opgeslagen in: ${OUTPUT_FILE}`);
}

main().catch(console.error);
