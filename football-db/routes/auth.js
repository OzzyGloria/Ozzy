const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { signToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, role, organisation, scout_title } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'email, password, full_name and role are required' });
  }
  if (!['player', 'scout'].includes(role)) {
    return res.status(400).json({ error: 'role must be player or scout' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const password_hash = await bcrypt.hash(password, 12);
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, organisation, scout_title)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(email.toLowerCase().trim(), password_hash, full_name, role, organisation || null, scout_title || null);

  const user = db.prepare('SELECT id, email, full_name, role, organisation, scout_title FROM users WHERE id = ?').get(result.lastInsertRowid);
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  res.status(201).json({ token, user });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/me — return current user + membership/payment status
router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, email, full_name, role, organisation, scout_title, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let extra = {};
  if (user.role === 'scout') {
    extra.membership = db.prepare(
      'SELECT plan, status, current_period_end FROM scout_memberships WHERE user_id = ? ORDER BY id DESC LIMIT 1'
    ).get(user.id) || null;
  }
  if (user.role === 'player') {
    extra.submissions = db.prepare(
      'SELECT id, competition_level, payment_status, is_visible, position, season, created_at FROM player_submissions WHERE user_id = ? ORDER BY id DESC'
    ).all(user.id);
  }

  res.json({ ...user, ...extra });
});

module.exports = router;
