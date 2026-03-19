/* Houtkaart — Zoekfunctionaliteit */

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

// Groene zone check (gebruikt gedeelde distKm uit config.js)
function inGroeneZone(c) {
  const h = EIGEN_LOCATIES[1].ll;
  const d = EIGEN_LOCATIES[0].ll;
  return distKm(c.lat, c.lng, h[0], h[1]) <= 40 && distKm(c.lat, c.lng, d[0], d[1]) <= 40;
}

function matchesSearch(company) {
  if (!searchTerm) return true;
  const haystack = (company.naam + " " + company.info).toLowerCase();
  return searchTerm.split(/\s+/).filter(Boolean).every(w => haystack.includes(w));
}

function getVisibleCompanies() {
  return bedrijven.filter(c => {
    if (activeRegios.has("groene_zone") && !inGroeneZone(c)) return false;

    const regioSet = new Set([...activeRegios].filter(r => r !== "groene_zone"));
    const passRegio = regioSet.size === 0 || regioSet.has(c.provincie);
    const passAct = activeActiviteiten.size === 0 || (c.activiteiten || []).some(a => activeActiviteiten.has(a));

    if (regioSet.size > 0 && activeActiviteiten.size > 0) {
      if (!passRegio || !passAct) return false;
    } else if (regioSet.size > 0) {
      if (!passRegio) return false;
    } else if (activeActiviteiten.size > 0) {
      if (!passAct) return false;
    }

    return matchesSearch(c);
  });
}
