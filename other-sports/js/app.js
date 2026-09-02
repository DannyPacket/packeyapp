// ── MLB TEAMS / BALLPARKS ──────────────────────────────────────
// wiki: override when the default "Park Name".replace(" ","_") wouldn't match
// the real Wikipedia article title.
const MLB_TEAMS = [
  { abbr: "ARI", full: "Arizona Diamondbacks", park: "Chase Field",                lat: 33.4455, lon: -112.0667 },
  { abbr: "ATL", full: "Atlanta Braves",        park: "Truist Park",               lat: 33.8908, lon: -84.4678  },
  { abbr: "BAL", full: "Baltimore Orioles",     park: "Oriole Park at Camden Yards",lat: 39.2838, lon: -76.6217 },
  { abbr: "BOS", full: "Boston Red Sox",        park: "Fenway Park",               lat: 42.3467, lon: -71.0972  },
  { abbr: "CHC", full: "Chicago Cubs",          park: "Wrigley Field",             lat: 41.9484, lon: -87.6553  },
  { abbr: "CWS", full: "Chicago White Sox",     park: "Rate Field",                lat: 41.8299, lon: -87.6338, espn: "chw" },
  { abbr: "CIN", full: "Cincinnati Reds",       park: "Great American Ball Park",  lat: 39.0975, lon: -84.5071  },
  { abbr: "CLE", full: "Cleveland Guardians",   park: "Progressive Field",         lat: 41.4962, lon: -81.6852  },
  { abbr: "COL", full: "Colorado Rockies",      park: "Coors Field",               lat: 39.7559, lon: -104.9942 },
  { abbr: "DET", full: "Detroit Tigers",        park: "Comerica Park",             lat: 42.3390, lon: -83.0485  },
  { abbr: "HOU", full: "Houston Astros",        park: "Daikin Park",               lat: 29.7573, lon: -95.3555  },
  { abbr: "KC",  full: "Kansas City Royals",    park: "Kauffman Stadium",          lat: 39.0517, lon: -94.4803  },
  { abbr: "LAA", full: "Los Angeles Angels",    park: "Angel Stadium",             lat: 33.8003, lon: -117.8827 },
  { abbr: "LAD", full: "Los Angeles Dodgers",   park: "Dodger Stadium",            lat: 34.0739, lon: -118.2400 },
  { abbr: "MIA", full: "Miami Marlins",         park: "loanDepot park",            lat: 25.7781, lon: -80.2196, wiki: "LoanDepot_Park" },
  { abbr: "MIL", full: "Milwaukee Brewers",     park: "American Family Field",     lat: 43.0280, lon: -87.9712  },
  { abbr: "MIN", full: "Minnesota Twins",       park: "Target Field",              lat: 44.9817, lon: -93.2776  },
  { abbr: "NYM", full: "New York Mets",         park: "Citi Field",                lat: 40.7571, lon: -73.8458  },
  { abbr: "NYY", full: "New York Yankees",      park: "Yankee Stadium",            lat: 40.8296, lon: -73.9262  },
  { abbr: "OAK", full: "Athletics",             park: "Sutter Health Park",        lat: 38.5802, lon: -121.5147 },
  { abbr: "PHI", full: "Philadelphia Phillies", park: "Citizens Bank Park",        lat: 39.9061, lon: -75.1665  },
  { abbr: "PIT", full: "Pittsburgh Pirates",    park: "PNC Park",                  lat: 40.4469, lon: -80.0057  },
  { abbr: "SD",  full: "San Diego Padres",      park: "Petco Park",                lat: 32.7073, lon: -117.1566 },
  { abbr: "SEA", full: "Seattle Mariners",      park: "T-Mobile Park",             lat: 47.5914, lon: -122.3325 },
  { abbr: "SF",  full: "San Francisco Giants",  park: "Oracle Park",               lat: 37.7786, lon: -122.3893 },
  { abbr: "STL", full: "St. Louis Cardinals",   park: "Busch Stadium",             lat: 38.6226, lon: -90.1928  },
  { abbr: "TB",  full: "Tampa Bay Rays",        park: "Tropicana Field",           lat: 27.7683, lon: -82.6534  },
  { abbr: "TEX", full: "Texas Rangers",         park: "Globe Life Field",          lat: 32.7473, lon: -97.0842  },
  { abbr: "TOR", full: "Toronto Blue Jays",     park: "Rogers Centre",             lat: 43.6414, lon: -79.3894  },
  { abbr: "WSH", full: "Washington Nationals",  park: "Nationals Park",            lat: 38.8730, lon: -77.0074  },
];

const TEAMS_BY_ABBR = Object.fromEntries(MLB_TEAMS.map((t) => [t.abbr, t]));

