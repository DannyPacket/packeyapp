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

function logoSrcForAbbr(abbr) {
  const team = TEAMS_BY_ABBR[abbr];
  // Falls back to the abbr itself (lowercased) for codes we don't have in
  // MLB_TEAMS — e.g. ESPN's own abbreviation for a team, which is already a
  // valid logo slug on its own (used by the box-score panel's linescore/
  // scoring-play team logos).
  const slug = team?.espn || (abbr || "").toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${slug}.png`;
}

function mlbLogo(name) {
  const abbr = resolveAbbr(name);
  if (!abbr) return "";
  return `<img src="${logoSrcForAbbr(abbr)}" alt="${name}" class="team-logo" onerror="this.style.display='none'">`;
}

// ── STATE ─────────────────────────────────────────────────────
let ALL_GAMES = [];
let sortKey = "date";
let sortDir = "desc";
let selectedAbbr = null;
let mapInstance = null;
let mapMarkers = [];
let openDropdown = null; // null | "season" | "home" | "away"
let activeFilters = { gameType: "All", season: [], homeTeam: [], awayTeam: [] };
let expandBbRow = null; // index into the currently-rendered table rows
const mlbGameCache = {}; // "YYYY-MM-DD|home|away" → normalised MLB Stats API game data

// ── BOOT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  attachSortListeners();
  setupFilterDelegation();
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

    renderAll();
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

function fmtDateShort(str) {
  const d = parseDateSafe(str);
  if (!d) return str || "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function dateToIso(str) {
  const d = parseDateSafe(str);
  if (!d) return null;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
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
      renderAll();
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

// ── FILTERS ───────────────────────────────────────────────────
// Home/away team options are only ever the teams that actually appear in the
// data (not all 30 MLB teams) — same idea as the hockey map's opponent filter.
// Display labels differ from the sheet's own "Pre/Regular/Post" values.
const GAME_TYPE_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Regular", value: "Regular" },
  { label: "Playoffs", value: "Post" },
  { label: "Preseason", value: "Pre" },
];
function uniqueSeasons() {
  return [...new Set(ALL_GAMES.filter((g) => g.season).map((g) => g.season))].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
}
function uniqueHomeTeams() {
  const abbrs = new Set(ALL_GAMES.map((g) => g.homeAbbr).filter(Boolean));
  return [...abbrs].sort((a, b) => (TEAMS_BY_ABBR[a]?.full || a).localeCompare(TEAMS_BY_ABBR[b]?.full || b));
}
function uniqueAwayTeams() {
  const abbrs = new Set(ALL_GAMES.map((g) => g.awayAbbr).filter(Boolean));
  return [...abbrs].sort((a, b) => (TEAMS_BY_ABBR[a]?.full || a).localeCompare(TEAMS_BY_ABBR[b]?.full || b));
}

function filteredGames() {
  return ALL_GAMES.filter((g) => {
    if (activeFilters.gameType !== "All" && g.gameType !== activeFilters.gameType) return false;
    if (activeFilters.season.length && !activeFilters.season.includes(g.season)) return false;
    if (activeFilters.homeTeam.length && !activeFilters.homeTeam.includes(g.homeAbbr)) return false;
    if (activeFilters.awayTeam.length && !activeFilters.awayTeam.includes(g.awayAbbr)) return false;
    return true;
  });
}

function ddChecklist(kind, options, selected, labelOf, withLogo) {
  const noun = kind === "season" ? "Seasons" : "Teams";
  const allItem = `<label class="dd-item dd-all">
      <input type="checkbox" class="dd-check" data-dd-kind="${kind}" value="__all__"${selected.length === 0 ? " checked" : ""}>
      <span>All ${noun}</span>
    </label><div class="dd-divider"></div>`;
  const items = options.map((v) => `<label class="dd-item">
      <input type="checkbox" class="dd-check" data-dd-kind="${kind}" value="${v}"${selected.includes(v) ? " checked" : ""}>
      ${withLogo ? mlbLogoNoName(v) : ""}
      <span>${labelOf(v)}</span>
    </label>`).join("");
  return allItem + items;
}
function mlbLogoNoName(abbr) {
  return `<img src="${logoSrcForAbbr(abbr)}" class="team-logo" onerror="this.style.display='none'">`;
}

function filtersHTML() {
  const gt = activeFilters.gameType;
  const seasons = uniqueSeasons();
  const homeTeams = uniqueHomeTeams();
  const awayTeams = uniqueAwayTeams();

  const seasonSel = activeFilters.season, homeSel = activeFilters.homeTeam, awaySel = activeFilters.awayTeam;
  const seasonLabel = seasonSel.length === 0 ? "All Seasons" : seasonSel.length === 1 ? seasonSel[0] : `${seasonSel.length} Seasons`;
  const homeLabel = homeSel.length === 0 ? "All Teams" : homeSel.length === 1 ? (TEAMS_BY_ABBR[homeSel[0]]?.full || homeSel[0]) : `${homeSel.length} Teams`;
  const awayLabel = awaySel.length === 0 ? "All Teams" : awaySel.length === 1 ? (TEAMS_BY_ABBR[awaySel[0]]?.full || awaySel[0]) : `${awaySel.length} Teams`;

  return `<div class="filters">
    <span class="filter-label">Game Type:</span>
    ${GAME_TYPE_OPTIONS.map((opt) => `<button class="pill${gt === opt.value ? " active" : ""}" data-filter="${opt.value}" data-group="gameType">${opt.label}</button>`).join("")}
    <span class="filter-sep"></span>
    <span class="filter-label">Season:</span>
    <div class="dd-wrap${openDropdown === "season" ? " dd-open" : ""}" data-dd="season">
      <button class="pill dd-trigger${seasonSel.length ? " active" : ""}">${seasonLabel} <span class="chevron">▾</span></button>
      <div class="dd-panel${openDropdown === "season" ? " open" : ""}">${ddChecklist("season", seasons, seasonSel, (s) => s, false)}</div>
    </div>
    <span class="filter-sep"></span>
    <span class="filter-label">Home Team:</span>
    <div class="dd-wrap${openDropdown === "home" ? " dd-open" : ""}" data-dd="home">
      <button class="pill dd-trigger${homeSel.length ? " active" : ""}">${homeLabel} <span class="chevron">▾</span></button>
      <div class="dd-panel${openDropdown === "home" ? " open" : ""}">${ddChecklist("home", homeTeams, homeSel, (a) => TEAMS_BY_ABBR[a]?.full || a, true)}</div>
    </div>
    <span class="filter-sep"></span>
    <span class="filter-label">Away Team:</span>
    <div class="dd-wrap${openDropdown === "away" ? " dd-open" : ""}" data-dd="away">
      <button class="pill dd-trigger${awaySel.length ? " active" : ""}">${awayLabel} <span class="chevron">▾</span></button>
      <div class="dd-panel${openDropdown === "away" ? " open" : ""}">${ddChecklist("away", awayTeams, awaySel, (a) => TEAMS_BY_ABBR[a]?.full || a, true)}</div>
    </div>
  </div>`;
}

function setupFilterDelegation() {
  // Game Type pills
  document.addEventListener("click", (e) => {
    const pill = e.target.closest(".pill[data-filter]");
    if (!pill) return;
    const { group, filter: val } = pill.dataset;
    if (!group || !val) return;
    activeFilters[group] = val;
    renderAll();
  });

  // Dropdown trigger toggle + outside-click close (only one open at a time)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest(".dd-trigger");
    if (trigger) {
      const kind = trigger.closest(".dd-wrap")?.dataset.dd;
      openDropdown = openDropdown === kind ? null : kind;
      renderAll();
      return;
    }
    if (!e.target.closest(".dd-wrap") && openDropdown) {
      openDropdown = null;
      renderAll();
    }
  });

  // Checklist checkbox change
  document.addEventListener("change", (e) => {
    const cb = e.target.closest(".dd-check");
    if (!cb) return;
    const kind = cb.dataset.ddKind;
    const field = kind === "season" ? "season" : kind === "home" ? "homeTeam" : "awayTeam";
    const val = cb.value;
    if (val === "__all__") {
      activeFilters[field] = [];
    } else {
      const idx = activeFilters[field].indexOf(val);
      if (idx === -1) activeFilters[field].push(val);
      else activeFilters[field].splice(idx, 1);
    }
    renderAll();
  });
}

// ── MASTER RENDER ─────────────────────────────────────────────
function renderAll() {
  const games = filteredGames();
  document.getElementById("bb-filters").innerHTML = filtersHTML();
  renderStats(games);
  renderTable(games);
  renderMap(games);
}

// ── STATS ─────────────────────────────────────────────────────
function renderStats(games) {
  const gp = games.length;
  const homeTotal = games.reduce((s, g) => s + g.homeRuns, 0);
  const awayTotal = games.reduce((s, g) => s + g.awayRuns, 0);
  document.getElementById("bb-gp").textContent = gp;
  document.getElementById("bb-home-score").textContent = homeTotal;
  document.getElementById("bb-away-score").textContent = awayTotal;
}

// ── TABLE ─────────────────────────────────────────────────────
function renderTable(games) {
  const heading = document.getElementById("bb-table-heading");
  const rows = selectedAbbr ? games.filter((g) => g.homeAbbr === selectedAbbr) : games;

  if (selectedAbbr) {
    const team = TEAMS_BY_ABBR[selectedAbbr];
    heading.innerHTML = `Games at ${team.park} <span class="section-hint">— ${team.full}</span> <button class="os-clear-pill" id="bb-clear">Clear ×</button>`;
    document.getElementById("bb-clear").addEventListener("click", () => {
      selectedAbbr = null;
      mapMarkers.forEach((m) => m.closePopup());
      renderAll();
    });
  } else {
    heading.textContent = "All Games";
  }

  updateSortIndicators();

  const sorted = sortedGames(rows);
  const tbody = document.querySelector("#bb-table tbody");
  tbody.innerHTML = sorted.length
    ? sorted.map((g, i) => {
        const isOpen = expandBbRow === i;
        return `
        <tr class="bb-row${isOpen ? " row-open" : ""}" data-bb-i="${i}" title="Click to view box score">
          <td>${g.season || "—"}</td>
          <td>${g.gameType || "—"}</td>
          <td><span class="bb-date-btn">${fmtDateShort(g.dateRaw)}</span> <span class="chevron">${isOpen ? "▴" : "▾"}</span></td>
          <td>${mlbLogo(g.homeTeamRaw)}<span>${g.homeTeamRaw}</span></td>
          <td>${mlbLogo(g.awayTeamRaw)}<span>${g.awayTeamRaw}</span></td>
          <td>${g.homeRuns}–${g.awayRuns}</td>
          <td>${g.guest || "—"}</td>
          <td>${g.notes || "—"}</td>
        </tr>
        ${isOpen ? `<tr class="bb-expand-tr"><td colspan="8" style="padding:0"><div class="mlb-panel" id="bb-panel-${i}"><div class="mlb-loading">Loading box score…</div></div></td></tr>` : ""}`;
      }).join("")
    : `<tr><td class="no-results" colspan="8">No games found.</td></tr>`;

  tbody.querySelectorAll(".bb-row").forEach((tr) => {
    tr.addEventListener("click", () => {
      const i = +tr.dataset.bbI;
      expandBbRow = expandBbRow === i ? null : i;
      renderTable(games);
    });
  });

  if (expandBbRow !== null && expandBbRow < sorted.length) {
    loadMlbDetailForGame(sorted[expandBbRow], `bb-panel-${expandBbRow}`);
  }
}

// ── BOX SCORE DETAIL ──────────────────────────────────────────
async function fetchMlbGame(g) {
  const dateStr = dateToIso(g.dateRaw);
  if (!dateStr || !g.homeAbbr || !g.awayAbbr) return null;
  const cacheKey = `${dateStr}|${g.homeAbbr}|${g.awayAbbr}`;
  if (mlbGameCache[cacheKey]) return mlbGameCache[cacheKey];

  try {
    const res = await fetch(`/.netlify/functions/mlb-game?date=${dateStr}&home=${g.homeAbbr}&away=${g.awayAbbr}`);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || `Proxy error ${res.status}`);
    mlbGameCache[cacheKey] = data;
    return data;
  } catch (err) {
    console.error("[mlb-game] failed:", err);
    return null;
  }
}

async function loadMlbDetailForGame(g, panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  if (!g.homeAbbr || !g.awayAbbr) {
    panel.innerHTML = `<div class="mlb-error">Can't look up a box score — one of the team names isn't recognized. Try renaming it to the team's full name in the sheet.</div>`;
    return;
  }

  const data = await fetchMlbGame(g);
  const p = document.getElementById(panelId);
  if (!p) return;

  if (!data) {
    p.innerHTML = `<div class="mlb-error">No box score found for ${fmtDateShort(g.dateRaw)}.</div>`;
    return;
  }
  renderMlbDetail(p, data, g);
}

