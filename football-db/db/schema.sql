CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Identity
  name TEXT NOT NULL,
  age INTEGER,
  nationality TEXT,
  position TEXT CHECK(position IN ('GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST')),
  secondary_position TEXT,
  club TEXT,
  league TEXT,
  contract_until INTEGER,

  -- Physical
  height_cm INTEGER,
  weight_kg INTEGER,
  preferred_foot TEXT CHECK(preferred_foot IN ('Left','Right','Both')),
  weak_foot_rating INTEGER CHECK(weak_foot_rating BETWEEN 1 AND 5),

  -- Season context
  season TEXT DEFAULT '2024/25',
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

  -- Scouting metadata
  overall_rating INTEGER CHECK(overall_rating BETWEEN 1 AND 100),
  potential_rating INTEGER CHECK(potential_rating BETWEEN 1 AND 100),
  market_value_eur INTEGER DEFAULT 0,
  scouted_by TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_nationality ON players(nationality);
CREATE INDEX IF NOT EXISTS idx_league ON players(league);
CREATE INDEX IF NOT EXISTS idx_age ON players(age);
CREATE INDEX IF NOT EXISTS idx_overall_rating ON players(overall_rating);
CREATE INDEX IF NOT EXISTS idx_market_value ON players(market_value_eur);
