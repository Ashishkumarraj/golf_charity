require('dotenv').config();
const { getSupabase } = require('./src/config/supabase');

async function checkIds() {
  const supabase = getSupabase();
  const { data: charities } = await supabase.from('charities').select('id');
  console.log('Charity IDs in DB:', charities.map(c => c.id));
}

checkIds();