function renderMlbDetail(panel, data, g) {
  const { score, innings, totals, scoringPlays, teamStats, stars, gamePk } = data;
  const gamedayUrl = gamePk ? `https://www.mlb.com/gameday/${gamePk}` : "https://www.mlb.com/scores";

  const inningHeaderCells = innings.map((p) => `<th>${p.label}</th>`).join("");
  const awayInningCells = innings.map((p) => `<td>${p.away}</td>`).join("");
  const homeInningCells = innings.map((p) => `<td>${p.home}</td>`).join("");

  const linescoreHtml = `
    <div class="table-wrap">
      <table class="linescore-table">
        <thead><tr><th></th>${inningHeaderCells}<th>R</th><th>H</th><th>E</th></tr></thead>
        <tbody>
          <tr>
            <td>${mlbLogoNoName(score.awayAbbr)}<span>${score.awayAbbr}</span></td>
            ${awayInningCells}
            <td class="linescore-total">${totals.awayR}</td><td>${totals.awayH}</td><td>${totals.awayE}</td>
          </tr>
          <tr>
            <td>${mlbLogoNoName(score.homeAbbr)}<span>${score.homeAbbr}</span></td>
            ${homeInningCells}
            <td class="linescore-total">${totals.homeR}</td><td>${totals.homeH}</td><td>${totals.homeE}</td>
          </tr>
        </tbody>
      </table>
    </div>`;

  panel.innerHTML = `
    <div class="mlb-detail">
      <div class="mlb-header">
        <div class="mlb-status">${score.status}</div>
        ${linescoreHtml}
        <a href="${gamedayUrl}" target="_blank" class="mlb-ext-link">Full box score on MLB.com ↗</a>
      </div>

      <div class="mlb-two-col">
        <div class="mlb-section">
          <div class="mlb-section-title">Scoring</div>
          ${buildMlbScoring(scoringPlays)}
        </div>
        <div class="mlb-section">
          <div class="mlb-section-title">Team Stats</div>
          ${buildMlbTeamStats(teamStats, score)}
        </div>
        <div class="mlb-section">
          <div class="mlb-section-title">Player of the Game</div>
          ${buildMlbStars(stars)}
        </div>
      </div>
    </div>`;
}

