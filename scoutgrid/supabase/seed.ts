import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rndFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function logNormalValue(min: number, max: number): number {
  const u = Math.random();
  const val = min * Math.pow(max / min, u * u);
  return Math.round(val / 1000) * 1000;
}

// ─────────────────────────────────────────────────────────
// SEED: MEMBERSHIP PLANS
// ─────────────────────────────────────────────────────────
async function seedPlans() {
  const { count } = await supabase
    .from("membership_plans")
    .select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("  ✓ Plans already seeded");
    return;
  }

  const plans = [
    {
      name: "Free Starter",
      slug: "free",
      role_target: "player_coach",
      price_monthly: 0,
      price_annual: 0,
      features: [
        { label: "Basic profile", available: true },
        { label: "Searchable profile", available: false },
        { label: "Highlight videos", available: false },
        { label: "Stats visible to scouts", available: false },
        { label: "Direct messages", available: false },
      ],
      highlight_limit: 0,
      can_contact_directly: false,
      can_export_reports: false,
      can_upload_highlights: false,
      sort_order: 1,
    },
    {
      name: "Visible",
      slug: "visible",
      role_target: "player_coach",
      price_monthly: 9.99,
      price_annual: 95.9,
      stripe_price_id_monthly: "price_1TUow6JKJsfAsDMJQDnWiLtb",
      features: [
        { label: "Searchable profile", available: true },
        { label: "2 highlight videos", available: true },
        { label: "Stats visible to scouts", available: true },
        { label: "See who viewed your profile", available: true },
        { label: "5 direct messages/month", available: true },
        { label: "Scouting reports visible", available: false },
      ],
      highlight_limit: 2,
      can_contact_directly: true,
      can_export_reports: false,
      can_upload_highlights: true,
      sort_order: 2,
    },
    {
      name: "Pro Athlete",
      slug: "pro_athlete",
      role_target: "player_coach",
      price_monthly: 24.99,
      price_annual: 239.9,
      stripe_price_id_monthly: "price_1TUowkJKJsfAsDMJTAh3tR71",
      features: [
        { label: "All Visible features", available: true },
        { label: "10 highlight videos", available: true },
        { label: "Priority placement in search", available: true },
        { label: "Full profile analytics", available: true },
        { label: "Unlimited direct messages", available: true },
        { label: "Scouting reports visible to you", available: true },
        { label: "Verified badge eligibility", available: true },
      ],
      highlight_limit: 10,
      can_contact_directly: true,
      can_export_reports: false,
      can_upload_highlights: true,
      sort_order: 3,
    },
    {
      name: "Scout Basic",
      slug: "scout_basic",
      role_target: "scout_agent",
      price_monthly: 49.99,
      price_annual: 479.9,
      stripe_price_id_monthly: "price_1TUoxJJKJsfAsDMJOyyfVgSj",
      features: [
        { label: "Search & view 50 profiles/month", available: true },
        { label: "Save searches & filters", available: true },
        { label: "Basic filters", available: true },
        { label: "Write scouting reports", available: true },
        { label: "Advanced filters", available: false },
        { label: "Direct messaging", available: false },
        { label: "Export PDF reports", available: false },
        { label: "Market value history", available: false },
      ],
      max_profile_views_monthly: 50,
      highlight_limit: 0,
      can_contact_directly: false,
      can_export_reports: false,
      can_upload_highlights: false,
      sort_order: 4,
    },
    {
      name: "Scout Pro",
      slug: "scout_pro",
      role_target: "scout_agent",
      price_monthly: 129.99,
      price_annual: 1247.9,
      stripe_price_id_monthly: "price_1TUoxpJKJsfAsDMJPApYPBd7",
      features: [
        { label: "Unlimited profile views", available: true },
        { label: "Advanced filters & metrics", available: true },
        { label: "Write & export scouting reports (PDF)", available: true },
        { label: "Direct messaging", available: true },
        { label: "Market value analytics", available: true },
        { label: "Save unlimited searches", available: true },
        { label: "Priority support", available: true },
      ],
      max_profile_views_monthly: null,
      highlight_limit: 0,
      can_contact_directly: true,
      can_export_reports: true,
      can_upload_highlights: false,
      sort_order: 5,
    },
    {
      name: "Club Elite",
      slug: "club_elite",
      role_target: "club",
      price_monthly: 299.99,
      price_annual: 2879.9,
      stripe_price_id_monthly: "price_1TUoyGJKJsfAsDMJtewQJRuY",
      features: [
        { label: "Everything in Scout Pro", available: true },
        { label: "5 user seats", available: true },
        { label: "Team dashboard", available: true },
        { label: "Transfer room access", available: true },
        { label: "Market value analytics", available: true },
        { label: "API access", available: true },
        { label: "Dedicated account manager", available: true },
      ],
      max_profile_views_monthly: null,
      highlight_limit: 0,
      can_contact_directly: true,
      can_export_reports: true,
      can_upload_highlights: false,
      sort_order: 6,
    },
  ];

  const { error } = await supabase.from("membership_plans").insert(plans as Parameters<typeof supabase.from>[0] extends string ? never : never);
  // Use raw upsert approach
  for (const plan of plans) {
    const { error: e } = await supabase.from("membership_plans").upsert(plan, { onConflict: "slug" });
    if (e) console.error(`  ✗ Plan ${plan.slug}:`, e.message);
  }
  console.log(`  ✓ Seeded ${plans.length} membership plans`);
}

