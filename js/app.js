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
  initAnalyse();
  initTabs();

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

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;
      const kaartEls = [document.getElementById("controls"), document.getElementById("map"), document.getElementById("legend")];
      const analyseEl = document.getElementById("analyse-view");

      if (tab === "kaart") {
        kaartEls.forEach(el => el.classList.remove("hidden"));
        analyseEl.classList.add("hidden");
        setTimeout(() => map.invalidateSize(), 100);
      } else {
        kaartEls.forEach(el => el.classList.add("hidden"));
        analyseEl.classList.remove("hidden");
        renderAnalyse();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
