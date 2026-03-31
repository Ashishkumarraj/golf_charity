const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes for finalized draws
router.get('/', async (req, res) => {
  const allDraws = await db.getDraws();
  const completed = (allDraws || []).filter(d => d.status === 'completed' || d.status === 'running');
  res.json({ draws: completed });
});

router.get('/current', async (req, res) => {
  const draw = await db.getCurrentDraw();
  if (!draw) return res.status(404).json({ error: 'No active draw' });
  res.json({ draw });
});

router.get('/:id/winners', async (req, res) => {
  const winners = await db.getWinnersByDrawId(req.params.id);
  res.json({ winners });
});

// Admin-only view for all draws queue
router.get('/admin/all', authenticateToken, async (req, res) => {
  const user = await db.getUserById(req.user.id);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const allDraws = await db.getDraws();
  res.json({ draws: allDraws });
});

module.exports = router;