// ─────────────────────────────────────────────────────────
// SEED: PLAYERS (50 profiles)
// ─────────────────────────────────────────────────────────

const PLAYERS_DATA = [
  // GKs (4)
  { name: "Marco Delgado", nationality: "Spain", position: "GK", club: "Atletico Madrid B", league: "Segunda División", age: 22, value: 2_800_000, overall: 74 },
  { name: "Emeka Okafor", nationality: "Nigeria", position: "GK", club: "Sporting CP", league: "Primeira Liga", age: 25, value: 8_500_000, overall: 80 },
  { name: "Baptiste Girard", nationality: "France", position: "GK", club: "Stade de Reims", league: "Ligue 1", age: 28, value: 5_200_000, overall: 77 },
  { name: "Liam O'Brien", nationality: "Ireland", position: "GK", club: "Shamrock Rovers", league: "League of Ireland", age: 20, value: 350_000, overall: 65 },
  // CBs (8)
  { name: "Thiago Mendes", nationality: "Brazil", position: "CB", club: "Flamengo", league: "Brazilian Serie A", age: 24, value: 12_000_000, overall: 82 },
  { name: "Jan Kowalski", nationality: "Poland", position: "CB", club: "Lech Poznań", league: "Ekstraklasa", age: 26, value: 4_100_000, overall: 75 },
  { name: "Amadou Diallo", nationality: "Senegal", position: "CB", club: "Strasbourg", league: "Ligue 1", age: 23, value: 9_500_000, overall: 79 },
  { name: "Kieran Walsh", nationality: "England", position: "CB", club: "Brentford", league: "Premier League", age: 27, value: 18_000_000, overall: 83 },
  { name: "Ivan Petrović", nationality: "Croatia", position: "CB", club: "Dinamo Zagreb", league: "HNL", age: 21, value: 6_800_000, overall: 76 },
  { name: "Yannick Müller", nationality: "Germany", position: "CB", club: "Borussia Mönchengladbach", league: "Bundesliga", age: 29, value: 22_000_000, overall: 85 },
  { name: "Luis Ramos", nationality: "Spain", position: "CB", club: "Real Sociedad", league: "La Liga", age: 25, value: 14_000_000, overall: 81 },
  { name: "Abdou Sarr", nationality: "Senegal", position: "CB", club: "Toulouse", league: "Ligue 1", age: 22, value: 7_200_000, overall: 77 },
  // LBs (4)
  { name: "Facundo López", nationality: "Argentina", position: "LB", club: "River Plate", league: "Argentine Primera División", age: 23, value: 10_500_000, overall: 80 },
  { name: "Olu Adeyemi", nationality: "Nigeria", position: "LB", club: "Standard Liège", league: "Jupiler Pro League", age: 24, value: 5_800_000, overall: 75 },
  { name: "Søren Hansen", nationality: "Denmark", position: "LB", club: "FC Midtjylland", league: "Superliga", age: 26, value: 8_200_000, overall: 78 },
  { name: "Tom Richards", nationality: "England", position: "LB", club: "Birmingham City", league: "Championship", age: 22, value: 3_200_000, overall: 72 },
  // RBs (4)
  { name: "Paulo Ferreira", nationality: "Portugal", position: "RB", club: "Braga", league: "Primeira Liga", age: 25, value: 9_800_000, overall: 79 },
  { name: "Kwame Asante", nationality: "Ghana", position: "RB", club: "Ajax", league: "Eredivisie", age: 20, value: 15_000_000, overall: 82 },
  { name: "Nikola Jovanić", nationality: "Serbia", position: "RB", club: "Crvena zvezda", league: "SuperLiga", age: 27, value: 6_500_000, overall: 76 },
  { name: "Gustav Eriksson", nationality: "Sweden", position: "RB", club: "Malmö FF", league: "Allsvenskan", age: 23, value: 7_100_000, overall: 77 },
  // CDMs (6)
  { name: "Carlos Vega", nationality: "Colombia", position: "CDM", club: "Independiente Medellín", league: "Liga BetPlay", age: 24, value: 4_500_000, overall: 74 },
  { name: "Sofiane Hadj", nationality: "Morocco", position: "CDM", club: "Nice", league: "Ligue 1", age: 26, value: 16_000_000, overall: 82 },
  { name: "Rasmus Berg", nationality: "Denmark", position: "CDM", club: "Bayer Leverkusen", league: "Bundesliga", age: 25, value: 28_000_000, overall: 86 },
  { name: "Kofi Mensah", nationality: "Ghana", position: "CDM", club: "Anderlecht", league: "Jupiler Pro League", age: 22, value: 11_000_000, overall: 79 },
  { name: "Ali Hassan", nationality: "Egypt", position: "CDM", club: "Al Ahly", league: "Egyptian Premier League", age: 28, value: 3_200_000, overall: 75 },
  { name: "Marco Silva", nationality: "Portugal", position: "CDM", club: "FC Porto", league: "Primeira Liga", age: 24, value: 19_000_000, overall: 83 },
  // CMs (8)
  { name: "Pablo Herrero", nationality: "Spain", position: "CM", club: "Valencia", league: "La Liga", age: 23, value: 20_000_000, overall: 83 },
  { name: "Antoine Dupont", nationality: "France", position: "CM", club: "Marseille", league: "Ligue 1", age: 27, value: 35_000_000, overall: 87 },
  { name: "Matteo Ricci", nationality: "Italy", position: "CM", club: "Lazio", league: "Serie A", age: 25, value: 22_000_000, overall: 84 },
  { name: "Connor Byrne", nationality: "Ireland", position: "CM", club: "Nottingham Forest", league: "Premier League", age: 22, value: 12_000_000, overall: 79 },
  { name: "Jakub Novák", nationality: "Poland", position: "CM", club: "Legia Warsaw", league: "Ekstraklasa", age: 26, value: 8_500_000, overall: 77 },
  { name: "Ryuto Yamamoto", nationality: "Japan", position: "CM", club: "Urawa Red Diamonds", league: "J1 League", age: 21, value: 14_000_000, overall: 80 },
  { name: "Diego Sánchez", nationality: "Mexico", position: "CM", club: "Club América", league: "Liga MX", age: 24, value: 9_000_000, overall: 78 },
  { name: "Lukas Bauer", nationality: "Germany", position: "CM", club: "RB Leipzig", league: "Bundesliga", age: 23, value: 42_000_000, overall: 88 },
  // CAMs (6)
  { name: "Gabriel Santos", nationality: "Brazil", position: "CAM", club: "São Paulo", league: "Brazilian Serie A", age: 22, value: 18_000_000, overall: 83 },
  { name: "Nacer Belkacem", nationality: "Morocco", position: "CAM", club: "PSG", league: "Ligue 1", age: 20, value: 55_000_000, overall: 89 },
  { name: "Luca Romani", nationality: "Italy", position: "CAM", club: "Milan", league: "Serie A", age: 26, value: 65_000_000, overall: 90 },
  { name: "Alejandro Cruz", nationality: "Argentina", position: "CAM", club: "Boca Juniors", league: "Argentine Primera División", age: 24, value: 28_000_000, overall: 85 },
  { name: "Moon Ji-sung", nationality: "South Korea", position: "CAM", club: "Jeonbuk Hyundai", league: "K League 1", age: 23, value: 20_000_000, overall: 82 },
  { name: "Pieter De Vries", nationality: "Netherlands", position: "CAM", club: "PSV", league: "Eredivisie", age: 25, value: 38_000_000, overall: 87 },
  // LWs (3)
  { name: "Ousmane Fall", nationality: "Senegal", position: "LW", club: "Lyon", league: "Ligue 1", age: 21, value: 32_000_000, overall: 85 },
  { name: "Marcus Jones", nationality: "England", position: "LW", club: "Arsenal", league: "Premier League", age: 23, value: 68_000_000, overall: 88 },
  { name: "Ciro Moreno", nationality: "Colombia", position: "LW", club: "Atlético Nacional", league: "Liga BetPlay", age: 20, value: 8_500_000, overall: 76 },
  // RWs (3)
  { name: "Pedro Alves", nationality: "Brazil", position: "RW", club: "Benfica", league: "Primeira Liga", age: 24, value: 45_000_000, overall: 88 },
  { name: "Enzo Rousseau", nationality: "France", position: "RW", club: "Monaco", league: "Ligue 1", age: 22, value: 30_000_000, overall: 84 },
  { name: "Yaw Mensah", nationality: "Ghana", position: "RW", club: "Feyenoord", league: "Eredivisie", age: 21, value: 25_000_000, overall: 83 },
  // STs (3)
  { name: "Roberto Fuentes", nationality: "Spain", position: "ST", club: "Athletic Club", league: "La Liga", age: 26, value: 52_000_000, overall: 89 },
  { name: "Kwabena Darko", nationality: "Ghana", position: "ST", club: "Borussia Dortmund", league: "Bundesliga", age: 24, value: 80_000_000, overall: 92 },
  { name: "Diego Montoya", nationality: "Argentina", position: "ST", club: "Internazionale", league: "Serie A", age: 27, value: 75_000_000, overall: 91 },
  // CFs (3)
  { name: "Samir Achour", nationality: "Belgium", position: "CF", club: "Club Brugge", league: "Jupiler Pro League", age: 25, value: 18_000_000, overall: 82 },
  { name: "Tom Burke", nationality: "Scotland", position: "CF", club: "Celtic", league: "Scottish Premiership", age: 23, value: 12_000_000, overall: 79 },
  { name: "Mehmet Yilmaz", nationality: "Turkey", position: "CF", club: "Galatasaray", league: "Süper Lig", age: 28, value: 9_500_000, overall: 78 },
];

