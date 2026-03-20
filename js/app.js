/* Houtkaart — Entry point */

let bedrijven   = [];
let categorieen = [];
let top15       = [];

async function init() {
  try {
    const [bedrijvenRes, catRes, top15Res] = await Promise.all([
      fetch("data/bedrijven.json"),
      fetch("data/categorieen.json"),
      fetch("data/top15.json"),
    ]);

    if (!bedrijvenRes.ok) throw new Error("bedrijven.json laden mislukt");
    if (!catRes.ok)       throw new Error("categorieen.json laden mislukt");

    bedrijven   = await bedrijvenRes.json();
    categorieen = await catRes.json();
    top15       = top15Res.ok ? await top15Res.json() : [];
  } catch (e) {
    console.error("Data laden mislukt:", e);
    document.body.innerHTML = `<div style="padding:2rem;color:#c62828;font-family:sans-serif">
      <h2>Fout bij laden</h2><p>${e.message}</p></div>`;
    return;
  }

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

  // Start auto-sync: elke 30s notes ophalen uit Google Sheets
  startAutoSync();
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

      if (tab === "kaart")       setTimeout(() => map.invalidateSize(), 100);
      else if (tab === "analyse")    renderAnalyse();
      else if (tab === "favorieten") renderFavorieten();
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
