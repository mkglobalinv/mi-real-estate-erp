import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateReferralRef } from '@/lib/generators';
import { mapAgentReferralToDb, mapDbToAgentReferral } from '@/lib/supabase-mappers';

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

// Public, unauthenticated submission from an Agent's shareable referral link
// (/r/[agentSerial]). Uses the service-role key the same way
// /api/agents/register does — no anon INSERT policy is opened on
// agent_referrals, and the Approved-agent check below is what makes the
// service-role bypass safe here.
export async function POST(request: Request) {
  try {
    const { agentSerial, customerName, customerPhone, estateLocation, plotSize, note } = await request.json();

    if (!agentSerial || !customerName || !customerPhone || !estateLocation || !plotSize) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: agent } = await supabaseAdmin.from('agents').select('id, full_name, status').eq('agent_serial', agentSerial).maybeSingle();
    if (!agent || agent.status !== 'Approved') {
      return NextResponse.json({ error: 'This referral link is not currently active.' }, { status: 404 });
    }

    const { count, error: countErr } = await supabaseAdmin.from('agent_referrals').select('*', { count: 'exact', head: true });
    if (countErr) throw new Error(countErr.message);
    const ref = generateReferralRef((count || 0) + 1);

    const mapped = mapAgentReferralToDb({
      ref, agentId: agent.id, customerName, customerPhone, estateLocation, plotSize, note,
      source: 'Referral Link'
    });
    const { data, error } = await supabaseAdmin.from('agent_referrals').insert(mapped).select().single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This customer already has an open referral pending review.' }, { status: 409 });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, referral: mapDbToAgentReferral(data), agentName: agent.full_name }, { status: 201 });
  } catch (error: any) {
    console.error('Referral link submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