const PREFERRED_FOOT = ["Left", "Right", "Right", "Right", "Both"] as const;
const AVAILABILITY = ["available", "available", "available", "not_available", "loan_only"] as const;

function generatePlayerStats(position: string, season: string) {
  const isGK = position === "GK";
  const isDF = ["CB", "LB", "RB", "LWB", "RWB", "CDM"].includes(position);
  const isMF = ["CM", "CAM", "LM", "RM"].includes(position);
  const isATT = ["LW", "RW", "CF", "ST"].includes(position);

  const appearances = rnd(isGK ? 20 : 18, 38);
  const starts = rnd(appearances - 5, appearances);
  const minutes = starts * rnd(75, 90) + (appearances - starts) * rnd(20, 45);

  return {
    season,
    appearances,
    starts,
    minutes_played: minutes,
    goals: isGK ? 0 : isDF ? rnd(0, 3) : isMF ? rnd(2, 12) : rnd(10, 28),
    assists: isGK ? 0 : isDF ? rnd(0, 4) : isMF ? rnd(3, 15) : rnd(3, 14),
    shots_per_90: isGK ? 0 : isDF ? rndFloat(0.2, 1.2) : isMF ? rndFloat(1.0, 2.5) : rndFloat(2.5, 4.5),
    shot_accuracy_pct: isGK ? 0 : rndFloat(30, 70),
    xg_per_90: isGK ? 0 : isDF ? rndFloat(0.02, 0.15) : isMF ? rndFloat(0.1, 0.35) : rndFloat(0.3, 0.7),
    dribbles_per_90: isGK ? 0 : isDF ? rndFloat(0.5, 1.5) : isMF ? rndFloat(1.0, 3.0) : rndFloat(2.0, 5.0),
    dribble_success_pct: isGK ? 0 : rndFloat(45, 75),
    touches_per_90: isGK ? rndFloat(30, 55) : isDF ? rndFloat(55, 80) : isMF ? rndFloat(65, 95) : rndFloat(40, 70),
    pass_accuracy_pct: isGK ? rndFloat(55, 80) : isDF ? rndFloat(78, 92) : isMF ? rndFloat(82, 94) : rndFloat(72, 88),
    key_passes_per_90: isGK ? 0 : isDF ? rndFloat(0.2, 0.8) : isMF ? rndFloat(0.8, 2.5) : rndFloat(0.5, 2.0),
    crosses_per_90: isGK ? 0 : isDF ? rndFloat(0.5, 2.5) : isMF ? rndFloat(0.5, 2.0) : rndFloat(1.0, 3.5),
    cross_accuracy_pct: isGK ? 0 : rndFloat(20, 45),
    progressive_passes_per_90: isGK ? 0 : isDF ? rndFloat(2, 8) : isMF ? rndFloat(5, 12) : rndFloat(2, 7),
    xa_per_90: isGK ? 0 : isDF ? rndFloat(0.01, 0.1) : isMF ? rndFloat(0.05, 0.25) : rndFloat(0.08, 0.3),
    tackles_per_90: isGK ? 0 : isDF ? rndFloat(1.5, 4.0) : isMF ? rndFloat(1.0, 3.0) : rndFloat(0.3, 1.5),
    tackle_success_pct: isGK ? 0 : rndFloat(45, 75),
    interceptions_per_90: isGK ? 0 : isDF ? rndFloat(1.0, 3.5) : isMF ? rndFloat(0.5, 2.0) : rndFloat(0.2, 1.0),
    clearances_per_90: isGK ? rndFloat(0.5, 2.0) : isDF ? rndFloat(3.0, 8.0) : isMF ? rndFloat(0.5, 2.0) : rndFloat(0.1, 0.8),
    aerial_duels_won_pct: rndFloat(40, 70),
    pressures_per_90: isGK ? 0 : isDF ? rndFloat(5, 15) : isMF ? rndFloat(10, 25) : isATT ? rndFloat(8, 20) : rndFloat(5, 15),
    yellow_cards: rnd(0, isDF ? 7 : 5),
    red_cards: Math.random() < 0.1 ? 1 : 0,
    saves_per_90: isGK ? rndFloat(2.5, 5.5) : 0,
    save_pct: isGK ? rndFloat(65, 82) : 0,
    clean_sheets: isGK ? rnd(5, 18) : 0,
    goals_against_per_90: isGK ? rndFloat(0.8, 1.8) : 0,
    xg_prevented: isGK ? rndFloat(-3, 8) : 0,
    rating: rndFloat(6.2, 8.5),
  };
}

