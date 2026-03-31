const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/subscriptions/me
router.get('/me', authenticateToken, async (req, res) => {
  const sub = await db.getSubscriptionByUserId(req.user.id);
  if (!sub) return res.status(404).json({ error: 'No active subscription' });
  res.json({ subscription: sub });
});

// POST /api/subscriptions/create
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { plan, amountOverride } = req.body;
    if (!plan) return res.status(400).json({ error: 'Plan is required' });

    // Mock pricing logic for demo - in real app this would use Stripe prices
    const amount = amountOverride || (plan === 'yearly' ? 29999 : 2999);
    
    const now = new Date();
    const end = new Date();
    if (plan === 'yearly') end.setFullYear(now.getFullYear() + 1);
    else end.setMonth(now.getMonth() + 1);

    const sub = await db.createSubscription({
      user_id: req.user.id,
      plan,
      amount,
      status: 'active',
      start_date: now.toISOString(),
      end_date: end.toISOString()
    });

    res.status(201).json({ message: 'Subscription created', subscription: sub });
  } catch (err) {
    console.error('Create sub error:', err);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// POST /api/subscriptions/cancel
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const sub = await db.cancelSubscription(req.user.id);
    if (!sub) return res.status(404).json({ error: 'No active subscription' });
    res.json({ message: 'Subscription cancelled', subscription: sub });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
