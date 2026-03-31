const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golf_charity_super_secret_jwt_key_2024_production');
    const user = await db.getUserById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = { ...user };
    delete req.user.password_hash;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const generateTokens = (userId) => {
  const secret = process.env.JWT_SECRET || 'golf_charity_super_secret_jwt_key_2024_production';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'golf_charity_refresh_secret_key_2024_production';

  const accessToken = jwt.sign({ userId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

  return { accessToken, refreshToken };
};

module.exports = { authenticateToken, requireAdmin, generateTokens };

