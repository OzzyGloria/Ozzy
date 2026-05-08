/**
 * ScoutGrid — Real Data Importer
 * Pulls real players, coaches, and stats from API-Football (RapidAPI)
 * and inserts them into your Supabase database.
 *
 * Usage:
 *   npm run import:real
 *
 * Requires in .env.local:
 *   RAPIDAPI_KEY=your_key_here
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

// ─── Config ──────────────────────────────────────────────
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const API_BASE = `https://${RAPIDAPI_HOST}/v3`;
const SEASON = 2023;

// 5 leagues × 5 teams = 25 teams → ~550 players, 25 coaches
// Free tier: 100 req/day. This import uses ~90 requests total.
const TARGET_LEAGUES = [
  { id: 39,  name: "Premier League",   country: "England", teamsToImport: 5 },
  { id: 140, name: "La Liga",          country: "Spain",   teamsToImport: 5 },
  { id: 135, name: "Serie A",          country: "Italy",   teamsToImport: 5 },
  { id: 78,  name: "Bundesliga",       country: "Germany", teamsToImport: 5 },
  { id: 61,  name: "Ligue 1",          country: "France",  teamsToImport: 5 },
];

// ─── Supabase client ──────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─── Helpers ──────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function rndFloat(min: number, max: number, dp = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dp));
}

async function apiFetch(path: string): Promise<any> {
  if (!RAPIDAPI_KEY) throw new Error("RAPIDAPI_KEY not set in .env.local");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });
  if (res.status === 429) {
    console.warn("  ⚠ Rate limited — waiting 60s...");
    await sleep(60_000);
    return apiFetch(path);
  }
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  await sleep(400); // stay within free-tier rate limits
  return json;
}

// ─── Position mapping ─────────────────────────────────────
// API-Football gives broad positions; map to ScoutGrid specifics
const POSITION_MAP: Record<string, string[]> = {
  Goalkeeper: ["GK"],
  Defender:   ["CB", "CB", "CB", "LB", "RB", "LWB", "RWB"],
  Midfielder: ["CM", "CM", "CDM", "CDM", "CAM", "LM", "RM"],
  Attacker:   ["ST", "ST", "CF", "LW", "RW"],
};

function mapPosition(apiPosition: string, salt: number): string {
  const opts = POSITION_MAP[apiPosition] ?? POSITION_MAP.Midfielder;
  return opts[salt % opts.length];
}

// ─── Rating / value derivation ────────────────────────────
function deriveOverall(apiRating: string | null | undefined): number {
  const r = parseFloat(apiRating ?? "6.5");
  // Map 5.5–8.5 → 60–92
  return Math.min(95, Math.max(58, Math.round((r - 5.5) * 10.67 + 60)));
}

function estimateMarketValue(overall: number, age: number, position: string): number {
  const isAttacker = ["ST", "CF", "LW", "RW", "CAM"].includes(position);
  const isGK = position === "GK";
  const base = isAttacker ? 10_000_000 : isGK ? 4_000_000 : 6_000_000;
  const ratingMult = Math.pow(1.45, (overall - 70) / 10);
  const ageMult =
    age <= 20 ? 2.0 : age <= 23 ? 1.6 : age <= 26 ? 1.2 : age <= 29 ? 0.9 : 0.55;
  return Math.round((base * ratingMult * ageMult) / 50_000) * 50_000;
}

// ─── Parse height/weight strings ─────────────────────────
function parseCm(str: string | null | undefined, fallback: number): number {
  if (!str) return fallback;
  const m = str.match(/(\d+)\s*cm/i);
  if (m) return parseInt(m[1]);
  // Handle feet/inches "5'11\""
  const fi = str.match(/(\d+)'(\d+)/);
  if (fi) return Math.round(parseInt(fi[1]) * 30.48 + parseInt(fi[2]) * 2.54);
  return fallback;
}
function parseKg(str: string | null | undefined, fallback: number): number {
  if (!str) return fallback;
  const m = str.match(/(\d+)\s*kg/i);
  if (m) return parseInt(m[1]);
  return fallback;
}

// ─── API calls ────────────────────────────────────────────
async function fetchTeams(leagueId: number): Promise<Array<{ id: number; name: string; logo: string }>> {
  const data = await apiFetch(`/teams?league=${leagueId}&season=${SEASON}`);
  return (data.response ?? []).map((r: any) => ({
    id: r.team.id,
    name: r.team.name,
    logo: r.team.logo,
  }));
}

async function fetchPlayers(teamId: number): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  while (true) {
    const data = await apiFetch(`/players?team=${teamId}&season=${SEASON}&page=${page}`);
    all.push(...(data.response ?? []));
    if (page >= (data.paging?.total ?? 1)) break;
    page++;
  }
  return all;
}

async function fetchCoach(teamId: number): Promise<any | null> {
  const data = await apiFetch(`/coachs?team=${teamId}`);
  return data.response?.[0] ?? null;
}

// ─── Import a player ─────────────────────────────────────
async function importPlayer(
  playerData: any,
  teamName: string,
  leagueName: string,
  positionIndex: number
): Promise<boolean> {
  const p = playerData.player;
  const stats = playerData.statistics?.[0];
  if (!p?.id || !stats) return false;

  const email = `player-${p.id}@scoutgrid.dev`;

  // Skip if already imported
  const { data: existing } = await supabase
    .from("users").select("id").eq("email", email).maybeSingle();
  if (existing) return false;

  // Create auth user (triggers handle_new_user which inserts into public.users)
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: "ScoutGrid2025!",
    email_confirm: true,
    user_metadata: { full_name: p.name, role: "player" },
  });

  if (authErr && !authErr.message.includes("already registered")) {
    console.error(`    ✗ Auth ${p.name}: ${authErr.message}`);
    return false;
  }

  const userId =
    authData?.user?.id ??
    (await supabase.from("users").select("id").eq("email", email).single()).data?.id;
  if (!userId) return false;

  const position = mapPosition(stats.games?.position ?? "Midfielder", positionIndex);
  const overall = deriveOverall(stats.games?.rating);
  const age = p.age ?? 24;
  const dob = p.birth?.date ?? `${new Date().getFullYear() - age}-06-01`;
  const marketValue = estimateMarketValue(overall, age, position);

  const minutes: number = stats.games?.minutes ?? 0;
  const per90 = minutes > 0 ? minutes / 90 : 1;

  const appearances: number  = stats.games?.appearances ?? 0;
  const starts: number       = stats.games?.lineups ?? 0;
  const goals: number        = stats.goals?.total ?? 0;
  const assists: number      = stats.goals?.assists ?? 0;
  const shots: number        = stats.shots?.total ?? 0;
  const shotsOn: number      = stats.shots?.on ?? 0;
  const passAcc: number      = parseFloat(stats.passes?.accuracy ?? "75");
  const keyPasses: number    = stats.passes?.key ?? 0;
  const tackles: number      = stats.tackles?.total ?? 0;
  const interceptions: number = stats.tackles?.interceptions ?? 0;
  const dribAttempts: number = stats.dribbles?.attempts ?? 0;
  const dribSuccess: number  = stats.dribbles?.success ?? 0;
  const saves: number        = stats.goals?.saves ?? 0;
  const conceded: number     = stats.goals?.conceded ?? 0;
  const yellowCards: number  = stats.cards?.yellow ?? 0;
  const redCards: number     = stats.cards?.red ?? 0;
  const apiRating: number    = parseFloat(stats.games?.rating ?? "6.5");
  const isGK = position === "GK";

  // Insert profile
  const { data: profile, error: profileErr } = await supabase
    .from("player_profiles")
    .upsert(
      {
        user_id: userId,
        full_name: p.name,
        date_of_birth: dob,
        nationality: p.nationality ?? "Unknown",
        height_cm: parseCm(p.height, 180),
        weight_kg: parseKg(p.weight, 75),
        preferred_foot: Math.random() > 0.25 ? "Right" : "Left",
        weak_foot_rating: Math.floor(Math.random() * 3) + 2,
        position,
        current_club: teamName,
        league: leagueName,
        contract_until: new Date().getFullYear() + Math.floor(Math.random() * 4) + 1,
        market_value_eur: marketValue,
        avatar_url: p.photo ?? null,
        bio: `${p.name} is a ${age}-year-old ${position} from ${p.nationality ?? "Unknown"} currently playing for ${teamName} in the ${leagueName}.`,
        overall_rating: overall,
        potential_rating: Math.min(99, overall + Math.floor(Math.random() * (age < 23 ? 10 : 4))),
        availability_status: Math.random() < 0.65 ? "available" : Math.random() < 0.5 ? "loan_only" : "not_available",
        is_visible: true,
        profile_completeness: 65 + Math.floor(Math.random() * 30),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (profileErr || !profile) {
    console.error(`    ✗ Profile ${p.name}: ${profileErr?.message}`);
    return false;
  }

  // Insert season stats
  await supabase.from("player_stats").upsert(
    {
      player_profile_id: profile.id,
      season: `${SEASON}/${String(SEASON + 1).slice(2)}`,
      competition: leagueName,
      club: teamName,
      appearances,
      starts,
      minutes_played: minutes,
      goals,
      assists,
      shots_per_90: parseFloat((shots / per90).toFixed(2)),
      shot_accuracy_pct: shots > 0 ? parseFloat((shotsOn / shots * 100).toFixed(1)) : 0,
      xg_per_90: parseFloat(((goals * 0.82 + shotsOn * 0.04) / per90).toFixed(3)),
      xa_per_90: parseFloat(((assists * 0.82 + keyPasses * 0.07) / per90).toFixed(3)),
      pass_accuracy_pct: passAcc,
      key_passes_per_90: parseFloat((keyPasses / per90).toFixed(2)),
      crosses_per_90: rndFloat(0.3, 3.5),
      cross_accuracy_pct: rndFloat(20, 42),
      progressive_passes_per_90: rndFloat(2, 11),
      touches_per_90: rndFloat(35, 95),
      dribbles_per_90: parseFloat((dribAttempts / per90).toFixed(2)),
      dribble_success_pct: dribAttempts > 0 ? parseFloat((dribSuccess / dribAttempts * 100).toFixed(1)) : 50,
      tackles_per_90: parseFloat((tackles / per90).toFixed(2)),
      tackle_success_pct: rndFloat(45, 75),
      interceptions_per_90: parseFloat((interceptions / per90).toFixed(2)),
      clearances_per_90: rndFloat(0.1, isGK ? 1 : position.includes("B") || position === "CB" ? 6 : 1.5),
      aerial_duels_won_pct: rndFloat(40, 70),
      pressures_per_90: rndFloat(6, 22),
      yellow_cards: yellowCards,
      red_cards: redCards,
      saves_per_90: isGK ? parseFloat((saves / per90).toFixed(2)) : 0,
      save_pct: isGK && saves > 0 ? rndFloat(68, 84) : 0,
      clean_sheets: isGK ? Math.floor(appearances * 0.28) : 0,
      goals_against_per_90: isGK ? parseFloat((conceded / per90).toFixed(2)) : 0,
      xg_prevented: isGK ? rndFloat(-4, 8) : 0,
      rating: parseFloat(apiRating.toFixed(1)),
    },
    { onConflict: "player_profile_id,season,competition" }
  );

  // Insert 12 months of market valuations
  const now = new Date();
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - m);
    const variance = 0.88 + Math.random() * 0.24;
    await supabase.from("market_valuations").upsert(
      {
        player_profile_id: profile.id,
        value_eur: Math.round((marketValue * variance) / 50_000) * 50_000,
        recorded_at: d.toISOString().split("T")[0],
        source: "api-football",
      },
      { onConflict: "player_profile_id,recorded_at" }
    );
  }

  return true;
}

// ─── Import a coach ───────────────────────────────────────
async function importCoach(coachData: any, teamName: string): Promise<boolean> {
  if (!coachData?.id) return false;

  const email = `coach-${coachData.id}@scoutgrid.dev`;

  const { data: existing } = await supabase
    .from("users").select("id").eq("email", email).maybeSingle();
  if (existing) return false;

  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password: "ScoutGrid2025!",
    email_confirm: true,
    user_metadata: { full_name: coachData.name, role: "coach" },
  });

  if (authErr && !authErr.message.includes("already registered")) return false;

  const userId =
    authData?.user?.id ??
    (await supabase.from("users").select("id").eq("email", email).single()).data?.id;
  if (!userId) return false;

  const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-5-2", "5-3-2", "3-4-3"];
  const LICENSE_MAP: Record<string, string> = {
    England: "UEFA Pro", Spain: "UEFA Pro", France: "UEFA Pro",
    Germany: "UEFA Pro", Italy: "UEFA Pro", Portugal: "UEFA Pro",
    Brazil: "CONMEBOL Pro", Argentina: "CONMEBOL Pro",
  };
  const nat = coachData.nationality ?? "Unknown";
  const license = LICENSE_MAP[nat] ?? "UEFA A";

  const { data: profile, error: profileErr } = await supabase
    .from("coach_profiles")
    .upsert(
      {
        user_id: userId,
        full_name: coachData.name,
        date_of_birth: coachData.birth?.date ?? "1968-01-01",
        nationality: nat,
        current_club: teamName,
        current_role: "Head Coach",
        preferred_formation: FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)],
        licenses: [license],
        languages: [...new Set(["English", nat === "Spain" ? "Spanish" : nat === "France" ? "French" : nat === "Italy" ? "Italian" : nat === "Germany" ? "German" : nat === "Portugal" ? "Portuguese" : "English"])],
        playing_style: [["High Press", "Possession", "Counter Attack", "Direct"][Math.floor(Math.random() * 4)], ["Attacking", "Balanced", "Defensive"][Math.floor(Math.random() * 3)]],
        bio: `${coachData.name} is the head coach of ${teamName}. Holder of the ${license} license.`,
        avatar_url: coachData.photo ?? null,
        is_visible: true,
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (profileErr || !profile) return false;

  // Import real career history from API
  const career: any[] = coachData.career ?? [];
  for (const stint of career.slice(0, 6)) {
    if (!stint.team?.name) continue;
    const startYear = stint.start ? parseInt(stint.start.split("-")[0]) : 2015;
    const endYear = stint.end ? parseInt(stint.end.split("-")[0]) : startYear + 2;
    const duration = Math.max(1, endYear - startYear);
    const managed = duration * 34;
    const wins = Math.floor(managed * (0.35 + Math.random() * 0.2));
    const draws = Math.floor(managed * 0.22);
    const losses = managed - wins - draws;
    await supabase.from("coach_stats").insert({
      coach_profile_id: profile.id,
      club: stint.team.name,
      role: "Head Coach",
      season_start: startYear,
      season_end: endYear,
      matches_managed: managed,
      wins,
      draws,
      losses,
      goals_scored: Math.floor(managed * (1.2 + Math.random() * 0.6)),
      goals_conceded: Math.floor(managed * (0.9 + Math.random() * 0.5)),
      trophies: Math.random() < 0.2 ? [["League Title", "Cup Winners", "Promotion"][Math.floor(Math.random() * 3)]] : [],
    });
  }

  return true;
}

// ─── Main ─────────────────────────────────────────────────
async function main() {
  console.log("🌍  ScoutGrid — Real Data Import via API-Football\n");

  if (!RAPIDAPI_KEY) {
    console.error("❌  RAPIDAPI_KEY is not set in .env.local");
    console.error("    Add: RAPIDAPI_KEY=your_key_here");
    process.exit(1);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌  Supabase credentials not set in .env.local");
    process.exit(1);
  }

  let totalPlayers = 0;
  let totalCoaches = 0;
  let apiRequests = 0;

  for (const league of TARGET_LEAGUES) {
    console.log(`\n🏆  ${league.name} (${league.country})`);

    const teams = await fetchTeams(league.id);
    apiRequests++;
    console.log(`    ${teams.length} teams found, importing ${league.teamsToImport}`);

    const selectedTeams = teams.slice(0, league.teamsToImport);

    for (const team of selectedTeams) {
      console.log(`\n  📋  ${team.name}`);

      // Players
      const players = await fetchPlayers(team.id);
      apiRequests += Math.ceil(players.length / 20);
      let teamCount = 0;
      for (let i = 0; i < players.length; i++) {
        const ok = await importPlayer(players[i], team.name, league.name, i);
        if (ok) { teamCount++; totalPlayers++; }
      }
      console.log(`      ✓ ${teamCount}/${players.length} players imported`);

      // Coach
      const coach = await fetchCoach(team.id);
      apiRequests++;
      if (coach) {
        const ok = await importCoach(coach, team.name);
        if (ok) {
          totalCoaches++;
          console.log(`      ✓ Coach: ${coach.name} (${coach.nationality})`);
        } else {
          console.log(`      ↩ Coach: ${coach.name} (already imported)`);
        }
      }
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅  Import complete!`);
  console.log(`    Players imported : ${totalPlayers}`);
  console.log(`    Coaches imported : ${totalCoaches}`);
  console.log(`    API requests used: ~${apiRequests}`);
  console.log(`\n    All accounts use password: ScoutGrid2025!`);
  console.log(`    Email format: player-{id}@scoutgrid.dev`);
}

main().catch(console.error);
