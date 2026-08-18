"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AgentCommission } from '@/lib/types';
import { Wallet, Clock, CheckCircle2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<AgentCommission['status'], string> = {
  'Pending Eligibility': 'bg-gray-100 text-gray-600',
  'Pending Chairman Payment': 'bg-amber-100 text-amber-700',
  'Paid': 'bg-green-100 text-green-700',
};

export default function AgentEarningsPage() {
  const [commissions, setCommissions] = useState<AgentCommission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    api.getMyCommissions().then(setCommissions).finally(() => setLoading(false));
  }, []);

  const totals = commissions.reduce(
    (acc, c) => {
      acc.total += c.commissionAmount;
      if (c.status === 'Paid') acc.paid += c.commissionAmount;
      else acc.pending += c.commissionAmount;
      return acc;
    },
    { total: 0, paid: 0, pending: 0 }
  );

  const handleViewReceipt = async (commission: AgentCommission) => {
    setOpeningId(commission.id);
    try {
      const res = await fetch(`/api/agents/commissions/${commission.id}/receipt-url`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open receipt');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open receipt');
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">My Earnings</h1>
      <p className="text-gray-500 mb-8">Commission from referrals that completed the full customer workflow.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total Earned</p>
          <p className="text-2xl font-extrabold text-gray-900">₦{totals.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Pending</p>
          <p className="text-2xl font-extrabold text-amber-700">₦{totals.pending.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Paid</p>
          <p className="text-2xl font-extrabold text-green-700">₦{totals.paid.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 py-12 text-center">Loading earnings...</div>
      ) : commissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No commissions yet. They appear here once a referred customer completes the full workflow and Secretary confirms eligibility.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commissions.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900">{c.customerName}</p>
                <p className="text-sm text-gray-500">
                  {c.status === 'Paid' && c.paidAt ? `Paid ${new Date(c.paidAt).toLocaleDateString()}` : 'Awaiting Chairman payment'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-[var(--color-primary)]">₦{c.commissionAmount.toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${STATUS_STYLES[c.status]}`}>
                  {c.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {c.status}
                </span>
                {c.status === 'Paid' && (
                  <button
                    onClick={() => handleViewReceipt(c)}
                    disabled={openingId === c.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-60"
                  >
                    <Eye className="w-3.5 h-3.5" /> {openingId === c.id ? 'Opening...' : 'View Receipt'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
