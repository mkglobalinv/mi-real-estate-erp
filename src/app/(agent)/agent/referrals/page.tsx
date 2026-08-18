"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AgentReferral } from '@/lib/types';
import { PlusCircle, Users } from 'lucide-react';

const STATUS_STYLES: Record<AgentReferral['status'], string> = {
  'Submitted': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-amber-100 text-amber-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
};

export default function AgentReferralsPage() {
  const [referrals, setReferrals] = useState<AgentReferral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyReferrals().then(setReferrals).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">My Referrals</h1>
          <p className="text-gray-500 mt-1">Every customer you&apos;ve referred, and where they stand.</p>
        </div>
        <Link href="/agent/add-customer" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
          <PlusCircle className="w-4 h-4" /> Add Customer
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 py-12 text-center">Loading referrals...</div>
      ) : referrals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">You haven&apos;t submitted any referrals yet.</p>
          <Link href="/agent/add-customer" className="btn-primary inline-block px-6 py-2.5 text-sm">Add Your First Customer</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {referrals.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">{r.customerName}</p>
                <p className="text-sm text-gray-500">{r.customerPhone} · {r.estateLocation} · {r.plotSize}</p>
                {r.status === 'Rejected' && r.rejectionReason && (
                  <p className="text-xs text-red-500 mt-1">Reason: {r.rejectionReason}</p>
                )}
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status]}`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
