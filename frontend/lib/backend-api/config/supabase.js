const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let isValidKey = true;
if (supabaseKey && !supabaseKey.trim().startsWith('ey')) {
  console.warn('⚠️ WARNING: Your SUPABASE_SERVICE_KEY in .env is NOT a valid Supabase JWT Token. Make sure you copied the long "service_role" secret key, not a publishable ID.');
  isValidKey = false;
}

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co' || !isValidKey) {
  console.warn('⚠️ Supabase config is incomplete or invalid. Using exclusively in-memory mock database.');
}

let supabase = null;

const getSupabase = () => {
  if (!supabase && supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co' && isValidKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabase;
};

module.exports = { getSupabase };
