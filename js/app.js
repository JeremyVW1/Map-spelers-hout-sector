/* Houtkaart — Entry point */

let bedrijven   = [];
let categorieen = [];
let top15       = [];
const bedrijvenMap = new Map();

async function init() {
  try {
    const [bedrijvenRes, catRes, top15Res, dossiersRes] = await Promise.all([
      fetch("data/bedrijven.json"),
      fetch("data/categorieen.json"),
      fetch("data/top15.json"),
      fetch("data/dossiers.json"),
    ]);
    if (!bedrijvenRes.ok) throw new Error("bedrijven.json laden mislukt");
    if (!catRes.ok)       throw new Error("categorieen.json laden mislukt");

    bedrijven   = await bedrijvenRes.json();
    categorieen = await catRes.json();
    top15       = top15Res.ok ? await top15Res.json() : [];
    dossiers    = dossiersRes.ok ? await dossiersRes.json() : [];
    bedrijven.forEach(c => bedrijvenMap.set(c.naam, c));
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
  createAllMarkers();
  buildFilters();
  buildLegend();
  initSearch();
  initAnalyse();
  initEdit();
  initDossiers();
  initTabs();

  // Event delegation voor popup-knoppen (eenmalig, geen memory leak)
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".leaflet-popup")) return;
    const btn = e.target.closest(".star-btn, .orange-btn, .red-btn");
    if (!btn) return;
    e.stopPropagation(); e.preventDefault();
    const naam = btn.dataset.naam;
    const c = bedrijvenMap.get(naam);
    if (!c) return;
    if (btn.classList.contains("star-btn")) toggleFavorite(c);
    else if (btn.classList.contains("orange-btn")) toggleOrange(c);
    else if (btn.classList.contains("red-btn")) toggleRed(c);
    refreshMarkerIcon(naam);
    const entry = allMarkers.get(naam);
    if (entry && entry.marker.isPopupOpen()) {
      entry.marker.setPopupContent(buildPopup(c));
    }
  });

  activeRegios.add("groene_zone");
  activeRegios.add("wvl");
  activeRegios.add("ovl");
  categorieen.filter(c => c.type === "activiteit").forEach(c => activeActiviteiten.add(c.id));
  syncFilterButtons();
  render();
  updateCounter();

  document.getElementById("fav-export").addEventListener("click", exportFavCSV);
  document.getElementById("twijfel-export").addEventListener("click", exportTwijfelCSV);
  startAutoSync();

  window.addEventListener("offline", () => showToast("Je bent offline. Wijzigingen worden lokaal opgeslagen.", "warning", 5000));
  window.addEventListener("online", () => { showToast("Weer online!", "success", 3000); _autoSync(); });

  document.getElementById("loading-overlay")?.remove();
}

function initTabs() {
  const kaartEls = [document.getElementById("controls"), document.getElementById("map"), document.getElementById("legend")];

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const tab = btn.dataset.tab;
      kaartEls.forEach(el => el.classList.toggle("hidden", tab !== "kaart"));
      document.getElementById("analyse-view").classList.toggle("hidden", tab !== "analyse");
      document.getElementById("favorieten-view").classList.toggle("hidden", tab !== "favorieten");
      document.getElementById("twijfel-view").classList.toggle("hidden", tab !== "twijfel");
      document.getElementById("bewerk-view").classList.toggle("hidden", tab !== "bewerk");
      document.getElementById("dossiers-view").classList.toggle("hidden", tab !== "dossiers");

      if (tab === "kaart")            setTimeout(() => map.invalidateSize(), 100);
      else if (tab === "analyse")     renderAnalyse();
      else if (tab === "favorieten")  renderFavorieten();
      else if (tab === "twijfel")     renderTwijfel();
      else if (tab === "bewerk")      renderEdit();
      else if (tab === "dossiers")    renderDossiers();
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
