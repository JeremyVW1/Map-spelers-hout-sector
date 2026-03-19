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

function getVisibleCompanies() {
  return bedrijven.filter((c) => {
    // Multi-filter: als er filters actief zijn, moet de provincie in de set zitten
    if (activeFilters.size > 0 && !activeFilters.has(c.provincie)) return false;
    if (!matchesSearch(c)) return false;
    return true;
  });
}