async function seedPlayers() {
  const { count } = await supabase
    .from("player_profiles")
    .select("*", { count: "exact", head: true });
  if (count && count > 10) {
    console.log("  ✓ Players already seeded");
    return;
  }

  let seeded = 0;
  for (const player of PLAYERS_DATA) {
    // Create auth user
    const email = `${player.name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "")}.player@scoutgrid.dev`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: "ScoutGrid2025!",
      email_confirm: true,
      user_metadata: { full_name: player.name, role: "player" },
    });

    if (authError && !authError.message.includes("already registered")) {
      console.error(`  ✗ Auth user ${player.name}:`, authError.message);
      continue;
    }

    const userId = authData?.user?.id;
    if (!userId) {
      // User might already exist - look up by email
      const { data: existingUsers } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();
      if (!existingUsers) continue;
    }

    const actualUserId = userId || (await supabase.from("users").select("id").eq("email", email).single()).data?.id;
    if (!actualUserId) continue;

    // Update subscription status for a realistic data set (30% have paid)
    const hasPaidPlan = Math.random() < 0.3;
    if (hasPaidPlan) {
      await supabase.from("users").update({
        subscription_status: "active",
        current_plan_slug: pick(["visible", "pro_athlete"]),
      }).eq("id", actualUserId);
    }

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - player.age);
    dob.setMonth(rnd(0, 11));
    dob.setDate(rnd(1, 28));

    // Insert player profile
    const { data: profile, error: profileError } = await supabase
      .from("player_profiles")
      .upsert({
        user_id: actualUserId,
        full_name: player.name,
        date_of_birth: dob.toISOString().split("T")[0],
        nationality: player.nationality,
        height_cm: rnd(168, 198),
        weight_kg: rnd(68, 96),
        preferred_foot: pick(PREFERRED_FOOT) as "Left" | "Right" | "Both",
        weak_foot_rating: rnd(1, 5),
        position: player.position,
        current_club: player.club,
        league: player.league,
        contract_until: new Date().getFullYear() + rnd(0, 4),
        market_value_eur: player.value,
        bio: `${player.name} is a ${player.age}-year-old ${player.position} from ${player.nationality} playing for ${player.club}. Known for technical ability and consistent performances.`,
        overall_rating: player.overall,
        potential_rating: Math.min(99, player.overall + rnd(0, 8)),
        availability_status: pick(AVAILABILITY) as "available" | "not_available" | "loan_only",
        is_visible: true,
        profile_completeness: rnd(55, 95),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (profileError) {
      console.error(`  ✗ Profile ${player.name}:`, profileError.message);
      continue;
    }

    const profileId = profile.id;

    // Seed stats for 3 seasons
    const seasons = ["2022/23", "2023/24", "2024/25"];
    for (const season of seasons) {
      const stats = generatePlayerStats(player.position, season);
      await supabase.from("player_stats").upsert({
        player_profile_id: profileId,
        club: player.club,
        competition: pick([player.league, "Cup", "Champions League/Continental"]),
        ...stats,
      }, { onConflict: "player_profile_id,season,competition" });
    }

    // Seed market valuations (12 monthly data points)
    const baseValue = player.value;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    for (let m = 0; m < 12; m++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + m);
      const variance = 0.85 + Math.random() * 0.3; // ±15%
      const monthValue = Math.round((baseValue * variance) / 1000) * 1000;
      await supabase.from("market_valuations").upsert({
        player_profile_id: profileId,
        value_eur: monthValue,
        recorded_at: d.toISOString().split("T")[0],
        source: "auto",
      }, { onConflict: "player_profile_id,recorded_at" });
    }

    seeded++;
  }

  console.log(`  ✓ Seeded ${seeded} player profiles`);
}

