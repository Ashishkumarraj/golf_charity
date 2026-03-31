const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/charities
router.get('/', async (req, res) => {
  const { all } = req.query;
  const charities = await db.getCharities(all !== 'true');
  res.json({ charities });
});

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  const charity = await db.getCharityById(req.params.id);
  if (!charity) {
    return res.status(404).json({ error: 'Charity not found' });
  }
  res.json({ charity });
});

module.exports = router;
