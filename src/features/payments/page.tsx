"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { PaymentProof, Customer, EasyBuyAccount, Allocation, Project, Installment } from '@/lib/types';
import {
  CreditCard, Check, X, Eye, FileText, Calendar, MapPin, CheckCircle2, XCircle, Upload, Receipt as ReceiptIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function parseAppliedTo(appliedTo: string): number | null {
  if (appliedTo === 'Initial Deposit') return 0;
  const match = appliedTo.match(/^Month (\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)$/i.test(url);
}

// payment_proofs has no receipt/document link column, so the uploaded
// receipt's documents.id is stored in notes as "receipt:<id>" once a
// payment is approved. notes only ever holds a rejection reason on
// Rejected proofs, so these two uses never collide.
const RECEIPT_NOTE_PREFIX = 'receipt:';

interface DocumentRow {
  id: string;
  title: string;
  file_url: string;
  customer_id: string;
}

type Tab = 'pending' | 'approved' | 'rejected';

export default function SecretaryPaymentsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<EasyBuyAccount[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pf, cs, ac, al, pr, inst, docs] = await Promise.all([
      api.getPaymentProofs(),
      api.getCustomers(),
      api.getEasyBuyAccounts(),
      api.getAllocations(),
      api.getProjects(),
      api.getInstallments(),
      api.getDocuments(),
    ]);

    setProofs(pf);
    setCustomers(cs);
    setAccounts(ac);
    setAllocations(al);
    setProjects(pr);
    setInstallments(inst);
    setDocuments(docs as DocumentRow[]);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getAccount = (customerId: string) => accounts.find(a => a.customerId === customerId);
  const getAllocation = (customerId: string) => allocations.find(a => a.customerId === customerId);
  const getProject = (projectId?: string) => projectId ? projects.find(p => p.id === projectId) : undefined;

  const getInstallmentForProof = (proof: PaymentProof) => {
    if (!proof.accountId) return null;
    const month = parseAppliedTo(proof.appliedTo);
    if (month === null) return null;
    return installments.find(i => i.accountId === proof.accountId && i.installmentNumber === month) || null;
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const getReceiptForProof = (proof: PaymentProof) => {
    if (!proof.notes?.startsWith(RECEIPT_NOTE_PREFIX)) return null;
    const docId = proof.notes.slice(RECEIPT_NOTE_PREFIX.length);
    return documents.find(d => d.id === docId) || null;
  };

  const handleUploadReceipt = async (proof: PaymentProof, file: File) => {
    const customer = getCustomer(proof.customerId);
    if (!customer) {
      toast.error('Could not find this customer record.');
      return;
    }

    setBusyId(proof.id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Reuse the payment-proofs bucket - it already exists and already has
      // an authenticated upload policy, rather than requiring a new bucket.
      const ext = file.name.split('.').pop();
      const fileName = `receipts/${proof.customerId}/receipt_${Date.now()}.${ext}`;
      const { error: storageError } = await supabase.storage.from('payment-proofs').upload(fileName, file);
      if (storageError) throw new Error(`Failed to upload receipt: ${storageError.message}`);
      const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
      if (!urlData?.publicUrl) throw new Error('Failed to generate a URL for the uploaded receipt.');

      const doc = await api.saveDocument({
        title: `Receipt - ${proof.appliedTo}`,
        type: 'Financial',
        customer_id: proof.customerId,
        customer_ref: customer.ref,
        file_url: urlData.publicUrl,
        generated_date: new Date().toISOString(),
        created_by: user?.id,
      }) as DocumentRow;

      // Link the receipt to this specific payment (see RECEIPT_NOTE_PREFIX).
      await api.savePaymentProof({
        ...proof,
        notes: `${RECEIPT_NOTE_PREFIX}${doc.id}`,
      });

      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Uploaded receipt for ${customer.fullName} (${proof.appliedTo})`
      });

      toast.success('Receipt uploaded. The customer can now view it under My Statements.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload receipt');
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (proof: PaymentProof) => {
    const customer = getCustomer(proof.customerId);
    const account = getAccount(proof.customerId);
    if (!account) {
      toast.error('Customer does not have an active Easy Buy account.');
      return;
    }
    const installment = getInstallmentForProof(proof);
    if (!installment) {
      toast.error('Could not match this payment to an installment. Please check the record before approving.');
      return;
    }

    setBusyId(proof.id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // saveInstallment/savePaymentProof/saveEasyBuyAccount all use upsert(),
      // which is INSERT ... ON CONFLICT DO UPDATE under the hood - Postgres
      // validates NOT NULL on the proposed row before the conflict path is
      // taken, so the full existing record must be spread in, not just the
      // changed fields.

      // 1. Mark the payment proof as verified/approved
      await api.savePaymentProof({
        ...proof,
        status: 'Verified',
      });

      // 2. Mark the matched installment as paid (only now, on approval)
      await api.saveInstallment({
        ...installment,
        status: 'Paid',
        paymentDate: proof.paymentDate,
      });

      // 3. Update Easy Buy Account balance (Total Paid up, Outstanding down)
      await api.saveEasyBuyAccount({
        ...account,
        outstandingBalance: account.outstandingBalance - proof.amount,
        amountPaid: (account.amountPaid || 0) + proof.amount,
      });

      // 4. Create immutable ledger/transaction record
      await api.saveLedgerTransaction({
        date: new Date().toISOString(),
        amount: proof.amount,
        type: 'Credit',
        description: `Payment applied to ${proof.appliedTo}`,
        customerId: proof.customerId,
        referenceId: proof.id,
        verifiedBy: user?.id,
      });

      // 5. Log activity
      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Approved payment of ₦${proof.amount.toLocaleString()} for ${customer?.fullName} (${proof.appliedTo})`
      });

      toast.success('Payment approved. Ledger and installment updated.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payment');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (proof: PaymentProof) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting this payment.');
      return;
    }

    setBusyId(proof.id);
    try {
      const customer = getCustomer(proof.customerId);

      // Only the payment proof status/reason changes - the installment and
      // account balance are left untouched, so nothing is marked paid and
      // the customer's balance does not change.
      await api.savePaymentProof({
        ...proof,
        status: 'Rejected',
        notes: rejectReason.trim(),
      });

      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Rejected payment of ₦${proof.amount.toLocaleString()} for ${customer?.fullName}: ${rejectReason.trim()}`
      });

      toast.success('Payment rejected. The customer will see the reason on their Payment Timeline.');
      cancelReject();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setBusyId(null);
    }
  };

  const pending = proofs.filter(p => p.status === 'Pending Verification');
  const approved = proofs.filter(p => p.status === 'Verified');
  const rejected = proofs.filter(p => p.status === 'Rejected');

  const tabs: { key: Tab; label: string; count: number; dot: string }[] = [
    { key: 'pending', label: 'Pending', count: pending.length, dot: 'bg-amber-400' },
    { key: 'approved', label: 'Approved', count: approved.length, dot: 'bg-green-500' },
    { key: 'rejected', label: 'Rejected', count: rejected.length, dot: 'bg-red-500' },
  ];

  const list = activeTab === 'pending' ? pending : activeTab === 'approved' ? approved : rejected;

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
            Payment Verification Center
          </h1>
          <p className="text-gray-500 font-medium mt-1">Secretary Workflow: Verify transfer proofs, apply to installments, and update ledgers.</p>
        </div>
      </div>

      {/* Tab switcher: Pending / Approved / Rejected */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-500">No {activeTab} payments.</p>
          </div>
        ) : (
          list.map(proof => {
            const customer = getCustomer(proof.customerId);
            const account = getAccount(proof.customerId);
            const allocation = getAllocation(proof.customerId);
            const project = getProject(allocation?.projectId || account?.projectId);
            const installment = getInstallmentForProof(proof);
            const isRejecting = rejectingId === proof.id;
            const busy = busyId === proof.id;
            const receipt = activeTab === 'approved' ? getReceiptForProof(proof) : null;

            return (
              <div key={proof.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer</p>
                    <p className="font-bold text-gray-900">{customer?.fullName || 'Unknown Customer'}</p>
                    <p className="text-xs text-gray-500">{customer?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Estate / Plot</p>
                    <p className="font-bold text-gray-900">{project?.name || 'Project TBD'}</p>
                    <p className="text-xs text-gray-500">{allocation?.plotNumber || 'Pending Allocation'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Installment</p>
                    <p className="font-bold text-gray-900">
                      {installment
                        ? (installment.installmentNumber === 0 ? 'Initial Deposit' : `Installment ${installment.installmentNumber}`)
                        : `${proof.appliedTo} (unmatched)`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {installment ? `Expected: ₦${installment.amountDue.toLocaleString()}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Amount Paid</p>
                    <p className="font-extrabold text-[var(--color-primary)] text-lg">₦{proof.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(proof.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="px-5 pb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500 font-medium">
                  <span>Ref: {proof.referenceNumber || '—'}</span>
                  <span>Submitted: {proof.createdAt ? new Date(proof.createdAt).toLocaleString() : '—'}</span>
                  {activeTab === 'approved' && <span className="inline-flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>}
                  {activeTab === 'rejected' && proof.notes && (
                    <span className="inline-flex items-center gap-1 text-red-600 font-bold"><XCircle className="w-3.5 h-3.5" /> Rejected: {proof.notes}</span>
                  )}
                </div>

                {isRejecting && (
                  <div className="px-5 pb-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Reason for Rejection <span className="text-red-500">*</span></label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. Amount on the transfer receipt does not match the amount entered."
                      rows={2}
                      autoFocus
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    />
                  </div>
                )}

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3">
                  {proof.proofImageUrl ? (
                    <a
                      href={proof.proofImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Proof
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-400">
                      <FileText className="w-4 h-4" /> No Proof File
                    </span>
                  )}

                  {activeTab === 'pending' && (
                    isRejecting ? (
                      <>
                        <button onClick={() => handleReject(proof)} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60">
                          <X className="w-4 h-4" /> Confirm Rejection
                        </button>
                        <button onClick={cancelReject} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleApprove(proof)} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold btn-primary disabled:opacity-60">
                          <Check className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => { setRejectingId(proof.id); setRejectReason(''); }} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )
                  )}

                  {activeTab === 'approved' && (
                    receipt ? (
                      <a
                        href={receipt.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        <ReceiptIcon className="w-4 h-4" /> View Receipt
                      </a>
                    ) : (
                      <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                        busy ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                      }`}>
                        <Upload className="w-4 h-4" /> {busy ? 'Uploading...' : 'Upload Receipt'}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                          disabled={busy}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadReceipt(proof, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
