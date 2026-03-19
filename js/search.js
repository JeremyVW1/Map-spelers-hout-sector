/* ═══════════════════════════════════════════
   Houtkaart — Zoekfunctionaliteit
   ═══════════════════════════════════════════ */

let searchTerm = "";
let debounceTimer = null;

function initSearch() {
  const input = document.getElementById("search");
  const clearBtn = document.getElementById("search-clear");

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    clearBtn.style.display = val ? "block" : "none";

    debounceTimer = setTimeout(() => {
      searchTerm = val.toLowerCase();
      render();
      updateCounter();

      // Auto-zoom bij 1 resultaat
      const visible = getVisibleCompanies();
      if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 14);
        // Open popup van enige marker
        if (markers.length === 1) {
          markers[0].openPopup();
        }
      }
    }, 200);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    searchTerm = "";
    render();
    updateCounter();
  });
}

function matchesSearch(company) {
  if (!searchTerm) return true;
  const haystack = (company.naam + " " + company.info).toLowerCase();
  // Zoek alle woorden (AND logica)
  const words = searchTerm.split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
}

// Regio-ids voor lookup
const REGIO_IDS = new Set(["wvl", "ovl", "ant", "vbr", "lim", "hai", "bwa", "nam"]);

function getVisibleCompanies() {
  return bedrijven.filter((c) => {
    const isRegioBedrijf = REGIO_IDS.has(c.provincie);
    const bedrijfActiviteiten = c.activiteiten || [];

    // Regio filter check
    const passRegio = activeRegios.size === 0 ||
      (isRegioBedrijf && activeRegios.has(c.provincie));

    // Activiteit filter check: bedrijf heeft minstens 1 van de geselecteerde activiteiten
    const passActiviteit = activeActiviteiten.size === 0 ||
      bedrijfActiviteiten.some((a) => activeActiviteiten.has(a));

    // Regio + Activiteit = AND logica
    if (activeRegios.size > 0 && activeActiviteiten.size > 0) {
      // Bedrijf moet in juiste regio zitten EN minstens 1 activiteit matchen
      if (!passRegio || !passActiviteit) return false;
    } else if (activeRegios.size > 0) {
      // Alleen regio geselecteerd: toon regio-bedrijven + activiteit-bedrijven die matchen
      if (!passRegio && isRegioBedrijf) return false;
      if (!isRegioBedrijf) return false; // verberg pure activiteit-bedrijven
    } else if (activeActiviteiten.size > 0) {
      // Alleen activiteit geselecteerd: toon alle bedrijven die die activiteit hebben
      if (!passActiviteit) return false;
    }

    if (!matchesSearch(c)) return false;
    return true;
  });
}
