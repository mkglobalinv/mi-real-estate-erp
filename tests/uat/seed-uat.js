const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// We use the service key discovered earlier
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const roles = [
  { role: 'Chairman', email: 'uat-chairman@mirealestate.com', name: 'UAT Chairman' },
  { role: 'Director', email: 'uat-director@mirealestate.com', name: 'UAT Director' },
  { role: 'Secretary', email: 'uat-secretary@mirealestate.com', name: 'UAT Secretary' },
  { role: 'Customer Care', email: 'uat-customercare@mirealestate.com', name: 'UAT Customer Care' },
  { role: 'Admin Engineer', email: 'uat-engineer@mirealestate.com', name: 'UAT Engineer' },
  { role: 'Customer', email: 'uat-customer@mirealestate.com', name: 'UAT Customer' },
  { role: 'Social Media Director', email: 'uat-smd@mirealestate.com', name: 'UAT Social Media Director' }
];

async function seed() {
  console.log('Seeding UAT accounts...');
  for (const r of roles) {
    const password = 'UATTestPassword123!';
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    let user = usersData.users.find(u => u.email === r.email);

    if (!user) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: r.email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: r.name }
      });
      if (authError) {
        console.error(`Failed to create ${r.email}:`, authError.message);
        continue;
      }
      user = authData.user;
    }

    if (user) {
      const { error: profileError } = await supabaseAdmin.from('profiles').update({ role: r.role, full_name: r.name }).eq('id', user.id);
      if (profileError) console.error(`Failed to update profile for ${r.email}:`, profileError.message);
      else console.log(`Created & assigned role ${r.role} to ${r.email}`);
    }
  }
  
  // Seed a UAT project
  console.log('Seeding UAT Project...');
  const uatProjectId = '11111111-1111-1111-1111-111111111111';
  const { data: proj, error: projErr } = await supabaseAdmin.from('projects').upsert({
    id: uatProjectId,
    name: 'UAT Test Project',
    description: 'A deterministic project created for automated testing.',
    available_units: 10,
    starting_price: 1500000,
    easy_buy_status: true,
    active: true
  }).select().single();
  if (projErr) console.error('Project seed error:', projErr);



  console.log('UAT Seeding complete.');
}

seed();
