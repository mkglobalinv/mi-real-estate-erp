"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Agent, AgentReferral, AgentCommission } from '@/lib/types';
import { Clock, XCircle, Copy, Check, PlusCircle, Users, Wallet, ArrowRight, Link2 } from 'lucide-react';

// A referral's user-facing stage. Only ever derived from agent_referrals
// and agent_commissions — both properly RLS-scoped to this agent's own
// rows (schema.sql section 34.7). Deliberately does not read
// applications/payment_proofs/customers for this: those tables have no
// RLS in this schema (an existing, pre-Agent-Portal characteristic of the
// whole app, out of scope here), so the dashboard only ever shows an Agent
// their own referral/commission stage, never another customer's status.
type Stage = 'Submitted' | 'Under Review' | 'Accepted' | 'Commission Pending' | 'Paid' | 'Rejected';

const STAGE_STYLES: Record<Stage, string> = {
  'Submitted': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  'Accepted': 'bg-teal-100 text-teal-700',
  'Commission Pending': 'bg-purple-100 text-purple-700',
  'Paid': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

const STAGE_ORDER: Stage[] = ['Submitted', 'Under Review', 'Accepted', 'Commission Pending', 'Paid', 'Rejected'];

function deriveStage(referral: AgentReferral, commission?: AgentCommission): Stage {
  if (referral.status === 'Submitted') return 'Submitted';
  if (referral.status === 'Under Review') return 'Under Review';
  if (referral.status === 'Rejected') return 'Rejected';
  // Accepted from here on
  if (commission?.status === 'Paid') return 'Paid';
  if (commission?.status === 'Pending Chairman Payment') return 'Commission Pending';
  return 'Accepted';
}

export default function AgentDashboard() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [referrals, setReferrals] = useState<AgentReferral[]>([]);
  const [commissions, setCommissions] = useState<AgentCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    api.getMyAgentProfile().then(async loadedAgent => {
      setAgent(loadedAgent);
      if (loadedAgent?.status === 'Approved') {
        const [refs, comms] = await Promise.all([api.getMyReferrals(), api.getMyCommissions()]);
        setReferrals(refs);
        setCommissions(comms);
      }
    }).finally(() => setLoading(false));
  }, []);

  const copySerial = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.agentSerial);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const referralLink = agent && typeof window !== 'undefined' ? `${window.location.origin}/r/${agent.agentSerial}` : '';

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading your profile...</div>;
  }

  if (!agent) {
    return <div className="p-8 text-gray-500">We couldn&apos;t find an agent profile linked to this account.</div>;
  }

  const getCommissionForReferral = (referralId: string) => commissions.find(c => c.referralId === referralId);

  const stageCounts = STAGE_ORDER.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as Record<Stage, number>);
  referrals.forEach(r => { stageCounts[deriveStage(r, getCommissionForReferral(r.id))]++; });

  const pendingCommissionCount = stageCounts['Accepted'];
  const eligibleAmount = commissions.filter(c => c.status === 'Pending Chairman Payment').reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidAmount = commissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.commissionAmount, 0);

  const recentReferrals = [...referrals].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] rounded-3xl p-6 md:p-10 shadow-xl text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Welcome, {agent.fullName}</h1>
          <button onClick={copySerial} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
            {agent.agentSerial}
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {agent.status === 'Pending' && (
        <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 mb-1">Application Under Review</p>
            <p className="text-sm text-gray-500">The Chairman is reviewing your application. You&apos;ll be able to submit customer referrals once approved.</p>
          </div>
        </div>
      )}

      {agent.status === 'Rejected' && (
        <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-full bg-red-100 text-red-600 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 mb-1">Application Rejected</p>
            <p className="text-sm text-gray-500">{agent.rejectionReason || 'No reason was provided.'}</p>
          </div>
        </div>
      )}

      {agent.status === 'Approved' && (
        <>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-gray-900 text-sm">My Referral Link</p>
                <p className="text-xs text-gray-500 truncate">Share this — customers can submit their own details directly.</p>
              </div>
            </div>
            <button onClick={copyReferralLink} className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors shrink-0">
              {linkCopied ? 'Copied!' : 'Copy Link'}
              {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-end mb-6">
            <Link href="/agent/add-customer" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <PlusCircle className="w-4 h-4" /> Add Customer
            </Link>
          </div>

          {/* My Earnings */}
          <h2 className="text-lg font-extrabold text-gray-900 mb-3 flex items-center gap-2"><Wallet className="w-5 h-5 text-[var(--color-primary)]" /> My Earnings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Pending Commission</p>
              <p className="text-xl font-extrabold text-gray-900">{pendingCommissionCount} referral{pendingCommissionCount === 1 ? '' : 's'}</p>
              <p className="text-xs text-gray-400 mt-0.5">Accepted, not yet eligible</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Eligible Commission</p>
              <p className="text-xl font-extrabold text-purple-700">₦{eligibleAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Awaiting Chairman payment</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Total Earned</p>
              <p className="text-xl font-extrabold text-green-700">₦{paidAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Paid to date</p>
            </div>
          </div>

          {/* My Referrals */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Users className="w-5 h-5 text-[var(--color-primary)]" /> My Referrals</h2>
            <Link href="/agent/referrals" className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>

          {referrals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center mb-8">
              <p className="text-gray-500 mb-4">No referrals yet.</p>
              <Link href="/agent/add-customer" className="btn-primary inline-block px-6 py-2.5 text-sm">Add Your First Customer</Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {STAGE_ORDER.filter(s => stageCounts[s] > 0).map(stage => (
                  <span key={stage} className={`px-3 py-1.5 rounded-full text-xs font-bold ${STAGE_STYLES[stage]}`}>
                    {stage}: {stageCounts[stage]}
                  </span>
                ))}
              </div>
              <div className="space-y-2 mb-8">
                {recentReferrals.map(r => {
                  const stage = deriveStage(r, getCommissionForReferral(r.id));
                  return (
                    <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{r.customerName}</p>
                        <p className="text-xs text-gray-500">{r.estateLocation} · {r.plotSize}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${STAGE_STYLES[stage]}`}>{stage}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">My Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
            <p className="font-bold text-gray-900">{agent.phone}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Bank</p>
            <p className="font-bold text-gray-900">{agent.bankName}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Account Number</p>
            <p className="font-bold text-gray-900">{agent.accountNumber}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Account Name</p>
            <p className="font-bold text-gray-900">{agent.accountName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