// Free-text team names (as typed in the sheet) → abbreviation. Covers city
// names, nicknames, and full names. A bare city shared by two teams (e.g.
// "Chicago", "New York", "Los Angeles") defaults to one team — rename the
// sheet cell to the specific nickname (e.g. "Chicago White Sox") to disambiguate.
const NAME_TO_ABBR = {
  "Arizona": "ARI", "Diamondbacks": "ARI", "Arizona Diamondbacks": "ARI", "D-backs": "ARI",
  "Atlanta": "ATL", "Braves": "ATL", "Atlanta Braves": "ATL",
  "Baltimore": "BAL", "Orioles": "BAL", "Baltimore Orioles": "BAL",
  "Boston": "BOS", "Red Sox": "BOS", "Boston Red Sox": "BOS",
  "Chicago Cubs": "CHC", "Cubs": "CHC",
  "Chicago White Sox": "CWS", "White Sox": "CWS",
  "Chicago": "CHC", // default bare "Chicago" to the Cubs
  "Cincinnati": "CIN", "Reds": "CIN", "Cincinnati Reds": "CIN",
  "Cleveland": "CLE", "Guardians": "CLE", "Cleveland Guardians": "CLE", "Indians": "CLE",
  "Colorado": "COL", "Rockies": "COL", "Colorado Rockies": "COL",
  "Detroit": "DET", "Tigers": "DET", "Detroit Tigers": "DET",
  "Houston": "HOU", "Astros": "HOU", "Houston Astros": "HOU",
  "Kansas City": "KC", "Royals": "KC", "Kansas City Royals": "KC",
  "Angels": "LAA", "LA Angels": "LAA", "Los Angeles Angels": "LAA", "Anaheim": "LAA",
  "Dodgers": "LAD", "LA Dodgers": "LAD", "Los Angeles Dodgers": "LAD",
  "Los Angeles": "LAD", "LA": "LAD", // default bare "Los Angeles"/"LA" to the Dodgers
  "Miami": "MIA", "Marlins": "MIA", "Miami Marlins": "MIA",
  "Milwaukee": "MIL", "Brewers": "MIL", "Milwaukee Brewers": "MIL",
  "Minnesota": "MIN", "Twins": "MIN", "Minnesota Twins": "MIN",
  "Mets": "NYM", "New York Mets": "NYM",
  "Yankees": "NYY", "New York Yankees": "NYY",
  "New York": "NYY", // default bare "New York" to the Yankees
  "Athletics": "OAK", "Oakland": "OAK", "Oakland Athletics": "OAK", "A's": "OAK",
  "Philadelphia": "PHI", "Phillies": "PHI", "Philadelphia Phillies": "PHI",
  "Pittsburgh": "PIT", "Pirates": "PIT", "Pittsburgh Pirates": "PIT",
  "San Diego": "SD", "Padres": "SD", "San Diego Padres": "SD",
  "Seattle": "SEA", "Mariners": "SEA", "Seattle Mariners": "SEA",
  "San Francisco": "SF", "Giants": "SF", "San Francisco Giants": "SF",
  "St. Louis": "STL", "St Louis": "STL", "Cardinals": "STL", "St. Louis Cardinals": "STL",
  "Tampa Bay": "TB", "Rays": "TB", "Tampa Bay Rays": "TB",
  "Texas": "TEX", "Rangers": "TEX", "Texas Rangers": "TEX",
  "Toronto": "TOR", "Blue Jays": "TOR", "Toronto Blue Jays": "TOR",
  "Washington": "WSH", "Nationals": "WSH", "Washington Nationals": "WSH",
};

function resolveAbbr(name) {
  return NAME_TO_ABBR[(name || "").trim()] || null;
}

function mlbLogo(name) {
  const abbr = resolveAbbr(name);
  if (!abbr) return "";
  const team = TEAMS_BY_ABBR[abbr];
  const src = `https://a.espncdn.com/i/teamlogos/mlb/500/${(team.espn || abbr.toLowerCase())}.png`;
  return `<img src="${src}" alt="${name}" class="team-logo" onerror="this.style.display='none'">`;
}

// ── STATE ─────────────────────────────────────────────────────
let ALL_GAMES = [];
let sortKey = "date";
let sortDir = "desc";
let selectedAbbr = null;
let mapInstance = null;
let mapMarkers = [];

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  attachSortListeners();
  loadBaseball();
});

function setupTabs() {
  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "tab-baseball" && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 50);
      }
    });
  });
}

