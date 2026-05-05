// All amounts in pence/cents (Stripe convention)
const COMPETITION_TIERS = {
  grassroots: {
    label: 'Grassroots',
    description: 'Local, county & amateur leagues',
    amount: 999,       // £9.99
    currency: 'gbp'
  },
  semi_pro: {
    label: 'Semi-Professional',
    description: 'Regional & semi-pro leagues',
    amount: 2499,      // £24.99
    currency: 'gbp'
  },
  professional: {
    label: 'Professional',
    description: 'National leagues & lower divisions',
    amount: 4999,      // £49.99
    currency: 'gbp'
  },
  elite: {
    label: 'Elite',
    description: 'Top divisions & international',
    amount: 9999,      // £99.99
    currency: 'gbp'
  }
};

const SCOUT_PLANS = {
  monthly: {
    label: 'Monthly',
    amount: 14900,     // £149/month
    currency: 'gbp',
    interval: 'month',
    description: 'Full database access, cancel anytime'
  },
  annual: {
    label: 'Annual',
    amount: 99900,     // £999/year (~44% saving)
    currency: 'gbp',
    interval: 'year',
    description: 'Full database access — save over £790 vs monthly'
  }
};

module.exports = { COMPETITION_TIERS, SCOUT_PLANS };