// ─────────────────────────────────────────────────────────
// SEED: COACHES (10 profiles)
// ─────────────────────────────────────────────────────────

const COACHES_DATA = [
  { name: "Roberto Antonucci", nationality: "Italy", club: "Parma", role: "Head Coach", formation: "4-3-3", licenses: ["UEFA Pro"] },
  { name: "Carlos Ruiz", nationality: "Spain", club: "Celta Vigo B", role: "Head Coach", formation: "4-2-3-1", licenses: ["UEFA A"] },
  { name: "Henrik Svensson", nationality: "Sweden", club: "AIK", role: "Head Coach", formation: "4-4-2", licenses: ["UEFA Pro"] },
  { name: "Kweku Amponsah", nationality: "Ghana", club: "Hearts of Oak", role: "Head Coach", formation: "4-3-3", licenses: ["CAF A"] },
  { name: "Pierre Leblanc", nationality: "France", club: "Troyes", role: "Head Coach", formation: "3-5-2", licenses: ["UEFA Pro"] },
  { name: "André Costa", nationality: "Portugal", club: "Vitória SC", role: "Head Coach", formation: "4-4-2", licenses: ["UEFA A"] },
  { name: "James Collins", nationality: "England", club: "Bradford City", role: "Head Coach", formation: "4-2-3-1", licenses: ["UEFA A"] },
  { name: "Diego Hernández", nationality: "Colombia", club: "Atlético Junior", role: "Head Coach", formation: "4-3-3", licenses: ["CONMEBOL"] },
  { name: "Fumiya Nakamura", nationality: "Japan", club: "Vissel Kobe", role: "Head Coach", formation: "4-4-2", licenses: ["AFC A"] },
  { name: "Tomasz Wiśniewski", nationality: "Poland", club: "Wisła Kraków", role: "Head Coach", formation: "4-2-3-1", licenses: ["UEFA B"] },
];

