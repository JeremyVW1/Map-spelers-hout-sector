/* ═══════════════════════════════════════════
   Houtkaart — Entry point
   ═══════════════════════════════════════════ */

let bedrijven = [];
let categorieen = [];

async function init() {
  const [bedrijvenRes, catRes] = await Promise.all([
    fetch("data/bedrijven.json"),
    fetch("data/categorieen.json"),
  ]);
  bedrijven = await bedrijvenRes.json();
  categorieen = await catRes.json();

  // Lookup maps vullen
  categorieen.forEach((c) => {
    KLEUR_MAP[c.id] = c.kleur;
    PROV_LABELS[c.id] = c.label;
    if (c.type === "activiteit") ACT_KLEUR[c.id] = c.kleur;
  });

  initMap();
  buildFilters();
  buildLegend();
  initSearch();

  // Standaard WVL + OVL + alle activiteiten
  activeRegios.add("wvl");
  activeRegios.add("ovl");
  categorieen.filter((c) => c.type === "activiteit").forEach((c) => {
    activeActiviteiten.add(c.id);
  });
  syncFilterButtons();

  render();
  updateCounter();
}

document.addEventListener("DOMContentLoaded", init);
