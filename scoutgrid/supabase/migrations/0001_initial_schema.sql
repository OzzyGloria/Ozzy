-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─────────────────────────────────────────────────────────
-- MEMBERSHIP PLANS (reference data, seeded)
-- ─────────────────────────────────────────────────────────
create table if not exists membership_plans (
  id                       uuid primary key default uuid_generate_v4(),
  name                     text not null unique,
  slug                     text not null unique,
  role_target              text not null, -- 'player_coach', 'scout_agent', 'club'
  price_monthly            numeric(10,2) not null default 0,
  price_annual             numeric(10,2) not null default 0,
  stripe_price_id_monthly  text,
  stripe_price_id_annual   text,
  features                 jsonb not null default '[]',
  target_role              text,
  max_profile_views_monthly int,
  can_contact_directly     boolean not null default false,
  can_export_reports       boolean not null default false,
  can_upload_highlights    boolean not null default false,
  highlight_limit          int not null default 0,
  is_active                boolean not null default true,
  sort_order               int not null default 0,
  created_at               timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────
-- USERS (mirrors auth.users, extended via trigger)
-- ─────────────────────────────────────────────────────────
create table if not exists users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text not null unique,
  full_name                text not null default '',
  role                     text not null default 'player'
                             check(role in ('player','coach','scout','agent','club','admin')),
  avatar_url               text,
  is_verified              boolean not null default false,
  is_onboarded             boolean not null default false,
  stripe_customer_id       text unique,
  current_plan_slug        text not null default 'free',
  stripe_subscription_id   text unique,
  subscription_status      text not null default 'inactive'
                             check(subscription_status in ('inactive','active','past_due','cancelled','trialing')),
  subscription_period_end  timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_plan on users(current_plan_slug);
create index if not exists idx_users_sub_status on users(subscription_status);

-- ─────────────────────────────────────────────────────────
-- PLAYER PROFILES
-- ─────────────────────────────────────────────────────────
create table if not exists player_profiles (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null unique references users(id) on delete cascade,
  full_name            text not null,
  date_of_birth        date,
  nationality          text,
  second_nationality   text,
  height_cm            int,
  weight_kg            int,
  preferred_foot       text check(preferred_foot in ('Left','Right','Both')),
  weak_foot_rating     int check(weak_foot_rating between 1 and 5),
  position             text check(position in (
                         'GK','CB','LB','RB','LWB','RWB',
                         'CDM','CM','CAM','LM','RM','LW','RW','CF','ST'
                       )),
  secondary_position   text,
  current_club         text,
  league               text,
  contract_until       int,
  market_value_eur     bigint,
  agent_name           text,
  avatar_url           text,
  banner_url           text,
  bio                  text,
  overall_rating       int check(overall_rating between 1 and 99),
  potential_rating     int check(potential_rating between 1 and 99),
  availability_status  text not null default 'available'
                         check(availability_status in ('available','not_available','loan_only')),
  is_visible           boolean not null default true,
  is_verified          boolean not null default false,
  profile_completeness int not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_player_profiles_position on player_profiles(position);
create index if not exists idx_player_profiles_nationality on player_profiles(nationality);
create index if not exists idx_player_profiles_league on player_profiles(league);
create index if not exists idx_player_profiles_market_value on player_profiles(market_value_eur);
create index if not exists idx_player_profiles_visible on player_profiles(is_visible);
create index if not exists idx_player_profiles_name_trgm on player_profiles using gin(full_name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────
-- PLAYER STATS (multi-season)
-- ─────────────────────────────────────────────────────────
create table if not exists player_stats (
  id                        uuid primary key default uuid_generate_v4(),
  player_profile_id         uuid not null references player_profiles(id) on delete cascade,
  season                    text not null,
  competition               text,
  club                      text,
  -- Appearances
  appearances               int default 0,
  starts                    int default 0,
  minutes_played            int default 0,
  -- Attacking
  goals                     int default 0,
  assists                   int default 0,
  shots_per_90              numeric(5,2) default 0,
  shot_accuracy_pct         numeric(5,2) default 0,
  xg_per_90                 numeric(5,3) default 0,
  dribbles_per_90           numeric(5,2) default 0,
  dribble_success_pct       numeric(5,2) default 0,
  touches_per_90            numeric(5,1) default 0,
  -- Passing
  pass_accuracy_pct         numeric(5,2) default 0,
  key_passes_per_90         numeric(5,2) default 0,
  crosses_per_90            numeric(5,2) default 0,
  cross_accuracy_pct        numeric(5,2) default 0,
  progressive_passes_per_90 numeric(5,2) default 0,
  xa_per_90                 numeric(5,3) default 0,
  -- Defending
  tackles_per_90            numeric(5,2) default 0,
  tackle_success_pct        numeric(5,2) default 0,
  interceptions_per_90      numeric(5,2) default 0,
  clearances_per_90         numeric(5,2) default 0,
  aerial_duels_won_pct      numeric(5,2) default 0,
  pressures_per_90          numeric(5,2) default 0,
  -- Discipline
  yellow_cards              int default 0,
  red_cards                 int default 0,
  -- Goalkeeping (GK only)
  saves_per_90              numeric(5,2) default 0,
  save_pct                  numeric(5,2) default 0,
  clean_sheets              int default 0,
  goals_against_per_90      numeric(5,3) default 0,
  xg_prevented              numeric(6,2) default 0,
  -- Overall
  rating                    numeric(4,2),
  created_at                timestamptz not null default now(),
  unique(player_profile_id, season, competition)
);

create index if not exists idx_player_stats_profile on player_stats(player_profile_id);

-- ─────────────────────────────────────────────────────────
-- MARKET VALUATIONS (time series)
-- ─────────────────────────────────────────────────────────
create table if not exists market_valuations (
  id                uuid primary key default uuid_generate_v4(),
  player_profile_id uuid not null references player_profiles(id) on delete cascade,
  value_eur         bigint not null,
  recorded_at       date not null default current_date,
  source            text not null default 'manual',
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_market_valuations_player on market_valuations(player_profile_id, recorded_at);

-- ─────────────────────────────────────────────────────────
-- COACH PROFILES
-- ─────────────────────────────────────────────────────────
create table if not exists coach_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references users(id) on delete cascade,
  full_name           text not null,
  date_of_birth       date,
  nationality         text,
  avatar_url          text,
  banner_url          text,
  bio                 text,
  current_club        text,
  current_role        text,
  preferred_formation text,
  playing_style       text[] default '{}',
  licenses            text[] default '{}',
  languages           text[] default '{}',
  contract_expiry     int,
  availability_status text not null default 'available'
                        check(availability_status in ('available','not_available','open_to_offers')),
  is_visible          boolean not null default true,
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_coach_profiles_name_trgm on coach_profiles using gin(full_name gin_trgm_ops);

-- ─────────────────────────────────────────────────────────
-- COACH STATS (career history rows)
-- ─────────────────────────────────────────────────────────
create table if not exists coach_stats (
  id                uuid primary key default uuid_generate_v4(),
  coach_profile_id  uuid not null references coach_profiles(id) on delete cascade,
  club              text not null,
  role              text not null,
  season_start      int not null,
  season_end        int,
  matches_managed   int default 0,
  wins              int default 0,
  draws             int default 0,
  losses            int default 0,
  goals_scored      int default 0,
  goals_conceded    int default 0,
  trophies          text[] default '{}',
  created_at        timestamptz not null default now()
);

create index if not exists idx_coach_stats_profile on coach_stats(coach_profile_id);

-- ─────────────────────────────────────────────────────────
-- HIGHLIGHTS
-- ─────────────────────────────────────────────────────────
create table if not exists highlights (
  id                   uuid primary key default uuid_generate_v4(),
  owner_id             uuid not null references users(id) on delete cascade,
  owner_type           text not null check(owner_type in ('player','coach')),
  title                text not null,
  description          text,
  cloudinary_public_id text,
  cloudinary_url       text not null,
  thumbnail_url        text,
  duration_seconds     int,
  match_details        text,
  is_primary           boolean not null default false,
  sort_order           int not null default 0,
  views                int not null default 0,
  upload_date          date not null default current_date,
  created_at           timestamptz not null default now()
);

create index if not exists idx_highlights_owner on highlights(owner_id, owner_type);

-- ─────────────────────────────────────────────────────────
-- SCOUTING REPORTS
-- ─────────────────────────────────────────────────────────
create table if not exists scouting_reports (
  id                uuid primary key default uuid_generate_v4(),
  scout_id          uuid not null references users(id) on delete cascade,
  player_profile_id uuid references player_profiles(id) on delete set null,
  coach_profile_id  uuid references coach_profiles(id) on delete set null,
  report_date       date not null default current_date,
  technical_rating  int check(technical_rating between 1 and 10),
  physical_rating   int check(physical_rating between 1 and 10),
  mental_rating     int check(mental_rating between 1 and 10),
  tactical_rating   int check(tactical_rating between 1 and 10),
  potential_rating  int check(potential_rating between 1 and 10),
  overall_rating    int check(overall_rating between 1 and 10),
  strengths         text,
  weaknesses        text,
  summary           text,
  recommendation    text check(recommendation in ('sign','monitor','reject','loan')),
  is_private        boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint one_target check (
    (player_profile_id is not null) or (coach_profile_id is not null)
  )
);

create index if not exists idx_scouting_reports_player on scouting_reports(player_profile_id);
create index if not exists idx_scouting_reports_scout on scouting_reports(scout_id);

-- ─────────────────────────────────────────────────────────
-- SAVED SEARCHES
-- ─────────────────────────────────────────────────────────
create table if not exists saved_searches (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  name          text not null,
  filters       jsonb not null default '{}',
  alert_enabled boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_saved_searches_user on saved_searches(user_id);

-- ─────────────────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────────────────
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  subject     text,
  body        text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_messages_receiver on messages(receiver_id, is_read);
create index if not exists idx_messages_thread on messages(sender_id, receiver_id, created_at);
