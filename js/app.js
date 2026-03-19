/* Houtkaart — Entry point */

let bedrijven = [];
let categorieen = [];

async function init() {
  const [bedrijvenRes, catRes] = await Promise.all([
    fetch("data/bedrijven.json"),
    fetch("data/categorieen.json"),
  ]);
  bedrijven = await bedrijvenRes.json();
  categorieen = await catRes.json();

  categorieen.forEach(c => {
    PROV_LABELS[c.id] = c.label;
    if (c.type === "activiteit") ACT_KLEUR[c.id] = c.kleur;
  });

  await loadFavorites();

  initMap();
  buildFilters();
  buildLegend();
  initSearch();
  initAnalyse();
  initTabs();

  // Standaard groene zone + WVL + OVL + alle activiteiten
  activeRegios.add("groene_zone");
  activeRegios.add("wvl");
  activeRegios.add("ovl");
  categorieen.filter(c => c.type === "activiteit").forEach(c => activeActiviteiten.add(c.id));
  syncFilterButtons();
  render();
  updateCounter();

  document.getElementById("fav-export").addEventListener("click", exportFavCSV);
}

function initTabs() {
  const kaartEls = [document.getElementById("controls"), document.getElementById("map"), document.getElementById("legend")];

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;

      kaartEls.forEach(el => el.classList.toggle("hidden", tab !== "kaart"));
      document.getElementById("analyse-view").classList.toggle("hidden", tab !== "analyse");
      document.getElementById("favorieten-view").classList.toggle("hidden", tab !== "favorieten");

      if (tab === "kaart") setTimeout(() => map.invalidateSize(), 100);
      else if (tab === "analyse") renderAnalyse();
      else if (tab === "favorieten") renderFavorieten();
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
