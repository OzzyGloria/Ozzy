const { getDb } = require('./database');

const players = [
  {
    name: 'Marcus Bale', age: 24, nationality: 'English', position: 'ST',
    club: 'FC Northgate', league: 'Championship', height_cm: 183, weight_kg: 79,
    preferred_foot: 'Right', weak_foot_rating: 3, season: '2024/25',
    appearances: 34, starts: 32, minutes_played: 2740,
    goals: 22, assists: 7, shots_per_90: 4.2, shot_accuracy_pct: 48,
    xg_per_90: 0.72, dribbles_per_90: 2.1, dribble_success_pct: 56,
    touches_per_90: 38, pass_accuracy_pct: 74, key_passes_per_90: 1.4,
    aerial_duels_won_pct: 52, pressures_per_90: 5.1,
    overall_rating: 78, potential_rating: 85, market_value_eur: 7500000,
    notes: 'Clinical finisher, excellent movement in the box'
  },
  {
    name: 'Diogo Ferreira', age: 22, nationality: 'Portuguese', position: 'CM',
    club: 'Atletico Braga B', league: 'Primeira Liga B', height_cm: 178, weight_kg: 73,
    preferred_foot: 'Left', weak_foot_rating: 4, season: '2024/25',
    appearances: 30, starts: 28, minutes_played: 2450,
    goals: 6, assists: 11, shots_per_90: 1.8, shot_accuracy_pct: 44,
    xg_per_90: 0.18, dribbles_per_90: 3.4, dribble_success_pct: 68,
    touches_per_90: 72, pass_accuracy_pct: 88, key_passes_per_90: 2.6,
    progressive_passes_per_90: 5.1, xa_per_90: 0.31,
    tackles_per_90: 2.8, tackle_success_pct: 72, interceptions_per_90: 1.9,
    pressures_per_90: 12.4,
    overall_rating: 74, potential_rating: 88, market_value_eur: 4200000,
    notes: 'Box-to-box engine, elite pressing numbers for his age'
  },
  {
    name: 'Kwame Asante', age: 20, nationality: 'Ghanaian', position: 'LW',
    club: 'Hearts of Oak', league: 'Ghana Premier League', height_cm: 172, weight_kg: 67,
    preferred_foot: 'Right', weak_foot_rating: 3, season: '2024/25',
    appearances: 28, starts: 25, minutes_played: 2100,
    goals: 9, assists: 13, shots_per_90: 3.1, shot_accuracy_pct: 51,
    xg_per_90: 0.35, dribbles_per_90: 5.8, dribble_success_pct: 62,
    crosses_per_90: 2.9, cross_accuracy_pct: 31, touches_per_90: 55,
    pass_accuracy_pct: 79, key_passes_per_90: 3.2,
    overall_rating: 70, potential_rating: 84, market_value_eur: 1800000,
    notes: 'Explosive pace, elite dribbler — raw but exceptional ceiling'
  },
  {
    name: 'Lars Andersen', age: 27, nationality: 'Danish', position: 'CB',
    club: 'FC Midtjylland', league: 'Danish Superliga', height_cm: 192, weight_kg: 88,
    preferred_foot: 'Right', weak_foot_rating: 3, season: '2024/25',
    appearances: 36, starts: 36, minutes_played: 3240,
    tackles_per_90: 3.1, tackle_success_pct: 79, interceptions_per_90: 2.4,
    clearances_per_90: 5.8, aerial_duels_won_pct: 74, pressures_per_90: 7.2,
    pass_accuracy_pct: 86, progressive_passes_per_90: 3.2,
    overall_rating: 77, potential_rating: 80, market_value_eur: 6000000,
    notes: 'Dominant aerial presence, leads defensive line well'
  },
  {
    name: 'Tomáš Novák', age: 25, nationality: 'Czech', position: 'GK',
    club: 'SK Slavia Praha', league: 'Czech First League', height_cm: 190, weight_kg: 85,
    preferred_foot: 'Right', weak_foot_rating: 2, season: '2024/25',
    appearances: 34, starts: 34, minutes_played: 3060,
    saves_per_90: 4.2, save_pct: 74, clean_sheets: 14,
    goals_against_per_90: 0.88, xg_prevented: 7.3,
    pass_accuracy_pct: 71,
    overall_rating: 76, potential_rating: 82, market_value_eur: 5500000,
    notes: 'Strong shot-stopper, good distribution under pressure'
  },
  {
    name: 'Sofiane Hadj', age: 23, nationality: 'Algerian', position: 'CAM',
    club: 'USM Alger', league: 'Ligue Professionnelle 1', height_cm: 175, weight_kg: 70,
    preferred_foot: 'Left', weak_foot_rating: 4, season: '2024/25',
    appearances: 31, starts: 29, minutes_played: 2580,
    goals: 8, assists: 16, shots_per_90: 2.4, shot_accuracy_pct: 46,
    xg_per_90: 0.26, xa_per_90: 0.48, dribbles_per_90: 4.1, dribble_success_pct: 65,
    touches_per_90: 68, pass_accuracy_pct: 85, key_passes_per_90: 3.8,
    progressive_passes_per_90: 4.4,
    overall_rating: 72, potential_rating: 83, market_value_eur: 2200000,
    notes: 'Creative playmaker, high chance creation rate'
  },
  {
    name: 'Riku Mäkinen', age: 19, nationality: 'Finnish', position: 'LB',
    club: 'HJK Helsinki', league: 'Veikkausliiga', height_cm: 176, weight_kg: 71,
    preferred_foot: 'Left', weak_foot_rating: 3, season: '2024/25',
    appearances: 26, starts: 22, minutes_played: 1850,
    tackles_per_90: 2.9, tackle_success_pct: 70, interceptions_per_90: 1.6,
    crosses_per_90: 3.4, cross_accuracy_pct: 28, dribbles_per_90: 2.2,
    dribble_success_pct: 58, pass_accuracy_pct: 82,
    overall_rating: 68, potential_rating: 80, market_value_eur: 900000,
    notes: 'Dynamic overlap runner, needs defensive polish'
  },
  {
    name: 'Javier Ruiz', age: 29, nationality: 'Spanish', position: 'CDM',
    club: 'Real Valladolid', league: 'La Liga 2', height_cm: 181, weight_kg: 78,
    preferred_foot: 'Right', weak_foot_rating: 3, season: '2024/25',
    appearances: 38, starts: 37, minutes_played: 3320,
    tackles_per_90: 4.6, tackle_success_pct: 75, interceptions_per_90: 3.1,
    clearances_per_90: 2.4, aerial_duels_won_pct: 58, pressures_per_90: 14.2,
    pass_accuracy_pct: 89, progressive_passes_per_90: 3.8,
    overall_rating: 80, potential_rating: 81, market_value_eur: 8500000,
    notes: 'Elite ball-winner, reads the game exceptionally well'
  }
];