function buildMlbScoring(plays) {
  if (!plays || !plays.length) return `<p class="mlb-empty">No scoring plays available.</p>`;
  return `<div class="mlb-scoring-log">${plays.map((p) => `
    <div class="mlb-score-row">
      <span class="mlb-score-inning">${p.inning}</span>
      <span class="mlb-score-team-logo">${p.team ? mlbLogoNoName(p.team) : ""}</span>
      <div class="mlb-score-detail">
        ${p.tag ? `<span class="mlb-score-tag">${p.tag}</span>` : ""}
        <div class="mlb-score-text">${p.text}</div>
        <div class="mlb-score-snap">${p.awayScore}–${p.homeScore}</div>
      </div>
    </div>`).join("")}</div>`;
}

function buildMlbTeamStats(teamStats, score) {
  if (!teamStats || !teamStats.length) return `<p class="mlb-empty">No team stats available.</p>`;
  const rows = teamStats.map((s) => {
    const av = parseFloat(s.away), hv = parseFloat(s.home);
    const awayHi = !isNaN(av) && !isNaN(hv) && av > hv ? " stat-val-hi" : "";
    const homeHi = !isNaN(av) && !isNaN(hv) && hv > av ? " stat-val-hi" : "";
    return `<tr>
      <td class="stat-label">${s.label}</td>
      <td class="${awayHi}">${s.away}</td>
      <td class="${homeHi}">${s.home}</td>
    </tr>`;
  }).join("");
  return `<table class="team-stats-table">
    <thead><tr><th></th><th>${score.awayAbbr}</th><th>${score.homeAbbr}</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function mlbStarCardHtml(st) {
  const statLine = (st.stats || []).map((s) => `${s.label}: ${s.value}`).join(" · ");
  const headshot = st.headshot
    ? `<img src="${st.headshot}" class="mlb-star-headshot" alt="${st.name}" onerror="this.style.display='none'">`
    : "";
  return `<div class="mlb-star-card">
    <div class="mlb-star-card-body">
      <div>
        <div class="mlb-star-rank">${st.role}</div>
        <div class="mlb-star-name">${st.name || "—"}</div>
        <div class="mlb-star-meta">${st.team || ""}</div>
        ${statLine ? `<div class="mlb-star-stat">${statLine}</div>` : ""}
      </div>
      ${headshot}
    </div>
  </div>`;
}

function buildMlbStars(stars) {
  if (!stars || !stars.length) return `<p class="mlb-empty">No stars data available.</p>`;
  // The winning pitcher (first, per ROLE_DEFS order in mlb-game.js) stands in
  // for "Player of the Game" since MLB Stats API doesn't hand us a formal
  // award — the loss/save decisions round out a short "Top Performers" list.
  const [potm, ...rest] = stars;
  const restHtml = rest.length
    ? `<div class="mlb-top-performers-label">Top Performers</div>${rest.map(mlbStarCardHtml).join("")}`
    : "";
  return `<div class="mlb-stars-col">${mlbStarCardHtml(potm)}${restHtml}</div>`;
}

// ── MAP ───────────────────────────────────────────────────────
function createVenueIcon(abbr, visited, selected) {
  let cls = "venue-logo-marker";
  if (visited) cls += " venue-logo-visited";
  if (!visited && !selected) cls += " venue-logo-dim";
  if (selected) cls += " venue-logo-selected";
  return L.divIcon({
    className: "logo-icon-wrap",
    html: `<div class="${cls}"><img src="${logoSrcForAbbr(abbr)}" alt="${abbr}" onerror="this.style.display='none'"></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    tooltipAnchor: [0, -20],
    popupAnchor: [0, -20],
  });
}

