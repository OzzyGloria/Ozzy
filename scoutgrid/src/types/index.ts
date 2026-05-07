import type { Database } from "./database";

export type { Database };

export type User = Database["public"]["Tables"]["users"]["Row"];
export type PlayerProfile = Database["public"]["Tables"]["player_profiles"]["Row"];
export type PlayerStats = Database["public"]["Tables"]["player_stats"]["Row"];
export type MarketValuation = Database["public"]["Tables"]["market_valuations"]["Row"];
export type CoachProfile = Database["public"]["Tables"]["coach_profiles"]["Row"];
export type CoachStats = Database["public"]["Tables"]["coach_stats"]["Row"];
export type Highlight = Database["public"]["Tables"]["highlights"]["Row"];
export type ScoutingReport = Database["public"]["Tables"]["scouting_reports"]["Row"];
export type SavedSearch = Database["public"]["Tables"]["saved_searches"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MembershipPlan = Database["public"]["Tables"]["membership_plans"]["Row"];

// Extended types with joins
export type PlayerWithStats = PlayerProfile & {
  user?: Pick<User, "id" | "email" | "avatar_url" | "current_plan_slug" | "subscription_status">
  player_stats?: PlayerStats[]
  highlights?: Highlight[]
  market_valuations?: MarketValuation[]
}

export type CoachWithStats = CoachProfile & {
  user?: Pick<User, "id" | "email" | "avatar_url">
  coach_stats?: CoachStats[]
  highlights?: Highlight[]
}

export type SearchFilters = {
  query?: string
  position?: string
  min_age?: number
  max_age?: number
  nationality?: string
  league?: string
  preferred_foot?: string
  min_height?: number
  max_height?: number
  min_market_value?: number
  max_market_value?: number
  availability_status?: string
  min_goals?: number
  min_assists?: number
  min_appearances?: number
  sort_by?: "market_value_desc" | "market_value_asc" | "age_asc" | "age_desc" | "overall_rating_desc" | "name_asc"
  limit?: number
  cursor?: string
}

export type PlanFeature = {
  label: string
  available: boolean
  limit?: string
}

export type SubscriptionStatus = "inactive" | "active" | "past_due" | "cancelled" | "trialing"

export type UserRole = "player" | "coach" | "scout" | "agent" | "club" | "admin"

export type AvailabilityStatus = "available" | "not_available" | "loan_only"

export type Recommendation = "sign" | "monitor" | "reject" | "loan"

export type ApiError = {
  error: string
  code?: string
  status?: number
}
