import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { api } from '@/lib/api';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(request: Request) {
  try {
    const { fullName, phone, email, password, bankName, accountNumber, accountName } = await request.json();

    if (!fullName || !phone || !email || !password || !bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Create the auth user. The existing handle_new_user() trigger always
    // inserts the new profiles row with role='Customer' — that's correct
    // for every other signup path in this app, so we don't touch the
    // trigger. We just override the role immediately after, the same way
    // /api/admin/create-customer-account relies on this trigger firing
    // first and only sets Customer-specific fields afterward.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone }
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message || 'Failed to create account' }, { status: 400 });
    }

    const { error: roleError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'Agent', phone })
      .eq('id', data.user.id);

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    // Agents are activated immediately on self-registration — no Chairman
    // review gate. Approved/Rejected remain valid statuses so the Chairman
    // can still deactivate a specific agent afterward (agent_referrals_
    // insert_own in schema.sql requires status='Approved', so deactivating
    // one immediately blocks further referral submissions from that agent).
    const agent = await api.saveAgent({
      profileId: data.user.id,
      fullName,
      phone,
      email,
      bankName,
      accountNumber,
      accountName,
      status: 'Approved',
      approvedAt: new Date().toISOString()
    }, supabaseAdmin);

    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (error: any) {
    console.error('Agent registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