function renderMap(games) {
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
    const gamesHere = games.filter((g) => g.homeAbbr === team.abbr).sort((a, b) => {
      const da = parseDateSafe(a.dateRaw), db = parseDateSafe(b.dateRaw);
      return (db || 0) - (da || 0);
    });
    const visited = gamesHere.length > 0;
    const isSelected = selectedAbbr === team.abbr;
    const icon = createVenueIcon(team.abbr, visited, isSelected);
    const marker = L.marker([team.lat, team.lon], { icon }).addTo(mapInstance);

    const wikiUrl = `https://en.wikipedia.org/wiki/${team.wiki || team.park.replace(/ /g, "_")}`;

    marker.bindTooltip(
      `<div class="venue-tip-team">${team.full}</div><div class="venue-tip-arena">${team.park}</div>`,
      { direction: "top", offset: [0, -20], className: "venue-tooltip" }
    );

    const gamesHtml = gamesHere.length
      ? `<div class="bb-popup-games">${gamesHere.map((g) => `
          <div class="bb-popup-game">
            <div class="bb-popup-date">${fmtDateShort(g.dateRaw)}</div>
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
          <img src="${logoSrcForAbbr(team.abbr)}" class="bb-popup-logo" alt="${team.full}" onerror="this.style.display='none'">
        </div>
        ${gamesHtml}
      </div>`,
      { className: "bb-popup-wrap", maxWidth: 300, offset: [0, -4] }
    );

    marker.on("popupopen", () => {
      mapMarkers.forEach((m) => m.getElement()?.querySelector(".venue-logo-marker")?.classList.remove("venue-logo-selected"));
      marker.getElement()?.querySelector(".venue-logo-marker")?.classList.add("venue-logo-selected");
      selectedAbbr = team.abbr;
      renderTable(filteredGames());
    });

    marker.on("popupclose", () => {
      marker.getElement()?.querySelector(".venue-logo-marker")?.classList.remove("venue-logo-selected");
      if (selectedAbbr === team.abbr) {
        selectedAbbr = null;
        renderTable(filteredGames());
      }
    });

    mapMarkers.push(marker);
  });
}
