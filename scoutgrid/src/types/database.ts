export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "player" | "coach" | "scout" | "agent" | "club" | "admin"
          avatar_url: string | null
          is_verified: boolean
          is_onboarded: boolean
          stripe_customer_id: string | null
          current_plan_slug: string
          stripe_subscription_id: string | null
          subscription_status: "inactive" | "active" | "past_due" | "cancelled" | "trialing"
          subscription_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          role?: "player" | "coach" | "scout" | "agent" | "club" | "admin"
          avatar_url?: string | null
          is_verified?: boolean
          is_onboarded?: boolean
          stripe_customer_id?: string | null
          current_plan_slug?: string
          stripe_subscription_id?: string | null
          subscription_status?: "inactive" | "active" | "past_due" | "cancelled" | "trialing"
          subscription_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
        Relationships: []
      }
      player_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          date_of_birth: string | null
          nationality: string | null
          second_nationality: string | null
          height_cm: number | null
          weight_kg: number | null
          preferred_foot: "Left" | "Right" | "Both" | null
          weak_foot_rating: number | null
          position: string | null
          secondary_position: string | null
          current_club: string | null
          league: string | null
          contract_until: number | null
          market_value_eur: number | null
          agent_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          overall_rating: number | null
          potential_rating: number | null
          availability_status: "available" | "not_available" | "loan_only"
          is_visible: boolean
          is_verified: boolean
          profile_completeness: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          date_of_birth?: string | null
          nationality?: string | null
          second_nationality?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          preferred_foot?: "Left" | "Right" | "Both" | null
          weak_foot_rating?: number | null
          position?: string | null
          secondary_position?: string | null
          current_club?: string | null
          league?: string | null
          contract_until?: number | null
          market_value_eur?: number | null
          agent_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          overall_rating?: number | null
          potential_rating?: number | null
          availability_status?: "available" | "not_available" | "loan_only"
          is_visible?: boolean
          is_verified?: boolean
          profile_completeness?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["player_profiles"]["Insert"]>
        Relationships: []
      }
      player_stats: {
        Row: {
          id: string
          player_profile_id: string
          season: string
          competition: string | null
          club: string | null
          appearances: number
          starts: number
          minutes_played: number
          goals: number
          assists: number
          shots_per_90: number
          shot_accuracy_pct: number
          xg_per_90: number
          dribbles_per_90: number
          dribble_success_pct: number
          touches_per_90: number
          pass_accuracy_pct: number
          key_passes_per_90: number
          crosses_per_90: number
          cross_accuracy_pct: number
          progressive_passes_per_90: number
          xa_per_90: number
          tackles_per_90: number
          tackle_success_pct: number
          interceptions_per_90: number
          clearances_per_90: number
          aerial_duels_won_pct: number
          pressures_per_90: number
          yellow_cards: number
          red_cards: number
          saves_per_90: number
          save_pct: number
          clean_sheets: number
          goals_against_per_90: number
          xg_prevented: number
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          player_profile_id: string
          season: string
          competition?: string | null
          club?: string | null
          appearances?: number
          starts?: number
          minutes_played?: number
          goals?: number
          assists?: number
          shots_per_90?: number
          shot_accuracy_pct?: number
          xg_per_90?: number
          dribbles_per_90?: number
          dribble_success_pct?: number
          touches_per_90?: number
          pass_accuracy_pct?: number
          key_passes_per_90?: number
          crosses_per_90?: number
          cross_accuracy_pct?: number
          progressive_passes_per_90?: number
          xa_per_90?: number
          tackles_per_90?: number
          tackle_success_pct?: number
          interceptions_per_90?: number
          clearances_per_90?: number
          aerial_duels_won_pct?: number
          pressures_per_90?: number
          yellow_cards?: number
          red_cards?: number
          saves_per_90?: number
          save_pct?: number
          clean_sheets?: number
          goals_against_per_90?: number
          xg_prevented?: number
          rating?: number | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["player_stats"]["Insert"]>
        Relationships: []
      }
      market_valuations: {
        Row: {
          id: string
          player_profile_id: string
          value_eur: number
          recorded_at: string
          source: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_profile_id: string
          value_eur: number
          recorded_at?: string
          source?: string
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["market_valuations"]["Insert"]>
        Relationships: []
      }
      coach_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          date_of_birth: string | null
          nationality: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          current_club: string | null
          current_role: string | null
          preferred_formation: string | null
          playing_style: string[]
          licenses: string[]
          languages: string[]
          contract_expiry: number | null
          availability_status: "available" | "not_available" | "open_to_offers"
          is_visible: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          date_of_birth?: string | null
          nationality?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          current_club?: string | null
          current_role?: string | null
          preferred_formation?: string | null
          playing_style?: string[]
          licenses?: string[]
          languages?: string[]
          contract_expiry?: number | null
          availability_status?: "available" | "not_available" | "open_to_offers"
          is_visible?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["coach_profiles"]["Insert"]>
        Relationships: []
      }
      coach_stats: {
        Row: {
          id: string
          coach_profile_id: string
          club: string
          role: string
          season_start: number
          season_end: number | null
          matches_managed: number
          wins: number
          draws: number
          losses: number
          goals_scored: number
          goals_conceded: number
          trophies: string[]
          created_at: string
        }
        Insert: {
          id?: string
          coach_profile_id: string
          club: string
          role: string
          season_start: number
          season_end?: number | null
          matches_managed?: number
          wins?: number
          draws?: number
          losses?: number
          goals_scored?: number
          goals_conceded?: number
          trophies?: string[]
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["coach_stats"]["Insert"]>
        Relationships: []
      }
      highlights: {
        Row: {
          id: string
          owner_id: string
          owner_type: "player" | "coach"
          title: string
          description: string | null
          cloudinary_public_id: string | null
          cloudinary_url: string
          thumbnail_url: string | null
          duration_seconds: number | null
          match_details: string | null
          is_primary: boolean
          sort_order: number
          views: number
          upload_date: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          owner_type: "player" | "coach"
          title: string
          description?: string | null
          cloudinary_public_id?: string | null
          cloudinary_url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          match_details?: string | null
          is_primary?: boolean
          sort_order?: number
          views?: number
          upload_date?: string
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["highlights"]["Insert"]>
        Relationships: []
      }
      scouting_reports: {
        Row: {
          id: string
          scout_id: string
          player_profile_id: string | null
          coach_profile_id: string | null
          report_date: string
          technical_rating: number | null
          physical_rating: number | null
          mental_rating: number | null
          tactical_rating: number | null
          potential_rating: number | null
          overall_rating: number | null
          strengths: string | null
          weaknesses: string | null
          summary: string | null
          recommendation: "sign" | "monitor" | "reject" | "loan" | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          scout_id: string
          player_profile_id?: string | null
          coach_profile_id?: string | null
          report_date?: string
          technical_rating?: number | null
          physical_rating?: number | null
          mental_rating?: number | null
          tactical_rating?: number | null
          potential_rating?: number | null
          overall_rating?: number | null
          strengths?: string | null
          weaknesses?: string | null
          summary?: string | null
          recommendation?: "sign" | "monitor" | "reject" | "loan" | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["scouting_reports"]["Insert"]>
        Relationships: []
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          filters: Json
          alert_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filters?: Json
          alert_enabled?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["saved_searches"]["Insert"]>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          subject: string | null
          body: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          subject?: string | null
          body: string
          is_read?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>
        Relationships: []
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          slug: string
          role_target: string
          price_monthly: number
          price_annual: number
          stripe_price_id_monthly: string | null
          stripe_price_id_annual: string | null
          features: Json
          target_role: string | null
          max_profile_views_monthly: number | null
          can_contact_directly: boolean
          can_export_reports: boolean
          can_upload_highlights: boolean
          highlight_limit: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          role_target: string
          price_monthly?: number
          price_annual?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_annual?: string | null
          features?: Json
          target_role?: string | null
          max_profile_views_monthly?: number | null
          can_contact_directly?: boolean
          can_export_reports?: boolean
          can_upload_highlights?: boolean
          highlight_limit?: number
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["membership_plans"]["Insert"]>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      calculate_player_completeness: {
        Args: { p_profile_id: string }
        Returns: number
      }
      coach_win_pct: {
        Args: { wins: number; draws: number; losses: number }
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}
