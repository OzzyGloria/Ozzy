require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRouter = require('./routes/auth');
const paymentsRouter = require('./routes/payments');
const playersRouter = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3000;

// Stripe webhooks must receive raw body — mount before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/players', playersRouter);

// Download the standalone mockup HTML file
app.get('/download/mockup', (req, res) => {
  res.download(path.join(__dirname, 'public', 'mockup.html'), 'ScoutBase-mockup.html');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ScoutBase',
    stripe: !!process.env.STRIPE_SECRET_KEY ? 'live' : 'demo',
    timestamp: new Date().toISOString()
  });
});

// SPA fallback for clean URLs
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  const stripe = process.env.STRIPE_SECRET_KEY ? 'live Stripe' : 'DEMO MODE (no Stripe key)';
  console.log(`\nScoutBase running on http://localhost:${PORT}  [${stripe}]\n`);
});