async function seedCoaches() {
  const { count } = await supabase
    .from("coach_profiles")
    .select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log("  ✓ Coaches already seeded");
    return;
  }

  let seeded = 0;
  for (const coach of COACHES_DATA) {
    const email = `${coach.name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "")}.coach@scoutgrid.dev`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: "ScoutGrid2025!",
      email_confirm: true,
      user_metadata: { full_name: coach.name, role: "coach" },
    });

    if (authError && !authError.message.includes("already registered")) continue;

    const userId = authData?.user?.id ||
      (await supabase.from("users").select("id").eq("email", email).single()).data?.id;
    if (!userId) continue;

    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - rnd(38, 58));
    dob.setMonth(rnd(0, 11));
    dob.setDate(rnd(1, 28));

    const { data: profile, error: profileError } = await supabase
      .from("coach_profiles")
      .upsert({
        user_id: userId,
        full_name: coach.name,
        date_of_birth: dob.toISOString().split("T")[0],
        nationality: coach.nationality,
        current_club: coach.club,
        current_role: coach.role,
        preferred_formation: coach.formation,
        licenses: coach.licenses,
        languages: ["English", coach.nationality === "Spain" ? "Spanish" : coach.nationality === "France" ? "French" : coach.nationality === "Italy" ? "Italian" : coach.nationality === "Portugal" ? "Portuguese" : "English"],
        playing_style: [pick(["High Press", "Counter Attack", "Possession", "Direct"]), pick(["Defensive", "Attacking", "Balanced"])],
        bio: `${coach.name} is an experienced ${coach.role} currently at ${coach.club}. Holder of the ${coach.licenses[0]} license with a preference for the ${coach.formation} formation.`,
        is_visible: true,
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (profileError || !profile) {
      console.error(`  ✗ Coach profile ${coach.name}:`, profileError?.message);
      continue;
    }

    // Seed career history (2-4 previous clubs)
    const prevClubs = rnd(2, 4);
    let year = new Date().getFullYear() - rnd(1, 2);
    for (let i = 0; i < prevClubs; i++) {
      const duration = rnd(1, 4);
      await supabase.from("coach_stats").insert({
        coach_profile_id: profile.id,
        club: pick(["Local FC", "Regional United", "City Athletic", "Town Rangers", "Regional Sports Club"]) + ` (${coach.nationality})`,
        role: i === 0 ? coach.role : pick(["Assistant Coach", "Head Coach", "Youth Coach"]),
        season_start: year - duration,
        season_end: year,
        matches_managed: rnd(30, 100),
        wins: rnd(10, 50),
        draws: rnd(5, 20),
        losses: rnd(5, 30),
        goals_scored: rnd(35, 90),
        goals_conceded: rnd(25, 70),
        trophies: Math.random() < 0.3 ? [pick(["League Title", "Cup Winners", "Promotion"])] : [],
      });
      year -= duration;
    }

    seeded++;
  }

  console.log(`  ✓ Seeded ${seeded} coach profiles`);
}

