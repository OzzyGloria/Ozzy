const express = require('express');
const cors = require('cors');
const playersRouter = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/players', playersRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'football-player-database', timestamp: new Date().toISOString() });
});

// Scout quick-reference: list all available filter params
app.get('/api/filters', (req, res) => {
  res.json({
    text_filters: ['name', 'position', 'nationality', 'league', 'club', 'preferred_foot'],
    range_filters: {
      description: 'Prefix any numeric field with min_ or max_',
      fields: [
        'age', 'height_cm', 'weight_kg',
        'overall_rating', 'potential_rating', 'market_value_eur',
        'appearances', 'minutes_played', 'goals', 'assists',
        'shots_per_90', 'shot_accuracy_pct', 'xg_per_90',
        'dribbles_per_90', 'dribble_success_pct',
        'pass_accuracy_pct', 'key_passes_per_90', 'xa_per_90',
        'tackles_per_90', 'tackle_success_pct', 'interceptions_per_90',
        'aerial_duels_won_pct', 'pressures_per_90',
        'save_pct', 'clean_sheets', 'xg_prevented'
      ]
    },
    sort: {
      sort_by: 'any field name above',
      order: 'asc | desc (default: desc)'
    },
    pagination: { limit: 'max 100 (default 20)', offset: 'default 0' },
    positions: ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','CF','ST']
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Football Player Database running on http://localhost:${PORT}`);
  console.log(`Scout endpoints:`);
  console.log(`  GET  /api/players              — list/filter players`);
  console.log(`  GET  /api/players/:id           — player detail`);
  console.log(`  GET  /api/players/positions     — stats by position`);
  console.log(`  POST /api/players               — add player`);
  console.log(`  PATCH /api/players/:id          — update player`);
  console.log(`  DELETE /api/players/:id         — remove player`);
  console.log(`  GET  /api/filters               — filter reference`);
});
