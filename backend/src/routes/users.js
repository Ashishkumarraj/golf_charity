const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me (Enriched profile)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
  
    const { password_hash: _, ...userSafe } = user;
    const subscription = await db.getSubscriptionByUserId(user.id);
    const scores = await db.getScoresByUserId(user.id);
    const charity = user.charity_id ? await db.getCharityById(user.charity_id) : null;
    const winnings = await db.getUserWinnings(user.id);
  
    const enrichedWinnings = await Promise.all(
        winnings.map(async (w) => {
            const draw = await db.getDrawById(w.draw_id);
            return { ...w, draw };
        })
    );

    res.json({ user: userSafe, subscription, scores, charity, winnings: enrichedWinnings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Update profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await db.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();

    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await db.getUserByEmail(email.toLowerCase());
      if (existingUser && existingUser.id !== user.id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updates.email = email.toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: 'Current password required' });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
      if (newPassword.length < 8) return res.status(400).json({ error: 'New password too short' });
      updates.password_hash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await db.updateUser(user.id, updates);
    const { password_hash: _, ...userSafe } = updated;
    res.json({ message: 'Profile updated', user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Update charity
router.put('/me/charity', authenticateToken, async (req, res) => {
  try {
    const { charity_id } = req.body;
    if (!charity_id) return res.status(400).json({ error: 'charity_id required' });

    const charity = await db.getCharityById(charity_id);
    if (!charity || !charity.is_active) return res.status(404).json({ error: 'Charity not found' });

    await db.updateUser(req.user.id, { charity_id });
    res.json({ message: 'Charity updated', charity });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Scores routes
router.get('/me/scores', authenticateToken, async (req, res) => {
  const scores = await db.getScoresByUserId(req.user.id);
  res.json({ scores });
});

router.post('/me/scores', authenticateToken, async (req, res) => {
    try {
        const { score, date_played } = req.body;
        const scoreNum = parseInt(score);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) return res.status(400).json({ error: 'Score 1-45' });
        if (!date_played) return res.status(400).json({ error: 'Date required' });

        const newScore = await db.addScore(req.user.id, { score: scoreNum, date_played });
        const allScores = await db.getScoresByUserId(req.user.id);
        res.status(201).json({ message: 'Score added', score: newScore, scores: allScores });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

router.delete('/me/scores/:id', authenticateToken, async (req, res) => {
    const deleted = await db.deleteScore(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
});

router.get('/me/winnings', authenticateToken, async (req, res) => {
    try {
        const winnings = await db.getUserWinnings(req.user.id);
        const enriched = await Promise.all(
            winnings.map(async (w) => {
                const draw = await db.getDrawById(w.draw_id);
                return { ...w, draw };
            })
        );
        res.json({ winners: enriched });
    } catch (err) {
        res.status(500).json({ error: 'Failed' });
    }
});

module.exports = router;
