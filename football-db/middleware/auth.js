const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
}

function requireActiveScout(req, res, next) {
  const { getDb } = require('../db/database');
  const db = getDb();
  const membership = db.prepare(
    "SELECT status FROM scout_memberships WHERE user_id = ? AND status = 'active' LIMIT 1"
  ).get(req.user.id);
  if (!membership) {
    return res.status(403).json({ error: 'Active scout membership required', code: 'MEMBERSHIP_REQUIRED' });
  }
  next();
}

module.exports = { signToken, requireAuth, requireRole, requireActiveScout };
