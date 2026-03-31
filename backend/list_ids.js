require('dotenv').config();
const { getSupabase } = require('./src/config/supabase');

async function listIds() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('SUPABASE NOT CONNECTED');
    process.exit(1);
  }
  const { data, error } = await supabase.from('charities').select('id');
  if (error) {
    console.error('ERROR FETCHING:', error);
    process.exit(1);
  }
  console.log('REAL IDs:', data);
}

listIds();
