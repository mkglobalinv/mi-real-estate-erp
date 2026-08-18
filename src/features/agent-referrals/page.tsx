"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AgentReferral, Customer } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { Users, CheckCircle, XCircle, AlertTriangle, MapPin, SearchCheck, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'Submitted' | 'Accepted' | 'Rejected';

export default function AgentReferralsManager({ basePath = '/secretary', params: routeParams }: { basePath?: string, params?: any }) {
  const [referrals, setReferrals] = useState<AgentReferral[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tab, setTab] = useState<Tab>('Submitted');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    const [refs, custs] = await Promise.all([api.getAgentReferrals(tab), api.getCustomers()]);
    setReferrals(refs);
    setCustomers(custs);
    setLoading(false);
  };

  const findPossibleDuplicate = (phone: string) => customers.find(c => c.phone === phone);

  const handleAccept = async (referral: AgentReferral) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const accepted = await api.acceptReferral(referral.id, user.id);
      if (accepted.commissionAmount) {
        toast.success(`${referral.customerName} accepted. Commission of ₦${accepted.commissionAmount.toLocaleString()} is now payable by the Chairman.`);
      } else {
        toast.success(`${referral.customerName} accepted into the customer workflow.`);
        if (accepted.commissionError) toast.error(accepted.commissionError, { duration: 8000 });
      }
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept referral');
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const referral = referrals.find(r => r.id === rejectingId);
      await api.rejectReferral(rejectingId, rejectReason.trim(), user.id);
      toast.success(`Referral for ${referral?.customerName || 'customer'} rejected.`);
      setRejectingId(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject referral');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--color-primary)]" /> Agent Referrals
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review customers referred by Agents before they enter the standard registration workflow.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {(['Submitted', 'Accepted', 'Rejected'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 py-12 text-center">Loading referrals...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-600 text-sm">Agent</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Customer</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Location / Plot</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Submitted</th>
                {tab === 'Submitted' && <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>}
                {tab === 'Rejected' && <th className="p-4 font-bold text-gray-600 text-sm">Reason</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {referrals.map(r => {
                const duplicate = findPossibleDuplicate(r.customerPhone);
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-mono text-xs font-bold text-gray-900">{r.agentSerial}</p>
                      <p className="text-xs text-gray-500">{r.agentName}</p>
                      {r.source === 'Referral Link' && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">via Referral Link</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{r.customerName}</p>
                      <p className="text-xs text-gray-500">{r.customerPhone}</p>
                      {duplicate ? (
                        <Link
                          href={`${basePath}/customers/${duplicate.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
                        >
                          <AlertTriangle className="w-3 h-3" /> Existing customer ({duplicate.ref}) — Audit <SearchCheck className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <UserPlus className="w-3 h-3" /> No existing record — new customer
                        </span>
                      )}
                      {r.note && <p className="text-xs text-gray-400 mt-1 italic">&quot;{r.note}&quot;</p>}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {r.estateLocation}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{r.plotSize}</div>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    {tab === 'Submitted' && (
                      <td className="p-4 flex items-center gap-2">
                        <button onClick={() => handleAccept(r)} className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--color-primary-dark)]">
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => { setRejectingId(r.id); setRejectReason(''); }} className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </td>
                    )}
                    {tab === 'Rejected' && (
                      <td className="p-4 text-sm text-gray-600 max-w-xs">{r.rejectionReason || '—'}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {referrals.length === 0 && (
            <div className="text-center py-12 text-gray-500">No {tab.toLowerCase()} referrals.</div>
          )}
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Reject Referral</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason — the Agent will see this on their referral.</p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Duplicate of an existing customer"
            />
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
