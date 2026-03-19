/* Houtkaart — Zoekfunctionaliteit */

let searchTerm = "";
let debounceTimer = null;

function initSearch() {
  const input = document.getElementById("search");
  const clearBtn = document.getElementById("search-clear");
  const sugBox = document.getElementById("search-suggestions");

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    clearBtn.style.display = val ? "block" : "none";

    debounceTimer = setTimeout(() => {
      searchTerm = val.toLowerCase();
      render();
      updateCounter();
      showSuggestions(val, sugBox, input);

      const visible = getVisibleCompanies();
      if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 14);
        if (markers.length === 1) markers[0].openPopup();
      }
    }, 150);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) showSuggestions(input.value.trim(), sugBox, input);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) sugBox.style.display = "none";
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    sugBox.style.display = "none";
    searchTerm = "";
    render();
    updateCounter();
  });
}

function showSuggestions(val, sugBox, input) {
  sugBox.innerHTML = "";
  if (!val || val.length < 2) { sugBox.style.display = "none"; return; }

  const q = val.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);

  // Zoek matches op naam, adres, plaats
  const matches = bedrijven.filter(c => {
    const haystack = [c.naam, c.adres || "", c.info || ""].join(" ").toLowerCase();
    return words.every(w => haystack.includes(w));
  }).slice(0, 8);

  if (matches.length === 0) { sugBox.style.display = "none"; return; }

  matches.forEach(c => {
    const div = document.createElement("div");
    div.className = "search-sug-item";

    // Highlight matched text in naam
    const naam = highlightMatch(c.naam, words);
    const detail = c.adres ? ` — <span class="sug-detail">${c.adres}</span>` : "";
    const act = (c.activiteiten || []).map(a => categorieen.find(x => x.id === a)?.label || a).join(", ");

    div.innerHTML = `<span class="sug-naam">${naam}</span>${detail}<span class="sug-act">${act}</span>`;

    div.addEventListener("click", () => {
      input.value = c.naam;
      searchTerm = c.naam.toLowerCase();
      sugBox.style.display = "none";
      render();
      updateCounter();
      map.setView([c.lat, c.lng], 14);
      // Open popup van dit bedrijf
      setTimeout(() => {
        const m = markers.find(mk => {
          const ll = mk.getLatLng();
          return Math.abs(ll.lat - c.lat) < 0.001 && Math.abs(ll.lng - c.lng) < 0.001;
        });
        if (m) m.openPopup();
      }, 100);
    });

    sugBox.appendChild(div);
  });

  sugBox.style.display = "block";
}

function highlightMatch(text, words) {
  let html = text;
  words.forEach(w => {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    html = html.replace(re, '<b>$1</b>');
  });
  return html;
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
