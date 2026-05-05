const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { validatePlayer } = require('../middleware/validate');

// Build a dynamic WHERE clause from scout filter query params
function buildFilters(query) {
  const conditions = [];
  const params = {};

  if (query.name) {
    conditions.push("name LIKE @name");
    params.name = `%${query.name}%`;
  }
  if (query.position) {
    conditions.push("position = @position");
    params.position = query.position.toUpperCase();
  }
  if (query.nationality) {
    conditions.push("nationality LIKE @nationality");
    params.nationality = `%${query.nationality}%`;
  }
  if (query.league) {
    conditions.push("league LIKE @league");
    params.league = `%${query.league}%`;
  }
  if (query.club) {
    conditions.push("club LIKE @club");
    params.club = `%${query.club}%`;
  }
  if (query.preferred_foot) {
    conditions.push("preferred_foot = @preferred_foot");
    params.preferred_foot = query.preferred_foot;
  }

  // Numeric range filters — min/max pairs
  const rangeFields = [
    'age', 'height_cm', 'weight_kg',
    'overall_rating', 'potential_rating', 'market_value_eur',
    'appearances', 'minutes_played', 'goals', 'assists',
    'shots_per_90', 'shot_accuracy_pct', 'xg_per_90',
    'dribbles_per_90', 'dribble_success_pct',
    'pass_accuracy_pct', 'key_passes_per_90', 'xa_per_90',
    'tackles_per_90', 'tackle_success_pct', 'interceptions_per_90',
    'aerial_duels_won_pct', 'pressures_per_90',
    'save_pct', 'clean_sheets', 'xg_prevented'
  ];

  for (const field of rangeFields) {
    if (query[`min_${field}`] !== undefined) {
      conditions.push(`${field} >= @min_${field}`);
      params[`min_${field}`] = Number(query[`min_${field}`]);
    }
    if (query[`max_${field}`] !== undefined) {
      conditions.push(`${field} <= @max_${field}`);
      params[`max_${field}`] = Number(query[`max_${field}`]);
    }
  }

  return { conditions, params };
}

// GET /api/players — list with filtering, sorting, pagination
router.get('/', (req, res) => {
  const db = getDb();
  const { conditions, params } = buildFilters(req.query);

  const sortableFields = [
    'name', 'age', 'overall_rating', 'potential_rating', 'market_value_eur',
    'goals', 'assists', 'appearances', 'minutes_played',
    'shots_per_90', 'xg_per_90', 'pass_accuracy_pct', 'key_passes_per_90',
    'dribbles_per_90', 'tackles_per_90', 'interceptions_per_90',
    'save_pct', 'xg_prevented', 'pressures_per_90'
  ];

  const sortBy = sortableFields.includes(req.query.sort_by) ? req.query.sort_by : 'overall_rating';
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM players ${where} ORDER BY ${sortBy} ${order} LIMIT @limit OFFSET @offset`;
  const countSql = `SELECT COUNT(*) as total FROM players ${where}`;

  const players = db.prepare(sql).all({ ...params, limit, offset });
  const { total } = db.prepare(countSql).get(params);

  res.json({ total, limit, offset, players });
});

// GET /api/players/positions — aggregate stats by position (for scouting overview)
router.get('/positions', (req, res) => {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      position,
      COUNT(*) as player_count,
      ROUND(AVG(age), 1) as avg_age,
      ROUND(AVG(overall_rating), 1) as avg_rating,
      ROUND(AVG(market_value_eur)) as avg_market_value
    FROM players
    GROUP BY position
    ORDER BY player_count DESC
  `).all();
  res.json(stats);
});

// GET /api/players/:id — single player
router.get('/:id', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json(player);
});

// POST /api/players — add a player
router.post('/', (req, res) => {
  const errors = validatePlayer(req.body, true);
  if (errors.length) return res.status(400).json({ errors });

  const db = getDb();
  const fields = Object.keys(req.body);
  const placeholders = fields.map(f => `@${f}`).join(', ');
  const sql = `INSERT INTO players (${fields.join(', ')}) VALUES (${placeholders})`;

  try {
    const result = db.prepare(sql).run(req.body);
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/players/:id — update a player
router.patch('/:id', (req, res) => {
  const errors = validatePlayer(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Player not found' });

  const fields = Object.keys(req.body);
  if (!fields.length) return res.status(400).json({ error: 'No fields to update' });

  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const sql = `UPDATE players SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`;

  try {
    db.prepare(sql).run({ ...req.body, id: req.params.id });
    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
    res.json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/players/:id
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM players WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Player not found' });

  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