function seed() {
  const db = getDb();
  const insert = db.prepare(`
    INSERT OR IGNORE INTO players (
      name, age, nationality, position, secondary_position,
      club, league, contract_until, height_cm, weight_kg,
      preferred_foot, weak_foot_rating, season,
      appearances, starts, minutes_played,
      goals, assists, shots_per_90, shot_accuracy_pct,
      xg_per_90, dribbles_per_90, dribble_success_pct, touches_per_90,
      pass_accuracy_pct, key_passes_per_90, crosses_per_90,
      cross_accuracy_pct, progressive_passes_per_90, xa_per_90,
      tackles_per_90, tackle_success_pct, interceptions_per_90,
      clearances_per_90, aerial_duels_won_pct, pressures_per_90,
      saves_per_90, save_pct, clean_sheets,
      goals_against_per_90, xg_prevented,
      overall_rating, potential_rating, market_value_eur,
      scouted_by, notes
    ) VALUES (
      @name, @age, @nationality, @position, @secondary_position,
      @club, @league, @contract_until, @height_cm, @weight_kg,
      @preferred_foot, @weak_foot_rating, @season,
      @appearances, @starts, @minutes_played,
      @goals, @assists, @shots_per_90, @shot_accuracy_pct,
      @xg_per_90, @dribbles_per_90, @dribble_success_pct, @touches_per_90,
      @pass_accuracy_pct, @key_passes_per_90, @crosses_per_90,
      @cross_accuracy_pct, @progressive_passes_per_90, @xa_per_90,
      @tackles_per_90, @tackle_success_pct, @interceptions_per_90,
      @clearances_per_90, @aerial_duels_won_pct, @pressures_per_90,
      @saves_per_90, @save_pct, @clean_sheets,
      @goals_against_per_90, @xg_prevented,
      @overall_rating, @potential_rating, @market_value_eur,
      @scouted_by, @notes
    )
  `);

  const defaults = {
    secondary_position: null, contract_until: null, scouted_by: null,
    goals: 0, assists: 0, shots_per_90: 0, shot_accuracy_pct: 0, xg_per_90: 0,
    dribbles_per_90: 0, dribble_success_pct: 0, touches_per_90: 0,
    pass_accuracy_pct: 0, key_passes_per_90: 0, crosses_per_90: 0,
    cross_accuracy_pct: 0, progressive_passes_per_90: 0, xa_per_90: 0,
    tackles_per_90: 0, tackle_success_pct: 0, interceptions_per_90: 0,
    clearances_per_90: 0, aerial_duels_won_pct: 0, pressures_per_90: 0,
    saves_per_90: 0, save_pct: 0, clean_sheets: 0,
    goals_against_per_90: 0, xg_prevented: 0, notes: null
  };

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      insert.run({ ...defaults, ...row });
    }
  });

  insertMany(players);
  console.log(`Seeded ${players.length} sample players.`);
}

seed();
