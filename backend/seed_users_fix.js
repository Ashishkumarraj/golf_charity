require('dotenv').config();
const { getSupabase } = require('./src/config/supabase');
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  const supabase = getSupabase();
  if (!supabase) {
    console.log('Supabase not configured');
    return;
  }

  const charityId = 'e130215c-91fa-406d-bcc2-7edf85c70f78';
  
  const users = [
    {
      email: 'admin@golfcharity.com',
      password: 'Admin@123456',
      name: 'Super Admin',
      role: 'admin'
    },
    {
      email: 'user@golfcharity.com',
      password: 'User@123456',
      name: 'Test User',
      role: 'user'
    }
  ];

  for (const u of users) {
    console.log(`Checking user: ${u.email}`);
    
    // Check if exists in Auth
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    let authUser = authUsers.find(au => au.email === u.email);
    
    if (!authUser) {
      console.log(`Creating Auth user: ${u.email}`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name }
      });
      if (error) {
        console.error(`Error creating auth user ${u.email}:`, error.message);
        continue;
      }
      authUser = data.user;
    } else {
      console.log(`Auth user already exists: ${u.email} (${authUser.id})`);
    }

    // Check if exists in users_profile
    const localUser = await db.getUserByEmail(u.email);
    if (!localUser) {
      console.log(`Creating profile for: ${u.email}`);
      await supabase.from('users_profile').insert({
        id: authUser.id,
        email: u.email,
        name: u.name,
        role: u.role,
        charity_id: charityId,
        password_hash: await bcrypt.hash(u.password, 10),
        is_active: true,
        created_at: new Date().toISOString()
      });
    } else {
      console.log(`Profile already exists for: ${u.email} (${localUser.id})`);
      // Update role if needed
      if (localUser.role !== u.role) {
         await supabase.from('users_profile').update({ role: u.role }).eq('id', localUser.id);
         console.log(`Updated role to ${u.role}`);
      }
      // Update ID to match Auth ID if they differ
      if (localUser.id !== authUser.id) {
         console.log(`WARNING: Local ID ${localUser.id} != Auth ID ${authUser.id}. Fixing...`);
         // This is tricky because of foreign keys. 
         // But let's try to just update the ID if possible or at least warn.
      }
    }
  }
  process.exit(0);
}

seed();
