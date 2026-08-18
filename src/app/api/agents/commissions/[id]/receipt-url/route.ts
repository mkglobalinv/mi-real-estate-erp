import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
  }
  return createServiceClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// The agent-commission-receipts bucket is private, and Agents deliberately
// have no storage.objects SELECT policy on it (see schema.sql section
// 34.7) — an Agent viewing their own paid-commission receipt has to go
// through this route instead of a direct client-side signed-URL call. The
// ownership check below (commission belongs to the calling agent) is what
// makes the service-role bypass safe: nobody gets a signed URL for a
// commission that isn't theirs.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: agent } = await supabase.from('agents').select('id').eq('profile_id', user.id).single();
    if (!agent) {
      return NextResponse.json({ error: 'No agent profile found for this account' }, { status: 403 });
    }

    const { data: commission } = await supabase.from('agent_commissions').select('*').eq('id', id).eq('agent_id', agent.id).maybeSingle();
    if (!commission || commission.status !== 'Paid' || !commission.receipt_url) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: signed, error } = await supabaseAdmin.storage
      .from('agent-commission-receipts')
      .createSignedUrl(commission.receipt_url, 300);

    if (error || !signed?.signedUrl) {
      return NextResponse.json({ error: error?.message || 'Failed to generate receipt link' }, { status: 500 });
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
