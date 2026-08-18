import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Public lookup for the /r/[serial] landing page — only ever returns the
// Agent's display name, never phone/email/bank details, and only for an
// Approved agent (so a Pending/Rejected serial can't be probed for a name).
export async function GET(request: Request, { params }: { params: Promise<{ serial: string }> }) {
  try {
    const { serial } = await params;
    const supabaseAdmin = getSupabaseAdmin();
    const { data: agent } = await supabaseAdmin.from('agents').select('full_name, status').eq('agent_serial', serial).maybeSingle();
    if (!agent || agent.status !== 'Approved') {
      return NextResponse.json({ error: 'This referral link is not currently active.' }, { status: 404 });
    }
    return NextResponse.json({ fullName: agent.full_name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
