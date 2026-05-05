-- Users (players and scouts share this table, differentiated by role)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('player','scout','admin')),
  stripe_customer_id TEXT,
  -- Scout-specific
  organisation TEXT,
  scout_title TEXT
);

-- Scout memberships (Stripe subscriptions)
CREATE TABLE IF NOT EXISTS scout_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL CHECK(plan IN ('monthly','annual')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','cancelled','past_due')),
  current_period_end DATETIME
);

-- Player stat submissions (one per upload, gated by payment)
CREATE TABLE IF NOT EXISTS player_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER NOT NULL REFERENCES users(id),

  -- Payment
  competition_level TEXT NOT NULL CHECK(competition_level IN ('grassroots','semi_pro','professional','elite')),
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','failed')),

  -- Visible in search only when paid
  is_visible INTEGER NOT NULL DEFAULT 0,

  -- Identity / context
  age INTEGER,
  nationality TEXT,
  position TEXT CHECK(position IN ('GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST')),
  secondary_position TEXT,
  club TEXT,
  league TEXT,
  contract_until INTEGER,
  season TEXT DEFAULT '2024/25',

  -- Physical
  height_cm INTEGER,
  weight_kg INTEGER,
  preferred_foot TEXT CHECK(preferred_foot IN ('Left','Right','Both')),
  weak_foot_rating INTEGER CHECK(weak_foot_rating BETWEEN 1 AND 5),

  -- Season stats
  appearances INTEGER DEFAULT 0,
  starts INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,

  -- Attacking
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  shots_per_90 REAL DEFAULT 0,
  shot_accuracy_pct REAL DEFAULT 0,
  xg_per_90 REAL DEFAULT 0,
  dribbles_per_90 REAL DEFAULT 0,
  dribble_success_pct REAL DEFAULT 0,
  touches_per_90 REAL DEFAULT 0,

  -- Passing
  pass_accuracy_pct REAL DEFAULT 0,
  key_passes_per_90 REAL DEFAULT 0,
  crosses_per_90 REAL DEFAULT 0,
  cross_accuracy_pct REAL DEFAULT 0,
  progressive_passes_per_90 REAL DEFAULT 0,
  xa_per_90 REAL DEFAULT 0,

  -- Defending
  tackles_per_90 REAL DEFAULT 0,
  tackle_success_pct REAL DEFAULT 0,
  interceptions_per_90 REAL DEFAULT 0,
  clearances_per_90 REAL DEFAULT 0,
  aerial_duels_won_pct REAL DEFAULT 0,
  pressures_per_90 REAL DEFAULT 0,

  -- Goalkeeping (GK only)
  saves_per_90 REAL DEFAULT 0,
  save_pct REAL DEFAULT 0,
  clean_sheets INTEGER DEFAULT 0,
  goals_against_per_90 REAL DEFAULT 0,
  xg_prevented REAL DEFAULT 0,

  -- Scouting notes (player can add their own)
  highlights_url TEXT,
  bio TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON player_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_visible ON player_submissions(is_visible);
CREATE INDEX IF NOT EXISTS idx_submissions_position ON player_submissions(position);
CREATE INDEX IF NOT EXISTS idx_submissions_level ON player_submissions(competition_level);
CREATE INDEX IF NOT EXISTS idx_submissions_nationality ON player_submissions(nationality);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON scout_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON scout_memberships(status);
