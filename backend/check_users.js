const fs = require('fs');
require('dotenv').config();
const { getSupabase } = require('./src/config/supabase');

async function checkUsers() {
  const supabase = getSupabase();
  if (!supabase) {
    fs.writeFileSync('check_users.log', 'Supabase not configured');
    return;
  }
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    fs.writeFileSync('check_users.log', 'Error listing users: ' + error.message);
    return;
  }

  let log = 'Supabase Auth Users count: ' + users.length + '\n';
  users.forEach(u => log += '- ' + u.email + ' (' + u.id + ')\n');

  const { data: profiles, error: pError } = await supabase.from('users_profile').select('*');
  if (pError) {
    log += 'Error listing profiles: ' + pError.message + '\n';
  } else {
    log += 'users_profile table records count: ' + profiles.length + '\n';
    profiles.forEach(p => log += '- ' + (p.email || 'no-email') + ' (' + p.id + ') [' + p.role + '] [Active: ' + p.is_active + ']\n');
  }
  fs.writeFileSync('check_users.log', log);
}

checkUsers();
