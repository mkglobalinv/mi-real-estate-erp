"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Agent } from '@/lib/types';
import { Clock, CheckCircle2, XCircle, Copy, Check, PlusCircle } from 'lucide-react';

export default function AgentDashboard() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getMyAgentProfile().then(setAgent).finally(() => setLoading(false));
  }, []);

  const copySerial = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.agentSerial);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading your profile...</div>;
  }

  if (!agent) {
    return <div className="p-8 text-gray-500">We couldn&apos;t find an agent profile linked to this account.</div>;
  }

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

      {agent.status === 'Approved' && (
        <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-full bg-green-100 text-green-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900 mb-1">Approved Agent</p>
            <p className="text-sm text-gray-500 mb-4">You&apos;re approved and can start referring customers.</p>
            <Link href="/agent/add-customer" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <PlusCircle className="w-4 h-4" /> Add Customer
            </Link>
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

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-8">
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
