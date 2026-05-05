const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { requireAuth, requireRole, requireActiveScout } = require('../middleware/auth');

// Build WHERE clause from query params (scouts use this to filter)
function buildFilters(query) {
  const conditions = ["ps.is_visible = 1", "ps.payment_status = 'paid'"];
  const params = {};

  if (query.name) {
    conditions.push("u.full_name LIKE @name");
    params.name = `%${query.name}%`;
  }
  if (query.position) {
    conditions.push("ps.position = @position");
    params.position = query.position.toUpperCase();
  }
  if (query.nationality) {
    conditions.push("ps.nationality LIKE @nationality");
    params.nationality = `%${query.nationality}%`;
  }
  if (query.league) {
    conditions.push("ps.league LIKE @league");
    params.league = `%${query.league}%`;
  }
  if (query.club) {
    conditions.push("ps.club LIKE @club");
    params.club = `%${query.club}%`;
  }
  if (query.preferred_foot) {
    conditions.push("ps.preferred_foot = @preferred_foot");
    params.preferred_foot = query.preferred_foot;
  }
  if (query.competition_level) {
    conditions.push("ps.competition_level = @competition_level");
    params.competition_level = query.competition_level;
  }

  const rangeFields = [
    'age', 'height_cm', 'weight_kg',
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
      conditions.push(`ps.${field} >= @min_${field}`);
      params[`min_${field}`] = Number(query[`min_${field}`]);
    }
    if (query[`max_${field}`] !== undefined) {
      conditions.push(`ps.${field} <= @max_${field}`);
      params[`max_${field}`] = Number(query[`max_${field}`]);
    }
  }

  return { conditions, params };
}

// GET /api/players — scouts only, requires active membership
router.get('/', requireAuth, requireActiveScout, (req, res) => {
  const db = getDb();
  const { conditions, params } = buildFilters(req.query);

  const sortableFields = [
    'age', 'goals', 'assists', 'appearances', 'minutes_played',
    'shots_per_90', 'xg_per_90', 'pass_accuracy_pct', 'key_passes_per_90',
    'dribbles_per_90', 'tackles_per_90', 'interceptions_per_90',
    'save_pct', 'xg_prevented', 'pressures_per_90', 'created_at'
  ];

  const sortBy = sortableFields.includes(req.query.sort_by) ? `ps.${req.query.sort_by}` : 'ps.created_at';
  const order = req.query.order === 'asc' ? 'ASC' : 'DESC';
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;

  const where = `WHERE ${conditions.join(' AND ')}`;
  const sql = `
    SELECT
      ps.id, ps.competition_level, ps.position, ps.secondary_position,
      ps.age, ps.nationality, ps.club, ps.league, ps.season,
      ps.height_cm, ps.weight_kg, ps.preferred_foot,
      ps.appearances, ps.starts, ps.minutes_played,
      ps.goals, ps.assists, ps.shots_per_90, ps.shot_accuracy_pct, ps.xg_per_90,
      ps.dribbles_per_90, ps.dribble_success_pct, ps.touches_per_90,
      ps.pass_accuracy_pct, ps.key_passes_per_90, ps.xa_per_90, ps.progressive_passes_per_90,
      ps.tackles_per_90, ps.tackle_success_pct, ps.interceptions_per_90,
      ps.clearances_per_90, ps.aerial_duels_won_pct, ps.pressures_per_90,
      ps.saves_per_90, ps.save_pct, ps.clean_sheets, ps.xg_prevented,
      ps.highlights_url, ps.bio, ps.created_at,
      u.full_name, u.id as user_id
    FROM player_submissions ps
    JOIN users u ON u.id = ps.user_id
    ${where}
    ORDER BY ${sortBy} ${order}
    LIMIT @limit OFFSET @offset
  `;
  const countSql = `
    SELECT COUNT(*) as total
    FROM player_submissions ps
    JOIN users u ON u.id = ps.user_id
    ${where}
  `;

  const players = db.prepare(sql).all({ ...params, limit, offset });
  const { total } = db.prepare(countSql).get(params);
  res.json({ total, limit, offset, players });
});

// GET /api/players/positions — aggregate overview (scouts only)
router.get('/positions', requireAuth, requireActiveScout, (req, res) => {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      position,
      COUNT(*) as player_count,
      ROUND(AVG(age), 1) as avg_age,
      competition_level
    FROM player_submissions
    WHERE is_visible = 1 AND payment_status = 'paid' AND position IS NOT NULL
    GROUP BY position, competition_level
    ORDER BY player_count DESC
  `).all();
  res.json(stats);
});

// GET /api/players/:id — full profile, scouts only
router.get('/:id', requireAuth, requireActiveScout, (req, res) => {
  const db = getDb();
  const player = db.prepare(`
    SELECT ps.*, u.full_name
    FROM player_submissions ps
    JOIN users u ON u.id = ps.user_id
    WHERE ps.id = ? AND ps.is_visible = 1 AND ps.payment_status = 'paid'
  `).get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json(player);
});

// POST /api/players/submit — player submits stats after paying
router.post('/submit', requireAuth, requireRole('player'), (req, res) => {
  const db = getDb();
  const { submission_id, ...stats } = req.body;

  if (!submission_id) {
    return res.status(400).json({ error: 'submission_id is required' });
  }

  const submission = db.prepare(
    "SELECT * FROM player_submissions WHERE id = ? AND user_id = ?"
  ).get(submission_id, req.user.id);

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  if (submission.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Payment required before submitting stats', code: 'PAYMENT_REQUIRED' });
  }

  // Whitelist updatable fields
  const allowed = [
    'age', 'nationality', 'position', 'secondary_position', 'club', 'league',
    'contract_until', 'season', 'height_cm', 'weight_kg', 'preferred_foot', 'weak_foot_rating',
    'appearances', 'starts', 'minutes_played',
    'goals', 'assists', 'shots_per_90', 'shot_accuracy_pct', 'xg_per_90',
    'dribbles_per_90', 'dribble_success_pct', 'touches_per_90',
    'pass_accuracy_pct', 'key_passes_per_90', 'crosses_per_90', 'cross_accuracy_pct',
    'progressive_passes_per_90', 'xa_per_90',
    'tackles_per_90', 'tackle_success_pct', 'interceptions_per_90',
    'clearances_per_90', 'aerial_duels_won_pct', 'pressures_per_90',
    'saves_per_90', 'save_pct', 'clean_sheets', 'goals_against_per_90', 'xg_prevented',
    'highlights_url', 'bio', 'notes'
  ];

  const fields = Object.keys(stats).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: 'No valid stat fields provided' });

  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  db.prepare(`
    UPDATE player_submissions
    SET ${setClause}, is_visible = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = @submission_id AND user_id = @user_id
  `).run({ ...stats, submission_id, user_id: req.user.id });

  const updated = db.prepare('SELECT * FROM player_submissions WHERE id = ?').get(submission_id);
  res.json(updated);
});

// GET /api/players/my/submissions — player sees their own submissions
router.get('/my/submissions', requireAuth, requireRole('player'), (req, res) => {
  const db = getDb();
  const submissions = db.prepare(
    'SELECT * FROM player_submissions WHERE user_id = ? ORDER BY id DESC'
  ).all(req.user.id);
  res.json(submissions);
});

module.exports = router;
