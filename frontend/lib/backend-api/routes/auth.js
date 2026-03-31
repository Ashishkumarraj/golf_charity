const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateTokens } = require('../middleware/auth');
const { getSupabase } = require('../config/supabase');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    let userId = null;
    let password_hash = null;
    
    // Attempt Supabase Registration if configured
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: { name: name.trim() }
      });
      if (error) {
        if (error.message.includes('already exists') || error.message.includes('registered')) {
          return res.status(409).json({ error: 'Email already registered in Supabase' });
        }
        return res.status(400).json({ error: error.message });
      }
      userId = data.user.id;
      password_hash = await bcrypt.hash(password, 12);
    } else {
      const existingUser = await db.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered locally' });
      }
      password_hash = await bcrypt.hash(password, 12);
    }

    // Synchronize to Database
    let createdUser;
    const userParams = {
      email: email.toLowerCase(),
      password_hash,
      name: name.trim(),
      charity_id: 'e130215c-91fa-406d-bcc2-7edf85c70f78' // Default charity: The R&A Foundation
    };

    if (userId) {
       createdUser = await db.createUser({ ...userParams, id: userId });
    } else {
       createdUser = await db.createUser(userParams);
    }

    const { accessToken, refreshToken } = generateTokens(createdUser.id);
    db.saveRefreshToken(refreshToken, createdUser.id);

    const { password_hash: _, ...userSafe } = createdUser;
    res.status(201).json({
      message: 'Registration successful',
      user: userSafe,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let authenticatedUser = null;
    const supabase = getSupabase();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });
      if (error) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      let localUser = await db.getUserByEmail(email.toLowerCase());
      if (!localUser) {
        localUser = await db.createUser({
          id: data.user.id,
          email: email.toLowerCase(),
          password_hash: 'managed_by_supabase',
          name: data.user.user_metadata?.name || 'Supabase User',
          charity_id: 'e130215c-91fa-406d-bcc2-7edf85c70f78'
        });
      }
      authenticatedUser = localUser;
    } else {
      const user = await db.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid && user.password_hash !== 'managed_by_supabase') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      authenticatedUser = user;
    }

    if (!authenticatedUser.is_active) {
      return res.status(403).json({ error: 'Account deactivated.' });
    }

    const { accessToken, refreshToken } = generateTokens(authenticatedUser.id);
    db.saveRefreshToken(refreshToken, authenticatedUser.id);

    const { password_hash: _, ...userSafe } = authenticatedUser;
    const subscription = await db.getSubscriptionByUserId(authenticatedUser.id);

    res.json({
      message: 'Login successful',
      user: userSafe,
      subscription,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const stored = db.findRefreshToken(refreshToken);
    if (!stored) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'golf_charity_refresh_secret_key_2024_production';
    const decoded = jwt.verify(refreshToken, refreshSecret);

    db.removeRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    db.saveRefreshToken(newRefreshToken, decoded.userId);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    db.removeRefreshToken(refreshToken);
  }
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me (validate token)
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const secret = process.env.JWT_SECRET || 'golf_charity_super_secret_jwt_key_2024_production';
    const decoded = jwt.verify(token, secret);
    const user = await db.getUserById(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash: _, ...userSafe } = user;
    const subscription = await db.getSubscriptionByUserId(user.id);
    res.json({ user: userSafe, subscription });
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;
