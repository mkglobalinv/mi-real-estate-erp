"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, UploadCloud, CheckCircle2, AlertCircle,
  Clock, ChevronRight, XCircle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Installment {
  id: string;
  month_number: number;
  amount: number;
  due_date: string;
  status: string;
  paid_date: string | null;
}

// Latest payment_proofs submission per installment (keyed by month_number,
// 0 = Initial Deposit), used to show submission status on the Timeline
// without touching the installment's own status until Secretary approval.
interface ProofState {
  status: string;
  reason?: string;
}

function parseAppliedTo(appliedTo: string): number | null {
  if (appliedTo === 'Initial Deposit') return 0;
  const match = appliedTo.match(/^Month (\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export default function PortalPayments() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'upload'>('timeline');
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [proofsByMonth, setProofsByMonth] = useState<Record<number, ProofState>>({});
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState(0);

  // Upload form state
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    installmentId: '',
    amount: '',
    date: '',
    reference: '',
    file: null as File | null,
  });

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { setLoading(false); return; }

      // 1. Find customer by email
      const { data: customer } = await supabase
        .from('customers').select('id').eq('email', user.email).maybeSingle();
      if (!customer) { setLoading(false); return; }
      setCustomerId(customer.id);

      // 2. Find Easy Buy account
      const { data: account } = await supabase
        .from('easy_buy_accounts').select('id, total_amount, amount_paid')
        .eq('customer_id', customer.id).maybeSingle();
      if (!account) { setLoading(false); return; }

      setAccountId(account.id);
      setTotalBalance((account.total_amount ?? 0) - (account.amount_paid ?? 0));

      // 3. Load installments
      const { data: insts } = await supabase
        .from('installments')
        .select('id, month_number, amount, due_date, status, paid_date')
        .eq('account_id', account.id)
        .order('month_number', { ascending: true });

      setInstallments(insts ?? []);

      // 4. Load this account's payment submissions, so the Timeline can show
      // "Pending Verification" / "Rejected" without changing installment status.
      const { data: proofs } = await supabase
        .from('payment_proofs')
        .select('applied_to, status, notes, created_at')
        .eq('account_id', account.id)
        .order('created_at', { ascending: false });

      const byMonth: Record<number, ProofState> = {};
      for (const p of proofs ?? []) {
        const month = parseAppliedTo(p.applied_to);
        if (month === null) continue;
        // Keep only the latest submission per installment (list is already
        // newest-first), so a resubmission after a rejection takes over.
        if (!(month in byMonth)) {
          byMonth[month] = { status: p.status, reason: p.notes ?? undefined };
        }
      }
      setProofsByMonth(byMonth);
    } catch (err: unknown) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId || !customerId || !uploadForm.installmentId || !uploadForm.amount || !uploadForm.date) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!uploadForm.file) {
      toast.error('Please upload your payment proof (JPEG, PNG or PDF).');
      return;
    }
    const installment = installments.find(i => i.id === uploadForm.installmentId);
    if (!installment) {
      toast.error('Selected installment could not be found. Please refresh and try again.');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();

      // Upload file to Supabase Storage (required - proof_image_url is NOT NULL)
      const ext = uploadForm.file.name.split('.').pop();
      const fileName = `${customerId}/proof_${Date.now()}.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, uploadForm.file);
      if (storageError) {
        throw new Error(`Failed to upload proof: ${storageError.message}`);
      }
      const { data: urlData } = supabase.storage
        .from('payment-proofs').getPublicUrl(fileName);
      const fileUrl = urlData?.publicUrl ?? '';
      if (!fileUrl) {
        throw new Error('Failed to generate a URL for the uploaded proof.');
      }

      const appliedTo = installment.month_number === 0 ? 'Initial Deposit' : `Month ${installment.month_number}`;

      await api.savePaymentProof({
        customerId,
        accountId,
        amount: parseFloat(uploadForm.amount),
        paymentDate: uploadForm.date,
        referenceNumber: uploadForm.reference,
        proofImageUrl: fileUrl,
        appliedTo,
        status: 'Pending Verification',
      });

      toast.success('Payment proof submitted! It will be verified within 24 hours.');
      setUploadForm({ installmentId: '', amount: '', date: '', reference: '', file: null });
      setActiveTab('timeline');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === 'Paid') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'Pending Verification') return <Clock className="w-4 h-4 text-amber-500" />;
    if (status === 'Rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <AlertCircle className="w-4 h-4 text-gray-400" />;
  };

  const statusClass = (status: string) => {
    if (status === 'Paid') return 'text-green-700 bg-green-100';
    if (status === 'Pending Verification') return 'text-amber-700 bg-amber-100';
    if (status === 'Rejected') return 'text-red-700 bg-red-100';
    if (status === 'Overdue') return 'text-red-700 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-500">
        <div className="h-6 w-6 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        Loading payment data...
      </div>
    );
  }

  // An installment already has a submission pending/rejected if its most
  // recent proof isn't superseded by the installment itself being Paid.
  const pendingInstallments = installments.filter(
    i => i.status !== 'Paid' && proofsByMonth[i.month_number]?.status !== 'Pending Verification'
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl">
            <Wallet className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Payments</h1>
            <p className="text-gray-500 text-sm">
              Track your Easy Buy installments and upload payment proofs.
            </p>
          </div>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Payment Timeline
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upload Proof
          </button>
        </div>
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">Installment Ledger</h2>
            <span className="text-sm text-red-600 font-bold">
              Outstanding: ₦{totalBalance.toLocaleString()}
            </span>
          </div>
          {installments.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No installment schedule found for your account. Please contact support.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <th className="p-4 font-bold">Installment</th>
                    <th className="p-4 font-bold">Due Date</th>
                    <th className="p-4 font-bold">Amount</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Date Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {installments.map((inst) => {
                    const proof = proofsByMonth[inst.month_number];
                    const displayStatus = inst.status === 'Paid' ? 'Paid' : (proof?.status || inst.status);
                    return (
                      <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-800">
                          {inst.month_number === 0 ? 'Initial Deposit' : `Installment ${inst.month_number}`}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{inst.due_date}</td>
                        <td className="p-4 font-bold text-gray-900">₦{Number(inst.amount).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${statusClass(displayStatus)}`}>
                            {statusIcon(displayStatus)}
                            {displayStatus}
                          </span>
                          {displayStatus === 'Rejected' && proof?.reason && (
                            <p className="text-xs text-red-500 font-medium mt-1 max-w-xs">{proof.reason}</p>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 text-sm">
                          {inst.paid_date ? new Date(inst.paid_date).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">Submit Payment Proof</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Apply Payment To <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={uploadForm.installmentId}
                onChange={e => setUploadForm(f => ({ ...f, installmentId: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select installment...</option>
                {pendingInstallments.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.month_number === 0 ? 'Initial Deposit' : `Installment ${inst.month_number}`}
                    {' '} — ₦{Number(inst.amount).toLocaleString()} (Due: {inst.due_date})
                  </option>
                ))}
              </select>
              {pendingInstallments.length === 0 && (
                <p className="text-xs text-gray-400 mt-1.5">No installments are currently awaiting payment.</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Amount Paid (₦) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  placeholder="e.g. 187500"
                  value={uploadForm.amount}
                  onChange={e => setUploadForm(f => ({ ...f, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Date of Payment <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={uploadForm.date}
                  onChange={e => setUploadForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Bank Reference / Description</label>
              <input
                type="text"
                placeholder="e.g. TRF/230519/FBNA"
                value={uploadForm.reference}
                onChange={e => setUploadForm(f => ({ ...f, reference: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Upload Payment Proof (JPEG, PNG or PDF) <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors bg-gray-50">
                <UploadCloud className="w-7 h-7 text-gray-400 mb-1" />
                <span className="text-sm text-gray-500">
                  {uploadForm.file ? uploadForm.file.name : 'Click to upload or drag and drop'}
                </span>
                <span className="text-xs text-gray-400">Maximum file size: 5MB</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] ?? null }))}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {uploading ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Submitting...</>
              ) : (
                <><ChevronRight className="w-4 h-4" /> Submit Payment for Verification</>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Payments are verified within 24 hours. A receipt will be automatically generated.
            </p>
          </div>

          {/* Bank Details */}
          <div className="mx-6 mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <h3 className="font-bold text-blue-800 text-sm mb-3">Company Bank Details</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex justify-between"><span className="font-medium">Bank Name</span><span>Jaiz Bank Plc</span></div>
              <div className="flex justify-between"><span className="font-medium">Account Name</span><span>M.I. Real Estate &amp; Gen Ent Ltd</span></div>
              <div className="flex justify-between"><span className="font-medium">Account Number</span><span className="font-bold tracking-wider">0123456789</span></div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
