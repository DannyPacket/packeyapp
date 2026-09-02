// /.netlify/functions/nba-game
// Proxies the NBA's official stats.nba.com API server-side (no CORS issues)
// for the Other Sports basketball game-detail panel. Called by the frontend
// as: /.netlify/functions/nba-game?date=YYYY-MM-DD&home=BOS&away=TOR
// "home"/"away" are our own NBA_TEAMS abbreviations (see other-sports/js/app.js).
//
// stats.nba.com 403s/500s without a browser-shaped request — it wants a
// Referer/Origin from nba.com and a couple of custom headers, not just a UA.

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
};
const ERROR_HEADERS = { ...HEADERS, "Cache-Control": "no-store" };
const NBA_FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://www.nba.com/",
  "Origin": "https://www.nba.com",
  "Accept": "application/json, text/plain, */*",
  "x-nba-stats-origin": "stats",
  "x-nba-stats-token": "true",
};

function ok(body)  { return { statusCode: 200, headers: HEADERS, body: JSON.stringify(body) }; }
function err(code, msg) { return { statusCode: code, headers: ERROR_HEADERS, body: JSON.stringify({ error: msg }) }; }

function mmddyyyy(iso) {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

async function findGameId(date, homeAbbr, awayAbbr) {
  const url = `https://stats.nba.com/stats/leaguegamefinder?LeagueID=00&DateFrom=${mmddyyyy(date)}&DateTo=${mmddyyyy(date)}`;
  const r = await fetch(url, { headers: NBA_FETCH_HEADERS });
  if (!r.ok) return null;
  const data = await r.json();
  const rs = data.resultSets?.[0];
  if (!rs) return null;
  const idx = (name) => rs.headers.indexOf(name);
  const rows = rs.rowSet || [];

  let partial = null;
  for (const row of rows) {
    const abbr = row[idx("TEAM_ABBREVIATION")];
    const matchup = row[idx("MATCHUP")] || ""; // e.g. "BOS vs. TOR" or "TOR @ BOS"
    const gameId = row[idx("GAME_ID")];
    if (abbr === homeAbbr && matchup.includes("vs.") && matchup.includes(awayAbbr)) return gameId;
    if (abbr === awayAbbr && matchup.includes("@") && matchup.includes(homeAbbr)) return gameId;
    if (!partial && (abbr === homeAbbr || abbr === awayAbbr)) partial = gameId;
  }
  return partial;
}

function headshotUrl(personId) {
  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${personId}.png`;
}

async function fetchGameData(gameId, homeAbbr, awayAbbr) {
  const [summaryRes, boxRes, pbpRes] = await Promise.all([
    fetch(`https://stats.nba.com/stats/boxscoresummaryv2?GameID=${gameId}`, { headers: NBA_FETCH_HEADERS }),
    fetch(`https://stats.nba.com/stats/boxscoretraditionalv2?GameID=${gameId}&StartPeriod=0&EndPeriod=10&StartRange=0&EndRange=0&RangeType=0`, { headers: NBA_FETCH_HEADERS }),
    fetch(`https://stats.nba.com/stats/playbyplayv3?GameID=${gameId}&StartPeriod=0&EndPeriod=10`, { headers: NBA_FETCH_HEADERS }),
  ]);
  if (!summaryRes.ok) throw new Error(`NBA Stats API error: ${summaryRes.status}`);
  const summary = await summaryRes.json();
  const box = boxRes.ok ? await boxRes.json() : null;
  const pbp = pbpRes.ok ? await pbpRes.json() : null;

  const rsByName = (data, name) => (data?.resultSets || []).find((rs) => rs.name === name);
  const rowsOf = (rs) => (rs ? rs.rowSet.map((row) => Object.fromEntries(rs.headers.map((h, i) => [h, row[i]]))) : []);

  const lineRows = rowsOf(rsByName(summary, "LineScore"));
  const homeLine = lineRows.find((r) => r.TEAM_ABBREVIATION === homeAbbr);
  const awayLine = lineRows.find((r) => r.TEAM_ABBREVIATION === awayAbbr);
  const infoRows = rowsOf(rsByName(summary, "GameInfo"));
  const status = infoRows[0] ? "Final" : "Final";

  const score = {
    awayAbbr, homeAbbr,
    awayScore: String(awayLine?.PTS ?? ""),
    homeScore: String(homeLine?.PTS ?? ""),
    status,
  };

  const QTR_KEYS = ["PTS_QTR1", "PTS_QTR2", "PTS_QTR3", "PTS_QTR4", "PTS_OT1", "PTS_OT2", "PTS_OT3", "PTS_OT4", "PTS_OT5"];
  const QTR_LABELS = ["1", "2", "3", "4", "OT1", "OT2", "OT3", "OT4", "OT5"];
  const quarters = [];
  QTR_KEYS.forEach((key, i) => {
    const h = homeLine?.[key], a = awayLine?.[key];
    if (h == null && a == null) return;
    if (i > 3 && !h && !a) return; // skip unplayed OT columns
    quarters.push({ label: QTR_LABELS[i], away: String(a ?? ""), home: String(h ?? "") });
  });

  const teamRows = rowsOf(rsByName(box, "TeamStats"));
  const homeTeam = teamRows.find((r) => r.TEAM_ABBREVIATION === homeAbbr);
  const awayTeam = teamRows.find((r) => r.TEAM_ABBREVIATION === awayAbbr);
  const STAT_DEFS = [
    { key: "REB", label: "Rebounds" },
    { key: "AST", label: "Assists" },
    { key: "STL", label: "Steals" },
    { key: "BLK", label: "Blocks" },
    { key: "TO", label: "Turnovers" },
  ];
  const teamStats = STAT_DEFS.map(({ key, label }) => {
    const away = awayTeam?.[key], home = homeTeam?.[key];
    return away != null && home != null ? { label, away: String(away), home: String(home) } : null;
  }).filter(Boolean);
  if (homeTeam?.FG_PCT != null && awayTeam?.FG_PCT != null) {
    teamStats.push({ label: "FG %", away: `${(awayTeam.FG_PCT * 100).toFixed(1)}%`, home: `${(homeTeam.FG_PCT * 100).toFixed(1)}%` });
  }

  // Scoring — 3-pointers only (a full made-shot log would run 150+ rows for
  // one game; 3s are the natural "highlight-caliber" scoring events here).
  const actions = pbp?.game?.actions || [];
  const scoringPlays = actions
    .filter((a) => a.actionType === "Made Shot" && a.shotValue === 3)
    .map((a) => ({
      inning: a.period > 4 ? `OT${a.period - 4}` : `Q${a.period}`,
      team: a.teamTricode || "",
      tag: "3PT",
      text: (a.description || "").replace(/\s+/g, " ").trim(),
      awayScore: a.scoreAway ?? "",
      homeScore: a.scoreHome ?? "",
    }));

  // Player of the Game / Top Performers — ranked by points, the classic and
  // always-computable "who had the best game" metric for basketball.
  const playerRows = rowsOf(rsByName(box, "PlayerStats")).filter((r) => r.MIN != null);
  const ranked = [...playerRows].sort((a, b) => (b.PTS || 0) - (a.PTS || 0));
  function playerCard(r) {
    const parts = [`${r.PTS} PTS`];
    if (r.REB) parts.push(`${r.REB} REB`);
    if (r.AST) parts.push(`${r.AST} AST`);
    if (r.STL) parts.push(`${r.STL} STL`);
    if (r.BLK) parts.push(`${r.BLK} BLK`);
    return {
      name: r.PLAYER_NAME || "",
      team: r.TEAM_ABBREVIATION || "",
      headshot: headshotUrl(r.PLAYER_ID),
      summary: parts.join(", "),
    };
  }
  const playerOfGame = ranked.length ? playerCard(ranked[0]) : null;
  const topPerformers = ranked.slice(1, 4).map(playerCard);

  return { score, innings: quarters, totals: { awayR: score.awayScore, homeR: score.homeScore }, scoringPlays, teamStats, playerOfGame, topPerformers };
}

exports.handler = async (event) => {
  const { date, home, away } = event.queryStringParameters || {};
  if (!date || !home || !away) return err(400, "date, home, and away are required");

  try {
    const gameId = await findGameId(date, home.toUpperCase(), away.toUpperCase());
    if (!gameId) return err(404, `No NBA game found for ${date} (${away} @ ${home})`);
    const data = await fetchGameData(gameId, home.toUpperCase(), away.toUpperCase());
    return ok({ gameId, ...data });
  } catch (e) {
    return err(500, e.message);
  }
};