// ─────────────────────────────────────────────────────────
// SEED: SCOUTS (3 test scouts with active subscriptions)
// ─────────────────────────────────────────────────────────
async function seedScouts() {
  const scouts = [
    { name: "James Morrison", email: "scout.basic@scoutgrid.dev", plan: "scout_basic" },
    { name: "Maria Lopes", email: "scout.pro@scoutgrid.dev", plan: "scout_pro" },
    { name: "Thomas Weber", email: "club.elite@scoutgrid.dev", plan: "club_elite" },
  ];

  for (const scout of scouts) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: scout.email,
      password: "ScoutGrid2025!",
      email_confirm: true,
      user_metadata: { full_name: scout.name, role: "scout" },
    });

    if (authError && !authError.message.includes("already registered")) {
      console.error(`  ✗ Scout ${scout.name}:`, authError.message);
      continue;
    }

    const userId = authData?.user?.id ||
      (await supabase.from("users").select("id").eq("email", scout.email).single()).data?.id;
    if (!userId) continue;

    await supabase.from("users").update({
      role: "scout",
      subscription_status: "active",
      current_plan_slug: scout.plan,
      subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq("id", userId);
  }

  console.log("  ✓ Seeded 3 test scout accounts");
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Starting ScoutGrid seed...\n");

  console.log("📋 Membership plans...");
  await seedPlans();

  console.log("\n⚽ Player profiles...");
  await seedPlayers();

  console.log("\n🏆 Coach profiles...");
  await seedCoaches();

  console.log("\n🔭 Scout test accounts...");
  await seedScouts();

  console.log("\n✅ Seed complete!\n");
  console.log("Test accounts:");
  console.log("  Scout Basic:  scout.basic@scoutgrid.dev  / ScoutGrid2025!");
  console.log("  Scout Pro:    scout.pro@scoutgrid.dev    / ScoutGrid2025!");
  console.log("  Club Elite:   club.elite@scoutgrid.dev   / ScoutGrid2025!");
  console.log("  Players: [name].player@scoutgrid.dev     / ScoutGrid2025!");
}

main().catch(console.error);
