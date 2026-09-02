// /.netlify/functions/espn-mlb-game
// Proxies ESPN's MLB API server-side (no CORS issues) for the Other Sports
// baseball game-detail panel. Called by the frontend as:
//   /.netlify/functions/espn-mlb-game?date=YYYYMMDD&home=SD&away=CHC
// "home"/"away" are our own MLB_TEAMS abbreviations (see other-sports/js/app.js);
// ESPN_ABBR_OVERRIDES below translates the handful that differ from ESPN's own.

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=300",
};

function ok(body)  { return { statusCode: 200, headers: HEADERS, body: JSON.stringify(body) }; }
function err(code, msg) { return { statusCode: code, headers: HEADERS, body: JSON.stringify({ error: msg }) }; }

// A few of our abbreviations differ from ESPN's scoreboard/logo slugs.
const ESPN_ABBR_OVERRIDES = { CWS: "chw", OAK: "ath" };
function espnAbbr(abbr) { return (ESPN_ABBR_OVERRIDES[abbr] || abbr || "").toLowerCase(); }

async function findEventId(date, homeAbbr, awayAbbr) {
  const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${date}`);
  if (!r.ok) return null;
  const sb = await r.json();
  const wantHome = espnAbbr(homeAbbr), wantAway = espnAbbr(awayAbbr);

  let partial = null;
  for (const ev of (sb.events || [])) {
    const comp = ev.competitions?.[0];
    const abbrs = (comp?.competitors || []).map((c) => (c.team?.abbreviation || "").toLowerCase());
    if (abbrs.includes(wantHome) && abbrs.includes(wantAway)) return String(ev.id);
    if (!partial && (abbrs.includes(wantHome) || abbrs.includes(wantAway))) partial = String(ev.id);
  }
  return partial;
}

function inningLabel(period) {
  const n = period?.number;
  const half = period?.type === "Bottom" ? "B" : "T";
  return n ? `${half}${n}` : "";
}

async function fetchGameData(eventId) {
  const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${eventId}`);
  if (!r.ok) throw new Error(`ESPN summary error: ${r.status}`);
  const raw = await r.json();

  const comp = raw.header?.competitions?.[0] || {};
  const competitors = comp.competitors || [];
  const awayC = competitors.find((c) => c.homeAway === "away") || competitors[0] || {};
  const homeC = competitors.find((c) => c.homeAway === "home") || competitors[1] || {};

  const score = {
    awayAbbr: awayC.team?.abbreviation || "",
    homeAbbr: homeC.team?.abbreviation || "",
    awayScore: awayC.score ?? "",
    homeScore: homeC.score ?? "",
    status: comp.status?.type?.shortDetail || "Final",
  };

  const teamIdToSide = {};
  if (awayC.team?.id) teamIdToSide[awayC.team.id] = "away";
  if (homeC.team?.id) teamIdToSide[homeC.team.id] = "home";
  const teamIdToAbbr = {};
  if (awayC.team?.id) teamIdToAbbr[awayC.team.id] = score.awayAbbr;
  if (homeC.team?.id) teamIdToAbbr[homeC.team.id] = score.homeAbbr;

  // Innings — per-competitor linescores: [{displayValue, hits, errors}, ...]
  const awayLs = awayC.linescores || [];
  const homeLs = homeC.linescores || [];
  const inningCount = Math.max(awayLs.length, homeLs.length);
  const innings = [];
  for (let i = 0; i < inningCount; i++) {
    innings.push({
      label: String(i + 1),
      away: awayLs[i]?.displayValue ?? "",
      home: homeLs[i]?.displayValue ?? "",
    });
  }
  const sumField = (ls, field) => ls.reduce((s, p) => s + (Number(p[field]) || 0), 0);
  const totals = {
    awayR: score.awayScore, homeR: score.homeScore,
    awayH: sumField(awayLs, "hits"), homeH: sumField(homeLs, "hits"),
    awayE: sumField(awayLs, "errors"), homeE: sumField(homeLs, "errors"),
  };

  // Scoring plays
  const scoringPlays = (raw.plays || [])
    .filter((p) => p.scoringPlay)
    .map((p) => ({
      inning: inningLabel(p.period),
      inningLong: p.period?.displayValue || "",
      team: teamIdToAbbr[p.team?.id] || "",
      tag: p.alternativeType?.text || "",
      text: p.text || "",
      awayScore: p.awayScore ?? "",
      homeScore: p.homeScore ?? "",
    }));

  // Team stats — boxscore.teams[].statistics is grouped by category (batting/
  // pitching/fielding), each holding its own flat stats array keyed by name.
  const boxTeams = raw.boxscore?.teams || [];
  const awayBT = boxTeams.find((t) => t.homeAway === "away") || boxTeams[0] || {};
  const homeBT = boxTeams.find((t) => t.homeAway === "home") || boxTeams[1] || {};
  function groupStat(team, group, name) {
    const g = (team.statistics || []).find((x) => x.name === group);
    const s = (g?.stats || []).find((x) => x.name === name);
    return s ? s.displayValue : null;
  }
  const STAT_DEFS = [
    { group: "batting", name: "hits", label: "Hits" },
    { group: "batting", name: "homeRuns", label: "Home Runs" },
    { group: "batting", name: "walks", label: "Walks" },
    { group: "batting", name: "strikeouts", label: "Strikeouts" },
    { group: "batting", name: "runnersLeftOnBase", label: "Left On Base" },
    { group: "fielding", name: "errors", label: "Errors" },
  ];
  const teamStats = STAT_DEFS.map(({ group, name, label }) => {
    const away = groupStat(awayBT, group, name);
    const home = groupStat(homeBT, group, name);
    return away != null && home != null ? { label, away, home } : null;
  }).filter(Boolean);

  // "Stars" — MLB's natural equivalent is the game's pitching decisions
  // (winning/losing/saving pitcher), surfaced by ESPN as featuredAthletes.
  const ROLE_ORDER = { winningPitcher: 1, losingPitcher: 2, savingPitcher: 3 };
  const ROLE_LABEL = { winningPitcher: "Win", losingPitcher: "Loss", savingPitcher: "Save" };
  const stars = (comp.status?.featuredAthletes || [])
    .filter((fa) => ROLE_ORDER[fa.name])
    .map((fa) => {
      const ath = fa.athlete || {};
      const statParts = [];
      if (ath.record) statParts.push({ label: "Record", value: ath.record });
      if (fa.name === "savingPitcher" && ath.saves != null) statParts.push({ label: "SV", value: String(ath.saves) });
      return {
        order: ROLE_ORDER[fa.name],
        role: ROLE_LABEL[fa.name],
        name: ath.fullName || ath.displayName || "",
        team: teamIdToAbbr[fa.team?.id] || fa.team?.abbreviation || "",
        headshot: ath.headshot?.href || "",
        stats: statParts,
      };
    })
    .sort((a, b) => a.order - b.order);

  return { score, innings, totals, scoringPlays, teamStats, stars };
}

exports.handler = async (event) => {
  const { date, home, away } = event.queryStringParameters || {};
  if (!date || !home || !away) return err(400, "date, home, and away are required");

  try {
    const eventId = await findEventId(date, home, away);
    if (!eventId) return err(404, `No MLB game found for ${date} (${away} @ ${home})`);
    const data = await fetchGameData(eventId);
    return ok({ eventId, ...data });
  } catch (e) {
    return err(500, e.message);
  }
};
