const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getSupabase } = require('./supabase');

// Mock data (fallback if Supabase is not configured)
const mock_charities = [
  { id: 'c1', name: 'The R&A Foundation', description: 'Supporting golf development worldwide', logo_url: '⛳', is_active: true, total_contributed: 4250 },
  { id: 'c2', name: 'First Tee', description: 'Empowering youth through golf and character education', logo_url: '🌿', is_active: true, total_contributed: 3100 },
];

const mock_users = [
  { id: 'admin-001', email: 'admin@golfcharity.com', password_hash: bcrypt.hashSync('Admin@123456', 10), name: 'Admin User', role: 'admin', is_active: true, created_at: new Date().toISOString() }
];

const mock_subscriptions = [];
const mock_golf_scores = [];
const mock_draws = [];
const mock_draw_winners = [];
const mock_refresh_tokens = [];

const genId = (prefix = '') => `${prefix}${uuidv4()}`;

const db = {
  // --- Charity helpers ---
  getCharities: async (activeOnly = true) => {
    const supabase = getSupabase();
    if (supabase) {
      let query = supabase.from('charities').select('*');
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    return activeOnly ? mock_charities.filter(c => c.is_active) : [...mock_charities];
  },

  getCharityById: async (id) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('charities').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return mock_charities.find(c => c.id === id);
  },

  addCharity: async (data) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: created, error } = await supabase.from('charities').insert([{ ...data, is_active: true, total_contributed: 0 }]).select().single();
      if (error) throw error;
      return created;
    }
    const charity = { id: genId('c'), ...data, is_active: true, total_contributed: 0 };
    mock_charities.push(charity);
    return charity;
  },

  updateCharity: async (id, data) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: updated, error } = await supabase.from('charities').update(data).eq('id', id).select().single();
      if (error) return null;
      return updated;
    }
    const idx = mock_charities.findIndex(c => c.id === id);
    if (idx === -1) return null;
    Object.assign(mock_charities[idx], data);
    return mock_charities[idx];
  },

  // --- User helpers ---
  getUserByEmail: async (email) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('users_profile').select('*').eq('email', email.toLowerCase()).single();
      if (error) return null;
      return data;
    }
    return mock_users.find(u => u.email === email.toLowerCase());
  },

  getUserById: async (id) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('users_profile').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    }
    return mock_users.find(u => u.id === id);
  },

  getAllUsers: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('users_profile').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [...mock_users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  createUser: async (data) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: created, error } = await supabase.from('users_profile').insert([{ ...data, is_active: true, role: data.role || 'user', created_at: new Date().toISOString() }]).select().single();
      if (error) throw error;
      return created;
    }
    const user = { id: genId('u'), role: 'user', ...data, is_active: true, created_at: new Date().toISOString() };
    mock_users.push(user);
    return user;
  },

  updateUser: async (id, data) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: updated, error } = await supabase.from('users_profile').update(data).eq('id', id).select().single();
      if (error) return null;
      return updated;
    }
    const idx = mock_users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    Object.assign(mock_users[idx], data);
    return mock_users[idx];
  },

  // --- Subscription helpers ---
  getSubscriptionByUserId: async (userId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle();
      if (error) return null;
      return data;
    }
    return mock_subscriptions.find(s => s.user_id === userId && s.status === 'active');
  },

  getAllSubscriptions: async () => {
    const supabase = getSupabase();
    if (supabase) {
        const { data, error } = await supabase.from('subscriptions').select('*');
        if (error) throw error;
        return data || [];
    }
    return [...mock_subscriptions];
  },

  createSubscription: async (data) => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', data.user_id).eq('status', 'active');
      const { data: created, error } = await supabase.from('subscriptions').insert([{ ...data, created_at: new Date().toISOString() }]).select().single();
      if (error) throw error;
      return created;
    }
    const existing = mock_subscriptions.find(s => s.user_id === data.user_id);
    if (existing) existing.status = 'cancelled';
    const sub = { id: genId('sub'), ...data, created_at: new Date().toISOString() };
    mock_subscriptions.push(sub);
    return sub;
  },

  cancelSubscription: async (userId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', userId).eq('status', 'active').select().single();
      if (error) return null;
      return data;
    }
    const sub = mock_subscriptions.find(s => s.user_id === userId);
    if (sub) sub.status = 'cancelled';
    return sub;
  },

  // --- Golf scores helpers ---
  getScoresByUserId: async (userId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('golf_scores').select('*').eq('user_id', userId).order('date_played', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return mock_golf_scores.filter(s => s.user_id === userId).sort((a, b) => new Date(b.date_played) - new Date(a.date_played));
  },

  addScore: async (userId, scoreData) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: created, error } = await supabase.from('golf_scores').insert([{ user_id: userId, ...scoreData, created_at: new Date().toISOString() }]).select().single();
      if (error) throw error;
      return created;
    }
    const score = { id: genId('gs'), user_id: userId, ...scoreData, created_at: new Date().toISOString() };
    mock_golf_scores.push(score);
    return score;
  },

  deleteScore: async (scoreId, userId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('golf_scores').delete().eq('id', scoreId).eq('user_id', userId);
      return !error;
    }
    const idx = mock_golf_scores.findIndex(s => s.id === scoreId && s.user_id === userId);
    if (idx === -1) return false;
    mock_golf_scores.splice(idx, 1);
    return true;
  },

  // --- Draw helpers ---
  getDraws: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('draws').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [...mock_draws].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getCurrentDraw: async () => {
    const now = new Date();
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('draws').select('*').eq('month', now.getMonth() + 1).eq('year', now.getFullYear()).neq('status', 'completed').maybeSingle();
      if (!data) {
        const { data: latest } = await supabase.from('draws').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
        return latest;
      }
      return data;
    }
    return mock_draws.find(d => d.month === now.getMonth() + 1 && d.year === now.getFullYear() && d.status !== 'completed')
      || mock_draws.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  },

  getWinnersByDrawId: async (drawId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('draw_winners').select('*').eq('draw_id', drawId);
      if (error) throw error;
      return data || [];
    }
    return mock_draw_winners.filter(w => w.draw_id === drawId);
  },

  getAllWinners: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('draw_winners').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return [...mock_draw_winners].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getUserWinnings: async (userId) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('draw_winners').select('*').eq('user_id', userId);
      if (error) throw error;
      return data || [];
    }
    return mock_draw_winners.filter(w => w.user_id === userId);
  },

  updateWinner: async (id, data) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: updated, error } = await supabase.from('draw_winners').update(data).eq('id', id).select().single();
      if (error) return null;
      return updated;
    }
    const idx = mock_draw_winners.findIndex(w => w.id === id);
    if (idx === -1) return null;
    Object.assign(mock_draw_winners[idx], data);
    return mock_draw_winners[idx];
  },

  // --- Analytics ---
  getAnalytics: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: usersCount } = await supabase.from('users_profile').select('*', { count: 'exact', head: true }).eq('role', 'user').eq('is_active', true);
      const { data: subsCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
      const { data: revData } = await supabase.from('subscriptions').select('amount').eq('status', 'active');
      const { data: charityData } = await supabase.from('draws').select('charity_contribution');
      const { data: winnersData } = await supabase.from('draw_winners').select('prize_amount').eq('payout_status', 'paid');
      const { data: drawsCount } = await supabase.from('draws').select('*', { count: 'exact', head: true }).eq('status', 'completed');

      const totalRevenue = (revData || []).reduce((sum, s) => sum + s.amount, 0);
      const totalCharityContributions = (charityData || []).reduce((sum, d) => sum + (d.charity_contribution || 0), 0);
      const totalWinnersPaid = (winnersData || []).reduce((sum, w) => sum + w.prize_amount, 0);

      return { activeUsers: usersCount || 0, activeSubs: subsCount || 0, totalRevenue, totalCharityContributions, totalWinnersPaid, completedDraws: drawsCount || 0 };
    }
    return { activeUsers: 1, activeSubs: 1, totalRevenue: 2999, totalCharityContributions: 299, totalWinnersPaid: 404, completedDraws: 1 };
  },

  // Token management
  saveRefreshToken: (token, userId) => mock_refresh_tokens.push({ token, userId }),
  findRefreshToken: (token) => mock_refresh_tokens.find(rt => rt.token === token),
  removeRefreshToken: (token) => {
    const idx = mock_refresh_tokens.findIndex(rt => rt.token === token);
    if (idx !== -1) mock_refresh_tokens.splice(idx, 1);
  },
  
  genId
};

module.exports = db;
