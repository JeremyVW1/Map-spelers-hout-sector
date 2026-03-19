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

      const visible = getVisibleCompanies();
      if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 14);
        if (markers.length === 1) markers[0].openPopup();
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
  const words = searchTerm.split(/\s+/).filter(Boolean);
  return words.every((w) => haystack.includes(w));
}

function getVisibleCompanies() {
  return bedrijven.filter((c) => {
    const isRegio = REGIO_IDS.has(c.provincie);
    const acts = c.activiteiten || [];

    const passRegio = activeRegios.size === 0 || (isRegio && activeRegios.has(c.provincie));
    const passAct = activeActiviteiten.size === 0 || acts.some((a) => activeActiviteiten.has(a));

    if (activeRegios.size > 0 && activeActiviteiten.size > 0) {
      if (!passRegio || !passAct) return false;
    } else if (activeRegios.size > 0) {
      if (!isRegio || !passRegio) return false;
    } else if (activeActiviteiten.size > 0) {
      if (!passAct) return false;
    }

    return matchesSearch(c);
  });
}
