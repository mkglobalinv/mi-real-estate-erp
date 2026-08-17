"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { PaymentProof, Customer, EasyBuyAccount, Allocation, Project, Installment } from '@/lib/types';
import {
  CreditCard, Check, X, Eye, FileText, Calendar, MapPin
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

export default function SecretaryPaymentsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<EasyBuyAccount[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pf, cs, ac, al, pr, inst] = await Promise.all([
      api.getPaymentProofs(),
      api.getCustomers(),
      api.getEasyBuyAccounts(),
      api.getAllocations(),
      api.getProjects(),
      api.getInstallments(),
    ]);

    setProofs(pf.filter(p => p.status === 'Pending Verification'));
    setCustomers(cs);
    setAccounts(ac);
    setAllocations(al);
    setProjects(pr);
    setInstallments(inst);
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

  const closeWorkspace = () => {
    setSelectedProof(null);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleApprove = async () => {
    if (!selectedProof) return;

    const customer = getCustomer(selectedProof.customerId);
    const account = getAccount(selectedProof.customerId);
    if (!account) {
      toast.error('Customer does not have an active Easy Buy account.');
      return;
    }
    const installment = getInstallmentForProof(selectedProof);
    if (!installment) {
      toast.error('Could not match this payment to an installment. Please check the record before approving.');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Mark the payment proof as verified. saveInstallment/savePaymentProof/
      // saveEasyBuyAccount all use upsert(), which is INSERT ... ON CONFLICT DO
      // UPDATE under the hood - Postgres validates NOT NULL on the proposed row
      // before the conflict path is taken, so the full existing record must be
      // spread in, not just the changed fields.
      await api.savePaymentProof({
        ...selectedProof,
        status: 'Verified',
      });

      // 2. Mark the matched installment as paid (only now, on approval)
      await api.saveInstallment({
        ...installment,
        status: 'Paid',
        paymentDate: selectedProof.paymentDate,
      });

      // 3. Update Easy Buy Account balance
      await api.saveEasyBuyAccount({
        ...account,
        outstandingBalance: account.outstandingBalance - selectedProof.amount,
        amountPaid: (account.amountPaid || 0) + selectedProof.amount,
      });

      // 4. Create immutable ledger entry
      await api.saveLedgerTransaction({
        date: new Date().toISOString(),
        amount: selectedProof.amount,
        type: 'Credit',
        description: `Payment applied to ${selectedProof.appliedTo}`,
        customerId: selectedProof.customerId,
        referenceId: selectedProof.id,
        verifiedBy: user?.id,
      });

      // 5. Log activity
      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Approved payment of ₦${selectedProof.amount.toLocaleString()} for ${customer?.fullName} (${selectedProof.appliedTo})`
      });

      toast.success('Payment approved and ledger updated.');
      closeWorkspace();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payment');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProof) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejecting this payment.');
      return;
    }

    setBusy(true);
    try {
      const customer = getCustomer(selectedProof.customerId);

      // Only the payment proof status/reason changes - the installment and
      // account balance are left untouched, so nothing is marked paid.
      await api.savePaymentProof({
        ...selectedProof,
        status: 'Rejected',
        notes: rejectReason.trim(),
      });

      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Rejected payment of ₦${selectedProof.amount.toLocaleString()} for ${customer?.fullName}: ${rejectReason.trim()}`
      });

      toast.success('Payment rejected. The customer will see the reason on their Payment Timeline.');
      closeWorkspace();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setBusy(false);
    }
  };

  const selectedInstallment = selectedProof ? getInstallmentForProof(selectedProof) : null;
  const selectedAllocation = selectedProof ? getAllocation(selectedProof.customerId) : null;
  const selectedAccount = selectedProof ? getAccount(selectedProof.customerId) : null;
  const selectedProject = getProject(selectedAllocation?.projectId || selectedAccount?.projectId);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Pending Verification List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-extrabold text-gray-900">Pending ({proofs.length})</h2>
          </div>

          <div className="divide-y divide-gray-50 h-[600px] overflow-y-auto custom-scrollbar">
            {proofs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="font-bold">No pending proofs.</p>
              </div>
            ) : (
              proofs.map(proof => {
                const customer = getCustomer(proof.customerId);
                const allocation = getAllocation(proof.customerId);
                const account = getAccount(proof.customerId);
                const project = getProject(allocation?.projectId || account?.projectId);
                return (
                  <div
                    key={proof.id}
                    onClick={() => { setSelectedProof(proof); setShowRejectForm(false); setRejectReason(''); }}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      selectedProof?.id === proof.id
                        ? 'bg-green-50 border-[var(--color-primary)]'
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-900">{customer?.fullName || 'Unknown Customer'}</p>
                      <p className="font-extrabold text-[var(--color-primary)]">₦{proof.amount.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mb-1">{project?.name || 'Project TBD'} · {proof.appliedTo}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
                      <Calendar className="w-3 h-3" /> {new Date(proof.paymentDate).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">Ref: {proof.referenceNumber || '—'}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Verification Workspace */}
        <div className="lg:col-span-2">
          {selectedProof ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">

              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-extrabold text-gray-900">Verify Payment</h2>
                <button onClick={closeWorkspace} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 md:p-8 space-y-8">

                {/* Customer / Property Context */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer</p>
                    <p className="font-bold text-gray-900 text-sm">{getCustomer(selectedProof.customerId)?.fullName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Project</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedProject?.name || 'TBD'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3" /> Plot Number</p>
                    <p className="font-bold text-gray-900 text-sm">{selectedAllocation?.plotNumber || 'Pending Allocation'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Installment</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedInstallment
                        ? (selectedInstallment.installmentNumber === 0 ? 'Initial Deposit' : `Installment ${selectedInstallment.installmentNumber}`)
                        : `${selectedProof.appliedTo} (unmatched)`}
                    </p>
                  </div>
                </div>

                {/* Proof & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Financial Impact */}
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Amount to Verify</p>
                      <p className="text-3xl font-extrabold text-amber-700">₦{selectedProof.amount.toLocaleString()}</p>
                      <p className="text-sm font-bold text-amber-600 mt-2">Ref: {selectedProof.referenceNumber || '—'}</p>
                      <p className="text-xs text-amber-500 mt-1">Paid on {new Date(selectedProof.paymentDate).toLocaleDateString()}</p>
                    </div>

                    {selectedAccount && (
                      <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-gray-500">Current Balance:</span>
                          <span className="text-sm font-extrabold text-gray-900">₦{selectedAccount.outstandingBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-sm font-bold text-[var(--color-primary)]">New Balance (After Approval):</span>
                          <span className="text-sm font-extrabold text-[var(--color-primary)]">
                            ₦{(selectedAccount.outstandingBalance - selectedProof.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Applied To (as submitted by customer)</label>
                      <div className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-medium">
                        {selectedProof.appliedTo}
                      </div>
                    </div>
                  </div>

                  {/* Right: Evidence */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Payment Evidence</p>
                    {selectedProof.proofImageUrl && isImageUrl(selectedProof.proofImageUrl) ? (
                      <a
                        href={selectedProof.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-64 relative group overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedProof.proofImageUrl} alt="Payment proof" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">View Full Screen</span>
                        </div>
                      </a>
                    ) : selectedProof.proofImageUrl ? (
                      <a
                        href={selectedProof.proofImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center hover:border-[var(--color-primary)] transition-colors"
                      >
                        <Eye className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="font-bold text-gray-500 text-sm">Open Uploaded Proof (PDF)</p>
                      </a>
                    ) : (
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center">
                        <AlertMissingProof />
                      </div>
                    )}
                  </div>
                </div>

                {/* Reject reason form */}
                {showRejectForm && (
                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Rejection <span className="text-red-500">*</span></label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. Amount on the transfer receipt does not match the amount entered."
                      rows={3}
                      className="w-full border-gray-200 rounded-xl px-4 py-3 bg-white border focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-100 pt-6 flex gap-4">
                  {showRejectForm ? (
                    <>
                      <button onClick={handleReject} disabled={busy} className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-60">
                        <X className="w-5 h-5" /> Confirm Rejection
                      </button>
                      <button onClick={() => { setShowRejectForm(false); setRejectReason(''); }} disabled={busy} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-4 rounded-xl transition-colors">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleApprove} disabled={busy} className="flex-1 btn-primary py-4 text-base shadow-lg shadow-green-200 flex justify-center items-center gap-2 disabled:opacity-60">
                        <Check className="w-5 h-5" /> Approve & Update Ledger
                      </button>
                      <button onClick={() => setShowRejectForm(true)} disabled={busy} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-4 rounded-xl transition-colors border border-red-100 flex justify-center items-center gap-2">
                        <X className="w-5 h-5" /> Reject Payment
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 h-full flex flex-col items-center justify-center p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">No Proof Selected</h2>
              <p className="text-gray-500 font-medium max-w-sm">Select a pending payment proof from the list on the left to verify it and update the customer's ledger.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function AlertMissingProof() {
  return (
    <>
      <FileText className="w-10 h-10 text-gray-300 mb-2" />
      <p className="font-bold text-gray-400 text-sm">No proof file on this record</p>
    </>
  );
}
