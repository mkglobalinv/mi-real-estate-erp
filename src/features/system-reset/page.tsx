"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

const CONFIRM_PHRASE = 'DELETE ALL DATA';

interface ResetRow {
  table_name: string;
  deleted_count: number;
}

const LABELS: Record<string, string> = {
  agent_commissions: 'Agent commissions',
  agent_referrals: 'Agent referrals',
  lead_activities: 'Lead activities',
  lead_followups: 'Lead follow-ups',
  lead_notes: 'Lead notes',
  lead_scores: 'Lead scores',
  lead_answers: 'Lead answers',
  lead_submissions: 'Campaign lead submissions',
  leads: 'CRM leads',
  allocations: 'Plot allocations',
  ledger_transactions: 'Ledger transactions (customer-linked)',
  installments: 'Installments',
  payment_proofs: 'Payment proofs',
  documents: 'Documents / Agreements',
  customer_care_tickets: 'Customer care tickets',
  easy_buy_accounts: 'Easy Buy accounts',
  applications: 'Applications',
  customers: 'Customers',
  agents: 'Agents',
  auth_users_customer_or_agent: 'Customer/Agent login accounts',
  profiles_orphaned_customer_or_agent: 'Leftover Customer/Agent profiles',
};

export default function SystemResetPage({ basePath = '/chairman' }: { basePath?: string }) {
  const [confirmText, setConfirmText] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ResetRow[] | null>(null);

  const canRun = confirmText === CONFIRM_PHRASE && !running;

  const handleReset = async () => {
    if (!canRun) return;
    setRunning(true);
    setResult(null);
    try {
      const rows = await api.resetOperationalData();
      setResult(rows);
      setConfirmText('');
      toast.success('Operational data reset complete.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed — nothing was changed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <AlertTriangle className="w-7 h-7 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900">Production Data Reset</h1>
      </div>
      <p className="text-gray-500 mb-8">
        Permanently deletes every customer, application, agent, and lead record —
        including their payments, documents, allocations, commissions, and login
        accounts — so the system starts fresh. Estate/plot configuration,
        pricing, commission rules, and all staff/admin accounts are never
        touched by this action.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
        <h2 className="font-bold text-red-800 mb-2">This cannot be undone</h2>
        <p className="text-sm text-red-700 mb-4">
          Type <span className="font-mono font-bold">{CONFIRM_PHRASE}</span> below to enable the button.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder={CONFIRM_PHRASE}
          className="w-full border-2 border-red-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-colors font-mono mb-4"
          disabled={running}
        />
        <button
          onClick={handleReset}
          disabled={!canRun}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors"
        >
          {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          {running ? 'Resetting...' : 'Reset Operational Data'}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900">Reset Result</h2>
          </div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-gray-50">
              {result.map(row => (
                <tr key={row.table_name}>
                  <td className="p-3 text-gray-700">{LABELS[row.table_name] || row.table_name}</td>
                  <td className="p-3 text-right font-bold text-gray-900">{row.deleted_count} deleted</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
