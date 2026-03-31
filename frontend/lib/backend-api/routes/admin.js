const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    const allUsers = await db.getAllUsers();
    const recentUsers = allUsers
      .filter(u => u.role === 'user')
      .slice(0, 5)
      .map(u => { const { password_hash, ...safe } = u; return safe; });

    const allDraws = await db.getDraws();
    const recentDraws = allDraws.slice(0, 3);
    const allWinners = await db.getAllWinners();
    const pendingPayouts = allWinners.filter(w => w.payout_status === 'pending' || w.payout_status === 'verified');

    res.json({
      analytics,
      recentUsers,
      recentDraws,
      pendingPayouts,
      pendingPayoutsCount: pendingPayouts.length
    });
  } catch (err) {
    console.error('Admin dash error:', err);
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    let users = await db.getAllUsers();
    
    users = users.filter(u => u.role !== 'admin' || role === 'admin');

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (role) users = users.filter(u => u.role === role);
    if (status === 'active') users = users.filter(u => u.is_active);
    if (status === 'inactive') users = users.filter(u => !u.is_active);

    const total = users.length;
    const paginated = users.slice((page - 1) * limit, page * limit);
    
    const enriched = await Promise.all(paginated.map(async u => {
        const { password_hash: _, ...safe } = u;
        const sub = await db.getSubscriptionByUserId(u.id);
        const scores = await db.getScoresByUserId(u.id);
        const charity = u.charity_id ? await db.getCharityById(u.charity_id) : null;
        return { ...safe, subscription: sub, scores_count: scores.length, charity };
    }));

    res.json({ users: enriched, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password_hash, ...userSafe } = user;
    const subscription = await db.getSubscriptionByUserId(user.id);
    const scores = await db.getScoresByUserId(user.id);
    const charity = user.charity_id ? await db.getCharityById(user.charity_id) : null;
    const winnings = await db.getUserWinnings(user.id);
    const enrichedWinnings = await Promise.all(winnings.map(async w => {
      const draw = await db.getDrawById(w.draw_id);
      return { ...w, draw };
    }));

    res.json({ user: userSafe, subscription, scores, charity, winnings: enrichedWinnings });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, is_active, role, charity_id, newPassword } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (role) updates.role = role;
    if (charity_id) updates.charity_id = charity_id;
    if (newPassword) updates.password_hash = await bcrypt.hash(newPassword, 12);

    const updated = await db.updateUser(req.params.id, updates);
    const { password_hash: _, ...safe } = updated;
    res.json({ message: 'User updated', user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// POST /api/admin/users/:id/toggle-status
router.post('/users/:id/toggle-status', async (req, res) => {
  const user = await db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await db.updateUser(req.params.id, { is_active: !user.is_active });
  const updated = await db.getUserById(req.params.id);
  const { password_hash, ...safe } = updated;
  res.json({ message: `User ${safe.is_active ? 'activated' : 'deactivated'}`, user: safe });
});

router.get('/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    const allSubs = await db.getAllSubscriptions();
    const allCharities = await db.getCharities(false);
    const allUsers = await db.getAllUsers();
    const allDraws = await db.getDraws();

    const monthlyRevenue = allSubs
      .filter(s => s.status === 'active')
      .reduce((acc, s) => {
        const month = new Date(s.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + s.amount;
        return acc;
      }, {});

    const charityStats = allCharities.map(c => ({
      id: c.id,
      name: c.name,
      total_contributed: c.total_contributed || 0,
      user_count: allUsers.filter(u => u.charity_id === c.id).length
    })).sort((a, b) => b.total_contributed - a.total_contributed);

    const drawStats = await Promise.all(allDraws.map(async d => {
        const winners = await db.getWinnersByDrawId(d.id);
        return {
            id: d.id,
            month: d.month,
            year: d.year,
            status: d.status,
            prize_pool: d.prize_pool,
            charity_contribution: d.charity_contribution,
            winner_count: winners.length,
            jackpot_rolled_over: d.jackpot_rolled_over || false
        };
    }));

    res.json({
        analytics,
        monthlyRevenue,
        charityStats,
        drawStats,
        subscriptionBreakdown: {
          monthly: allSubs.filter(s => s.plan === 'monthly' && s.status === 'active').length,
          yearly: allSubs.filter(s => s.plan === 'yearly' && s.status === 'active').length
        }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/winners', async (req, res) => {
  const { status } = req.query;
  let winners = await db.getAllWinners();
  if (status) winners = winners.filter(w => w.payout_status === status);

  const enriched = await Promise.all(winners.map(async w => {
    const user = await db.getUserById(w.user_id);
    const draw = await db.getDrawById(w.draw_id);
    return { ...w, user_name: user?.name, user_email: user?.email, draw_month: draw?.month, draw_year: draw?.year };
  }));

  res.json({ winners: enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

module.exports = router;
