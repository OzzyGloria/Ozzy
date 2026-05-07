export const POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
] as const;

export type Position = typeof POSITIONS[number];

export const POSITION_LABELS: Record<string, string> = {
  GK: "Goalkeeper",
  CB: "Centre-Back",
  LB: "Left-Back",
  RB: "Right-Back",
  LWB: "Left Wing-Back",
  RWB: "Right Wing-Back",
  CDM: "Defensive Midfield",
  CM: "Central Midfield",
  CAM: "Attacking Midfield",
  LM: "Left Midfield",
  RM: "Right Midfield",
  LW: "Left Wing",
  RW: "Right Wing",
  CF: "Centre-Forward",
  ST: "Striker",
};

export const NATIONALITIES = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Cameroon",
  "Chile",
  "Colombia",
  "Croatia",
  "Denmark",
  "Egypt",
  "England",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Holland",
  "Ireland",
  "Italy",
  "Ivory Coast",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Poland",
  "Portugal",
  "Scotland",
  "Senegal",
  "Serbia",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "USA",
  "Uruguay",
  "Wales",
] as const;

export const PREFERRED_FOOT = ["Left", "Right", "Both"] as const;

export const AVAILABILITY_STATUS = ["available", "not_available", "loan_only"] as const;

export const USER_ROLES = ["player", "coach", "scout", "agent", "club", "admin"] as const;
export type UserRole = typeof USER_ROLES[number];

export const MEMBERSHIP_PLAN_SLUGS = [
  "free",
  "visible",
  "pro_athlete",
  "scout_basic",
  "scout_pro",
  "club_elite",
] as const;
export type PlanSlug = typeof MEMBERSHIP_PLAN_SLUGS[number];

export const PLAN_NAMES: Record<PlanSlug, string> = {
  free: "Free Starter",
  visible: "Visible",
  pro_athlete: "Pro Athlete",
  scout_basic: "Scout Basic",
  scout_pro: "Scout Pro",
  club_elite: "Club Elite",
};

export const PLAN_PRICES: Record<PlanSlug, number> = {
  free: 0,
  visible: 9.99,
  pro_athlete: 24.99,
  scout_basic: 49.99,
  scout_pro: 129.99,
  club_elite: 299.99,
};

export const COACHING_LICENSES = [
  "UEFA Pro",
  "UEFA A",
  "UEFA B",
  "UEFA C",
  "UEFA Elite Youth",
  "CAF A",
  "CAF B",
  "CONMEBOL",
  "AFC A",
  "AFC B",
  "CONCACAF A",
  "National A",
  "National B",
  "Grassroots",
] as const;

export const FORMATIONS = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "4-1-4-1",
  "4-3-2-1",
  "3-4-2-1",
  "4-2-2-2",
  "5-4-1",
  "4-4-1-1",
] as const;

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Dutch",
  "Arabic",
  "Russian",
  "Turkish",
  "Japanese",
  "Korean",
  "Polish",
  "Croatian",
  "Serbian",
  "Swedish",
  "Danish",
  "Norwegian",
] as const;

export const SEASONS = ["2024/25", "2023/24", "2022/23", "2021/22", "2020/21"] as const;

export const RECOMMENDATION_OPTIONS = [
  { value: "sign", label: "Sign Now", color: "text-green" },
  { value: "monitor", label: "Monitor", color: "text-gold" },
  { value: "loan", label: "Consider on Loan", color: "text-blue-400" },
  { value: "reject", label: "Not Recommended", color: "text-red-400" },
] as const;

export const LEAGUES = [
  "Premier League",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Eredivisie",
  "Primeira Liga",
  "Championship",
  "League One",
  "League Two",
  "Scottish Premiership",
  "Jupiler Pro League",
  "Süper Lig",
  "Major League Soccer",
  "Brazilian Serie A",
  "Argentine Primera División",
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "Non-League",
  "Amateur",
  "Youth/Academy",
] as const;

export const RADAR_ATTRIBUTES = [
  { key: "pace", label: "Pace" },
  { key: "shooting", label: "Shooting" },
  { key: "passing", label: "Passing" },
  { key: "dribbling", label: "Dribbling" },
  { key: "defending", label: "Defending" },
  { key: "physical", label: "Physical" },
] as const;

export const PROFILE_COMPLETENESS_ITEMS = [
  { key: "date_of_birth", label: "Date of birth", points: 8 },
  { key: "nationality", label: "Nationality", points: 5 },
  { key: "height_cm", label: "Height", points: 5 },
  { key: "weight_kg", label: "Weight", points: 5 },
  { key: "preferred_foot", label: "Preferred foot", points: 5 },
  { key: "position", label: "Playing position", points: 7 },
  { key: "bio", label: "Player bio (50+ chars)", points: 5 },
  { key: "current_club", label: "Current club", points: 10 },
  { key: "league", label: "Current league", points: 10 },
  { key: "stats", label: "Season stats (1+ season)", points: 15 },
  { key: "avatar_url", label: "Profile photo", points: 10 },
  { key: "highlights", label: "At least 1 highlight", points: 5 },
] as const;
