// /.netlify/functions/mlb-game
// Proxies MLB's official public Stats API server-side (no CORS issues) for
// the Other Sports baseball game-detail panel. Called by the frontend as:
//   /.netlify/functions/mlb-game?date=YYYY-MM-DD&home=SD&away=CHC
// "home"/"away" are our own MLB_TEAMS abbreviations (see other-sports/js/app.js).
//
// Uses statsapi.mlb.com instead of ESPN's site API: ESPN's API rejects
// requests from Netlify Functions' outbound IPs with a 403 (confirmed by
// testing both this endpoint's ESPN equivalent and the existing hockey
// espn-game.js function in production — both blocked, even though they work
// fine from a local machine), while MLB's official Stats API is unblocked.

// The schedule endpoint's team objects only carry id + name (no
// abbreviation), so games are matched by MLB's own numeric team ids rather
// than abbreviation strings. Keyed by our own MLB_TEAMS abbreviations (see
// other-sports/js/app.js) — note MLB's API spells two of these differently
// (Arizona "AZ" not "ARI", Athletics "ATH" not "OAK"), which is exactly why
// this maps by id instead of comparing abbreviation text.
const ABBR_TO_MLB_ID = {
  ARI: 109, ATL: 144, BAL: 110, BOS: 111, CHC: 112, CWS: 145, CIN: 113, CLE: 114,
  COL: 115, DET: 116, HOU: 117, KC: 118, LAA: 108, LAD: 119, MIA: 146, MIL: 158,
  MIN: 142, NYM: 121, NYY: 147, OAK: 133, PHI: 143, PIT: 134, SD: 135, SEA: 136,
  SF: 137, STL: 138, TB: 139, TEX: 140, TOR: 141, WSH: 120,
};

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
};
const ERROR_HEADERS = { ...HEADERS, "Cache-Control": "no-store" };

function ok(body)  { return { statusCode: 200, headers: HEADERS, body: JSON.stringify(body) }; }
function err(code, msg) { return { statusCode: code, headers: ERROR_HEADERS, body: JSON.stringify({ error: msg }) }; }

async function findGamePk(date, homeAbbr, awayAbbr) {
  const wantHomeId = ABBR_TO_MLB_ID[homeAbbr];
  const wantAwayId = ABBR_TO_MLB_ID[awayAbbr];
  if (!wantHomeId || !wantAwayId) return null;

  const r = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}`);
  if (!r.ok) return null;
  const sched = await r.json();
  const games = sched.dates?.[0]?.games || [];

  let partial = null;
  for (const g of games) {
    const homeId = g.teams?.home?.team?.id;
    const awayId = g.teams?.away?.team?.id;
    if (homeId === wantHomeId && awayId === wantAwayId) return g.gamePk;
    if (!partial && (homeId === wantHomeId || awayId === wantAwayId || homeId === wantAwayId || awayId === wantHomeId)) partial = g.gamePk;
  }
  return partial;
}

function headshotUrl(id) {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/w_180,q_100/v1/people/${id}/headshot/67/current`;
}

