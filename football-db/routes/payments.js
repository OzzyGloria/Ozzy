const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const { COMPETITION_TIERS, SCOUT_PLANS } = require('../config/pricing');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function getStripe() {
  if (!STRIPE_SECRET) return null;
  return require('stripe')(STRIPE_SECRET);
}

// GET /api/payments/pricing — public pricing reference
router.get('/pricing', (req, res) => {
  res.json({ competition_tiers: COMPETITION_TIERS, scout_plans: SCOUT_PLANS });
});

// POST /api/payments/player-checkout
// Creates a Stripe Checkout session for a player stat upload
router.post('/player-checkout', requireAuth, requireRole('player'), async (req, res) => {
  const { competition_level } = req.body;
  if (!COMPETITION_TIERS[competition_level]) {
    return res.status(400).json({ error: 'Invalid competition level', valid: Object.keys(COMPETITION_TIERS) });
  }

  const db = getDb();
  const tier = COMPETITION_TIERS[competition_level];

  // Create a pending submission record to track the session
  const submission = db.prepare(`
    INSERT INTO player_submissions (user_id, competition_level, payment_status)
    VALUES (?, ?, 'pending')
  `).run(req.user.id, competition_level);
  const submissionId = submission.lastInsertRowid;

  const stripe = getStripe();
  if (!stripe) {
    // Demo mode: mark as paid immediately so dev can test the full flow
    db.prepare("UPDATE player_submissions SET payment_status='paid', is_visible=0 WHERE id=?").run(submissionId);
    return res.json({
      demo: true,
      submission_id: submissionId,
      redirect_url: `${BASE_URL}/player/upload.html?submission_id=${submissionId}`
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: tier.currency,
        product_data: {
          name: `ScoutBase — ${tier.label} Profile Upload`,
          description: tier.description
        },
        unit_amount: tier.amount
      },
      quantity: 1
    }],
    metadata: { submission_id: String(submissionId), user_id: String(req.user.id), type: 'player_upload' },
    success_url: `${BASE_URL}/player/upload.html?submission_id=${submissionId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/player/dashboard.html?cancelled=1`
  });

  db.prepare('UPDATE player_submissions SET stripe_checkout_session_id=? WHERE id=?').run(session.id, submissionId);
  res.json({ url: session.url, submission_id: submissionId });
});

// POST /api/payments/scout-checkout
// Creates a Stripe Checkout session for scout subscription
router.post('/scout-checkout', requireAuth, requireRole('scout'), async (req, res) => {
  const { plan } = req.body;
  if (!SCOUT_PLANS[plan]) {
    return res.status(400).json({ error: 'Invalid plan', valid: Object.keys(SCOUT_PLANS) });
  }

  const db = getDb();
  const planConfig = SCOUT_PLANS[plan];

  const existingActive = db.prepare(
    "SELECT id FROM scout_memberships WHERE user_id=? AND status='active'"
  ).get(req.user.id);
  if (existingActive) {
    return res.status(409).json({ error: 'You already have an active membership' });
  }

  const stripe = getStripe();
  if (!stripe) {
    // Demo mode
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (plan === 'annual' ? 12 : 1));
    db.prepare(`
      INSERT INTO scout_memberships (user_id, plan, status, current_period_end)
      VALUES (?, ?, 'active', ?)
    `).run(req.user.id, plan, periodEnd.toISOString());
    return res.json({ demo: true, redirect_url: `${BASE_URL}/scout/dashboard.html` });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: planConfig.currency,
        product_data: {
          name: `ScoutBase — ${planConfig.label} Membership`,
          description: planConfig.description
        },
        unit_amount: planConfig.amount,
        recurring: { interval: planConfig.interval }
      },
      quantity: 1
    }],
    metadata: { user_id: String(req.user.id), plan, type: 'scout_membership' },
    success_url: `${BASE_URL}/scout/dashboard.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/scout/pricing.html?cancelled=1`
  });

  db.prepare(`
    INSERT INTO scout_memberships (user_id, plan, stripe_checkout_session_id, status)
    VALUES (?, ?, ?, 'pending')
  `).run(req.user.id, plan, session.id);

  res.json({ url: session.url });
});

// POST /api/payments/webhook — Stripe sends events here
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = getStripe();
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(200).json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  const db = getDb();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { type, submission_id, user_id, plan } = session.metadata;

    if (type === 'player_upload') {
      db.prepare(`
        UPDATE player_submissions
        SET payment_status='paid', stripe_payment_intent_id=?, is_visible=0
        WHERE id=? AND user_id=?
      `).run(session.payment_intent, submission_id, user_id);
    }

    if (type === 'scout_membership') {
      const sub = session.subscription;
      db.prepare(`
        UPDATE scout_memberships SET status='active', stripe_subscription_id=?
        WHERE user_id=? AND stripe_checkout_session_id=?
      `).run(sub, user_id, session.id);
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    const status = sub.status === 'active' ? 'active' : (sub.status === 'canceled' ? 'cancelled' : 'past_due');
    db.prepare(`
      UPDATE scout_memberships SET status=?, current_period_end=?
      WHERE stripe_subscription_id=?
    `).run(status, new Date(sub.current_period_end * 1000).toISOString(), sub.id);
  }

  res.json({ received: true });
});

module.exports = router;
