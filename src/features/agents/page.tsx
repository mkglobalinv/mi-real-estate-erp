"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Agent } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { UserCheck, CheckCircle, XCircle, Clock, Phone, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'Pending' | 'Approved' | 'Rejected';

export default function AgentManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tab, setTab] = useState<Tab>('Pending');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getAgents(tab);
    setAgents(data);
    setLoading(false);
  };

  const handleApprove = async (agent: Agent) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await api.approveAgent(agent.id, user.id);
      toast.success(`${agent.fullName} approved.`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve agent');
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const agent = agents.find(a => a.id === rejectingId);
      await api.rejectAgent(rejectingId, rejectReason.trim(), user.id);
      toast.success(`${agent?.fullName || 'Agent'} rejected.`);
      setRejectingId(null);
      setRejectReason('');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject agent');
    }
  };

  const tabCounts: Record<Tab, { icon: typeof Clock; color: string }> = {
    Pending: { icon: Clock, color: 'amber' },
    Approved: { icon: CheckCircle, color: 'green' },
    Rejected: { icon: XCircle, color: 'red' },
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[var(--color-primary)]" /> Agent Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review Agent Portal registrations and manage referral partners.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {(Object.keys(tabCounts) as Tab[]).map(t => {
          const Icon = tabCounts[t].icon;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {t}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 py-12 text-center">Loading agents...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold text-gray-600 text-sm">Agent ID</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Contact</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Bank Details</th>
                <th className="p-4 font-bold text-gray-600 text-sm">Registered</th>
                {tab === 'Pending' && <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>}
                {tab === 'Rejected' && <th className="p-4 font-bold text-gray-600 text-sm">Reason</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agents.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm font-bold text-gray-900">{a.agentSerial}</td>
                  <td className="p-4 font-bold text-gray-900">{a.fullName}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {a.phone}</div>
                    {a.email && <div className="text-xs text-gray-400 mt-0.5">{a.email}</div>}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-gray-400" /> {a.bankName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{a.accountNumber} — {a.accountName}</div>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  {tab === 'Pending' && (
                    <td className="p-4 flex items-center gap-2">
                      <button onClick={() => handleApprove(a)} className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--color-primary-dark)]">
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button onClick={() => { setRejectingId(a.id); setRejectReason(''); }} className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </td>
                  )}
                  {tab === 'Rejected' && (
                    <td className="p-4 text-sm text-gray-600 max-w-xs">{a.rejectionReason || '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {agents.length === 0 && (
            <div className="text-center py-12 text-gray-500">No {tab.toLowerCase()} agents.</div>
          )}
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Reject Agent Application</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason. The applicant does not see this automatically in V1 — relay it directly if needed.</p>
            <textarea
              autoFocus
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-400"
              placeholder="e.g. Bank details could not be verified"
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