async function loadBaseball() {
  const loading = document.getElementById("os-loading");
  const errorEl = document.getElementById("os-error");
  try {
    const res = await fetch("/.netlify/functions/fetch-sheet?category=baseball");
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Failed to load");

    ALL_GAMES = (data.entries || [])
      .map((r) => ({
        season: (r["Season"] || "").trim(),
        gameType: (r["Pre/Regular/Post"] || "").trim(),
        dateRaw: (r["Date"] || "").trim(),
        homeTeamRaw: (r["Home Team"] || "").trim(),
        awayTeamRaw: (r["Away Team"] || "").trim(),
        homeAbbr: resolveAbbr(r["Home Team"]),
        awayAbbr: resolveAbbr(r["Away Team"]),
        homeRuns: parseInt(r["Home Team Runs"], 10) || 0,
        awayRuns: parseInt(r["Away Team Runs"], 10) || 0,
        guest: (r["Guest"] || "").trim(),
        notes: (r["Notes"] || "").trim(),
      }))
      .filter((g) => g.dateRaw && g.homeTeamRaw);

    renderStats();
    renderTable();
    renderMap();
  } catch (err) {
    errorEl.innerHTML = `<div class="os-error-msg">⚠️ Could not load baseball data: ${err.message}</div>`;
    errorEl.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
}

// ── HELPERS ───────────────────────────────────────────────────
function parseDateSafe(str) {
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

function fmtDateSlash(str) {
  const d = parseDateSafe(str);
  if (!d) return str || "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function byField(key, dir) {
  return (a, b) => {
    const va = (a[key] || "").toString();
    const vb = (b[key] || "").toString();
    const cmp = va.localeCompare(vb, undefined, { numeric: true, sensitivity: "base" });
    return dir === "asc" ? cmp : -cmp;
  };
}

function byNumber(key, dir) {
  return (a, b) => (dir === "asc" ? a[key] - b[key] : b[key] - a[key]);
}

function byDate(dir) {
  return (a, b) => {
    const da = parseDateSafe(a.dateRaw), db = parseDateSafe(b.dateRaw);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    const diff = da - db;
    return dir === "asc" ? diff : -diff;
  };
}

function sortedGames(games) {
  const comparators = {
    season: byField("season", sortDir),
    gameType: byField("gameType", sortDir),
    date: byDate(sortDir),
    homeTeam: byField("homeTeamRaw", sortDir),
    awayTeam: byField("awayTeamRaw", sortDir),
    score: byNumber("homeRuns", sortDir),
    guest: byField("guest", sortDir),
    notes: byField("notes", sortDir),
  };
  return [...games].sort(comparators[sortKey] || byDate(sortDir));
}

function attachSortListeners() {
  document.querySelectorAll("#bb-table th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
      else { sortKey = key; sortDir = key === "date" ? "desc" : "asc"; }
      renderTable();
    });
  });
}

function updateSortIndicators() {
  document.querySelectorAll("#bb-table th[data-sort]").forEach((th) => {
    const active = th.dataset.sort === sortKey;
    th.classList.toggle("sorted", active);
    th.querySelector(".sort-arrow")?.remove();
    if (active) {
      const arrow = document.createElement("span");
      arrow.className = "sort-arrow";
      arrow.textContent = sortDir === "asc" ? " ▲" : " ▼";
      th.appendChild(arrow);
    }
  });
}

// ── STATS ─────────────────────────────────────────────────────
function renderStats() {
  const gp = ALL_GAMES.length;
  const homeTotal = ALL_GAMES.reduce((s, g) => s + g.homeRuns, 0);
  const awayTotal = ALL_GAMES.reduce((s, g) => s + g.awayRuns, 0);
  document.getElementById("bb-gp").textContent = gp;
  document.getElementById("bb-home-score").textContent = homeTotal;
  document.getElementById("bb-away-score").textContent = awayTotal;
}

// ── TABLE ─────────────────────────────────────────────────────
function renderTable() {
  const heading = document.getElementById("bb-table-heading");
  const games = selectedAbbr ? ALL_GAMES.filter((g) => g.homeAbbr === selectedAbbr) : ALL_GAMES;

  if (selectedAbbr) {
    const team = TEAMS_BY_ABBR[selectedAbbr];
    heading.innerHTML = `Games at ${team.park} <span class="section-hint">— ${team.full}</span> <button class="os-clear-pill" id="bb-clear">Clear ×</button>`;
    document.getElementById("bb-clear").addEventListener("click", () => {
      selectedAbbr = null;
      mapMarkers.forEach((m) => m.closePopup());
      renderTable();
    });
  } else {
    heading.textContent = "All Games";
  }

  updateSortIndicators();

  const sorted = sortedGames(games);
  const tbody = document.querySelector("#bb-table tbody");
  tbody.innerHTML = sorted.length
    ? sorted.map((g) => `
      <tr>
        <td>${g.season || "—"}</td>
        <td>${g.gameType || "—"}</td>
        <td>${fmtDateSlash(g.dateRaw)}</td>
        <td>${mlbLogo(g.homeTeamRaw)}<span>${g.homeTeamRaw}</span></td>
        <td>${mlbLogo(g.awayTeamRaw)}<span>${g.awayTeamRaw}</span></td>
        <td>${g.homeRuns}–${g.awayRuns}</td>
        <td>${g.guest || "—"}</td>
        <td>${g.notes || "—"}</td>
      </tr>`).join("")
    : `<tr><td class="no-results" colspan="8">No games found.</td></tr>`;
}