async function fetchGameData(gamePk) {
  const [feedRes, wpRes] = await Promise.all([
    fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`),
    fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/winProbability`),
  ]);
  if (!feedRes.ok) throw new Error(`MLB Stats API error: ${feedRes.status}`);
  const raw = await feedRes.json();
  const wpList = wpRes.ok ? await wpRes.json() : [];

  const gd = raw.gameData || {};
  const live = raw.liveData || {};
  const linescore = live.linescore || {};

  const awayAbbr = gd.teams?.away?.abbreviation || "";
  const homeAbbr = gd.teams?.home?.abbreviation || "";
  const totals = linescore.teams || {};

  const score = {
    awayAbbr, homeAbbr,
    awayScore: String(totals.away?.runs ?? ""),
    homeScore: String(totals.home?.runs ?? ""),
    status: gd.status?.detailedState || "Final",
  };

  const innings = (linescore.innings || []).map((p) => ({
    label: String(p.num),
    away: String(p.away?.runs ?? ""),
    home: String(p.home?.runs ?? ""),
  }));
  const scoreTotals = {
    awayR: score.awayScore, homeR: score.homeScore,
    awayH: totals.away?.hits ?? 0, homeH: totals.home?.hits ?? 0,
    awayE: totals.away?.errors ?? 0, homeE: totals.home?.errors ?? 0,
  };

  // Scoring plays
  const allPlays = live.plays?.allPlays || [];
  const scoringPlays = (live.plays?.scoringPlays || []).map((i) => allPlays[i]).filter(Boolean).map((p) => {
    const top = p.about?.isTopInning;
    return {
      inning: `${top ? "T" : "B"}${p.about?.inning ?? ""}`,
      team: top ? awayAbbr : homeAbbr,
      tag: p.result?.event || "",
      text: p.result?.description || "",
      awayScore: p.result?.awayScore ?? "",
      homeScore: p.result?.homeScore ?? "",
    };
  });

  // Team stats
  const boxTeams = live.boxscore?.teams || {};
  function stat(side, group, name) {
    const v = boxTeams[side]?.teamStats?.[group]?.[name];
    return v != null ? v : null;
  }
  const STAT_DEFS = [
    { group: "batting", name: "hits", label: "Hits" },
    { group: "batting", name: "homeRuns", label: "Home Runs" },
    { group: "batting", name: "baseOnBalls", label: "Walks" },
    { group: "batting", name: "strikeOuts", label: "Strikeouts" },
    { group: "batting", name: "leftOnBase", label: "Left On Base" },
    { group: "fielding", name: "errors", label: "Errors" },
  ];
  const teamStats = STAT_DEFS.map(({ group, name, label }) => {
    const away = stat("away", group, name);
    const home = stat("home", group, name);
    return away != null && home != null ? { label, away: String(away), home: String(home) } : null;
  }).filter(Boolean);

  const homePitchers = new Set(boxTeams.home?.pitchers || []);
  function battingSummary(personId, side) {
    return boxTeams[side]?.players?.[`ID${personId}`]?.stats?.batting?.summary || "";
  }

  // Win-probability-added per at-bat (from the home team's perspective),
  // keyed by atBatIndex — used to rank standout batters the same way
  // MLB.com's own "Top Performers" module does.
  const wpaByAtBat = {};
  for (const w of (wpList || [])) {
    if (w && w.atBatIndex != null) wpaByAtBat[w.atBatIndex] = w.homeTeamWinProbabilityAdded || 0;
  }
  const battingWpa = {}; // personId -> { name, side, total }
  for (const p of allPlays) {
    const idx = p.about?.atBatIndex;
    const wpaHome = wpaByAtBat[idx];
    const batter = p.matchup?.batter;
    if (wpaHome == null || !batter) continue;
    const isHomeBatting = p.about?.isTopInning === false;
    const wpaForBatter = isHomeBatting ? wpaHome : -wpaHome;
    if (!battingWpa[batter.id]) battingWpa[batter.id] = { name: batter.fullName || "", side: isHomeBatting ? "home" : "away", total: 0 };
    battingWpa[batter.id].total += wpaForBatter;
  }

  // Player of the Game — the batter of the game's final scoring play (the
  // walk-off hero in extras, or whoever plated the last run otherwise).
  // Verified against MLB.com's own Gameday page for a real walk-off game:
  // their pick matches this exactly, even though it isn't simply whoever has
  // the single highest aggregate WPA in the game.
  const scoringIdxList = live.plays?.scoringPlays || [];
  const lastScoringPlay = scoringIdxList.length ? allPlays[scoringIdxList[scoringIdxList.length - 1]] : null;
  const potmBatter = lastScoringPlay?.matchup?.batter || null;
  const potmSide = lastScoringPlay ? (lastScoringPlay.about?.isTopInning ? "away" : "home") : null;

  const playerOfGame = potmBatter ? {
    name: potmBatter.fullName || "",
    team: potmSide === "home" ? homeAbbr : awayAbbr,
    headshot: headshotUrl(potmBatter.id),
    summary: battingSummary(potmBatter.id, potmSide),
    wpaPct: battingWpa[potmBatter.id] ? Math.round(battingWpa[potmBatter.id].total * 10) / 10 : null,
  } : null;

  const topPerformers = Object.entries(battingWpa)
    .filter(([id]) => !potmBatter || Number(id) !== potmBatter.id)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3)
    .map(([id, v]) => ({
      name: v.name,
      team: v.side === "home" ? homeAbbr : awayAbbr,
      headshot: headshotUrl(id),
      summary: battingSummary(id, v.side),
    }));

  // Pitching decisions move under Team Stats as a compact line rather than
  // being treated as "stars" — that's really the batters' spotlight above.
  const decisions = live.decisions || {};
  function decisionInfo(key) {
    const p = decisions[key];
    if (!p) return null;
    const side = homePitchers.has(p.id) ? "home" : "away";
    const record = (boxTeams[side]?.players?.[`ID${p.id}`]?.stats?.pitching?.note || "").replace(/[()]/g, "");
    return { name: p.fullName || "", record };
  }
  const pitchingDecisions = {
    win: decisionInfo("winner"),
    loss: decisionInfo("loser"),
    save: decisionInfo("save"),
  };

  return { score, innings, totals: scoreTotals, scoringPlays, teamStats, playerOfGame, topPerformers, pitchingDecisions };
}

exports.handler = async (event) => {
  const { date, home, away } = event.queryStringParameters || {};
  if (!date || !home || !away) return err(400, "date, home, and away are required");

  try {
    const gamePk = await findGamePk(date, home.toUpperCase(), away.toUpperCase());
    if (!gamePk) return err(404, `No MLB game found for ${date} (${away} @ ${home})`);
    const data = await fetchGameData(gamePk);
    return ok({ gamePk, ...data });
  } catch (e) {
    return err(500, e.message);
  }
};
