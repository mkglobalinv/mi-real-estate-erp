"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AgentCommission } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { Banknote, CheckCircle, Upload, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'Pending Chairman Payment' | 'Paid';

export default function CommissionPaymentsManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [commissions, setCommissions] = useState<AgentCommission[]>([]);
  const [tab, setTab] = useState<Tab>('Pending Chairman Payment');
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getAgentCommissions(tab);
    setCommissions(data);
    setLoading(false);
  };

  const handleMarkPaid = async (commission: AgentCommission) => {
    if (!paymentReference.trim() || !receiptFile) {
      toast.error('A payment reference and receipt are both required.');
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const ext = receiptFile.name.split('.').pop();
      const timestamp = Date.now();
      const path = `${commission.id}/receipt_${timestamp}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('agent-commission-receipts').upload(path, receiptFile);
      if (uploadErr) throw new Error(`Failed to upload receipt: ${uploadErr.message}`);

      await api.markCommissionPaid(commission.id, {
        paymentReference: paymentReference.trim(),
        receiptUrl: path,
        paidBy: user?.id || ''
      });

      await api.logActivity({
        user: 'Chairman',
        module: 'Agent Commissions',
        action: `Paid commission of ₦${commission.commissionAmount.toLocaleString()} to ${commission.agentSerial} for ${commission.customerName}`
      });

      toast.success('Commission marked as paid. The Agent will see the receipt in their portal.');
      setPayingId(null);
      setPaymentReference('');
      setReceiptFile(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark commission as paid');
    } finally {
      setSaving(false);
    }
  };

  const handleViewReceipt = async (commission: AgentCommission) => {
    if (!commission.receiptUrl) return;
    const supabase = createClient();
    const { data, error } = await supabase.storage.from('agent-commission-receipts').createSignedUrl(commission.receiptUrl, 300);
    if (error || !data?.signedUrl) {
      toast.error('Failed to open receipt');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-[var(--color-primary)]" /> Commission Payments
          </h1>
          <p className="text-gray-500 text-sm mt-1">Commissions Secretary has confirmed eligible, ready for you to pay manually and record.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {(['Pending Chairman Payment', 'Paid'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
              tab === t ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'Pending Chairman Payment' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {t === 'Pending Chairman Payment' ? 'Pending Payment' : 'Paid'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse text-gray-500 py-12 text-center">Loading commissions...</div>
      ) : commissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Banknote className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-bold text-gray-500">No {tab === 'Paid' ? 'paid' : 'pending'} commissions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commissions.map(c => {
            const isPaying = payingId === c.id;
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Agent</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{c.agentSerial}</p>
                    <p className="text-xs text-gray-500">{c.agentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pay To</p>
                    <p className="font-bold text-gray-900">{c.agentBankName || '—'}</p>
                    <p className="text-xs text-gray-500">{c.agentAccountNumber} — {c.agentAccountName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer</p>
                    <p className="font-bold text-gray-900">{c.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Commission</p>
                    <p className="font-extrabold text-[var(--color-primary)] text-lg">₦{c.commissionAmount.toLocaleString()}</p>
                  </div>
                </div>

                {tab === 'Paid' && (
                  <div className="px-5 pb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 font-medium">
                    <span>Reference: {c.paymentReference || '—'}</span>
                    <span>Paid: {c.paidAt ? new Date(c.paidAt).toLocaleDateString() : '—'}</span>
                  </div>
                )}

                {isPaying && (
                  <div className="px-5 pb-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Reference <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={e => setPaymentReference(e.target.value)}
                        placeholder="e.g. bank transfer reference"
                        autoFocus
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">Payment Receipt <span className="text-red-500">*</span></label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => setReceiptFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                  {tab === 'Pending Chairman Payment' && (
                    isPaying ? (
                      <>
                        <button onClick={() => handleMarkPaid(c)} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold btn-primary disabled:opacity-60">
                          <Upload className="w-4 h-4" /> {saving ? 'Saving...' : 'Confirm Paid'}
                        </button>
                        <button onClick={() => { setPayingId(null); setPaymentReference(''); setReceiptFile(null); }} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setPayingId(c.id); setPaymentReference(''); setReceiptFile(null); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition-colors">
                        <Banknote className="w-4 h-4" /> Mark Paid
                      </button>
                    )
                  )}
                  {tab === 'Paid' && c.receiptUrl && (
                    <button onClick={() => handleViewReceipt(c)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors">
                      <Eye className="w-4 h-4" /> View Receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