// ── MAP ───────────────────────────────────────────────────────
function createVenueIcon(abbr, visited, selected) {
  const team = TEAMS_BY_ABBR[abbr];
  const src = `https://a.espncdn.com/i/teamlogos/mlb/500/${(team.espn || abbr.toLowerCase())}.png`;
  let cls = "venue-logo-marker";
  if (!visited && !selected) cls += " venue-logo-dim";
  if (selected) cls += " venue-logo-selected";
  return L.divIcon({
    className: "logo-icon-wrap",
    html: `<div class="${cls}"><img src="${src}" alt="${abbr}" onerror="this.style.display='none'"></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    tooltipAnchor: [0, -20],
    popupAnchor: [0, -20],
  });
}

function renderMap() {
  if (!mapInstance) {
    mapInstance = L.map("bb-map", { center: [39, -96], zoom: 4, minZoom: 3, maxZoom: 13 });
    L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: "&copy; Esri &copy; OpenStreetMap contributors",
      maxZoom: 19,
      maxNativeZoom: 16,
    }).addTo(mapInstance);
  }

  mapMarkers.forEach((m) => m.remove());
  mapMarkers = [];

  MLB_TEAMS.forEach((team) => {
    const gamesHere = ALL_GAMES.filter((g) => g.homeAbbr === team.abbr).sort((a, b) => {
      const da = parseDateSafe(a.dateRaw), db = parseDateSafe(b.dateRaw);
      return (db || 0) - (da || 0);
    });
    const visited = gamesHere.length > 0;
    const isSelected = selectedAbbr === team.abbr;
    const icon = createVenueIcon(team.abbr, visited, isSelected);
    const marker = L.marker([team.lat, team.lon], { icon }).addTo(mapInstance);

    const wikiUrl = `https://en.wikipedia.org/wiki/${team.wiki || team.park.replace(/ /g, "_")}`;
    const logoSrc = `https://a.espncdn.com/i/teamlogos/mlb/500/${(team.espn || team.abbr.toLowerCase())}.png`;

    marker.bindTooltip(
      `<div class="venue-tip-team">${team.full}</div><div class="venue-tip-arena">${team.park}</div>`,
      { direction: "top", offset: [0, -20], className: "venue-tooltip" }
    );

    const gamesHtml = gamesHere.length
      ? `<div class="bb-popup-games">${gamesHere.map((g) => `
          <div class="bb-popup-game">
            <div class="bb-popup-date">${fmtDateSlash(g.dateRaw)}</div>
            <div class="bb-popup-score-line">${g.homeTeamRaw} ${g.homeRuns} – ${g.awayTeamRaw} ${g.awayRuns}</div>
          </div>`).join("")}</div>`
      : `<div class="bb-popup-games"><div class="bb-popup-game dim">No games attended here yet.</div></div>`;

    marker.bindPopup(
      `<div class="bb-popup">
        <div class="bb-popup-main">
          <div class="bb-popup-info">
            <div class="bb-popup-team">${team.full}</div>
            <div class="bb-popup-arena"><a href="${wikiUrl}" target="_blank" rel="noopener">${team.park} ↗</a></div>
          </div>
          <img src="${logoSrc}" class="bb-popup-logo" alt="${team.full}" onerror="this.style.display='none'">
        </div>
        ${gamesHtml}
      </div>`,
      { className: "bb-popup-wrap", maxWidth: 300, offset: [0, -4] }
    );

    marker.on("popupopen", () => {
      mapMarkers.forEach((m) => m.getElement()?.querySelector(".venue-logo-marker")?.classList.remove("venue-logo-selected"));
      marker.getElement()?.querySelector(".venue-logo-marker")?.classList.add("venue-logo-selected");
      selectedAbbr = team.abbr;
      renderTable();
    });

    marker.on("popupclose", () => {
      marker.getElement()?.querySelector(".venue-logo-marker")?.classList.remove("venue-logo-selected");
      if (selectedAbbr === team.abbr) {
        selectedAbbr = null;
        renderTable();
      }
    });

    mapMarkers.push(marker);
  });
}
