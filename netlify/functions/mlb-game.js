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
  const r = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
  if (!r.ok) throw new Error(`MLB Stats API error: ${r.status}`);
  const raw = await r.json();

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

  // Stars — MLB's natural equivalent of hockey's three stars is the game's
  // pitching decisions (win/loss/save), each with their actual line from the
  // box score (boxscore.teams.{side}.players is keyed "ID<personId>").
  const homePitchers = new Set(boxTeams.home?.pitchers || []);
  const decisions = live.decisions || {};
  const PITCH_STAT_DEFS = [
    { name: "inningsPitched", label: "IP" },
    { name: "hits", label: "H" },
    { name: "earnedRuns", label: "ER" },
    { name: "baseOnBalls", label: "BB" },
    { name: "strikeOuts", label: "K" },
  ];
  function pitchingLine(personId, side) {
    const p = boxTeams[side]?.players?.[`ID${personId}`];
    const line = p?.stats?.pitching;
    if (!line) return [];
    return PITCH_STAT_DEFS
      .filter(({ name }) => line[name] != null)
      .map(({ name, label }) => ({ label, value: String(line[name]) }));
  }
  const ROLE_DEFS = [
    { key: "winner", role: "Win" },
    { key: "loser", role: "Loss" },
    { key: "save", role: "Save" },
  ];
  const stars = ROLE_DEFS.map(({ key, role }) => {
    const p = decisions[key];
    if (!p) return null;
    const side = homePitchers.has(p.id) ? "home" : "away";
    const team = side === "home" ? homeAbbr : awayAbbr;
    return { role, name: p.fullName || "", team, headshot: headshotUrl(p.id), stats: pitchingLine(p.id, side) };
  }).filter(Boolean);

  return { score, innings, totals: scoreTotals, scoringPlays, teamStats, stars };
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
