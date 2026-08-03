"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PaymentProof, Customer, EasyBuyAccount } from '@/lib/types';
import { 
  CreditCard, Search, Check, X, Eye, FileText, Calendar 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SecretaryPaymentsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<EasyBuyAccount[]>([]);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);

  // Verification Form State
  const [applyTo, setApplyTo] = useState('Month 1');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pf = await api.getPaymentProofs();
    const cs = await api.getCustomers();
    const ac = await api.getEasyBuyAccounts();
    
    setProofs(pf.filter(p => p.status === 'Pending Verification'));
    setCustomers(cs);
    setAccounts(ac);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getAccount = (id: string) => accounts.find(a => a.customerId === id);

  const handleVerify = async () => {
    if (!selectedProof) return;
    
    const account = getAccount(selectedProof.customerId);
    if (!account) {
      toast.error('Customer does not have an active Easy Buy account.');
      return;
    }

    try {
      // 1. Update Payment Proof
      await api.savePaymentProof({
        ...selectedProof,
        status: 'Verified',
        verifiedBySecretary: 'Secretary',
        verificationDate: new Date().toISOString()
      });

      // 2. Update Easy Buy Account Balance
      await api.saveEasyBuyAccount({
        ...account,
        outstandingBalance: account.outstandingBalance - selectedProof.amount
      });

      // 3. Create Immutable Ledger Entry
      await api.saveLedgerTransaction({
        date: new Date().toISOString(),
        amount: selectedProof.amount,
        type: 'Credit',
        description: `Payment applied to ${applyTo}`,
        customerId: selectedProof.customerId,
        referenceId: selectedProof.id,
        verifiedBy: 'Secretary'
      });

      // 4. Log Activity
      await api.logActivity({
        user: 'Secretary',
        module: 'Payments',
        action: `Verified Payment of ₦${selectedProof.amount} for ${getCustomer(selectedProof.customerId)?.fullName}`
      });

      toast.success('Payment verified successfully');
      setSelectedProof(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment');
    }
  };

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
                return (
                  <div 
                    key={proof.id} 
                    onClick={() => setSelectedProof(proof)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      selectedProof?.id === proof.id 
                        ? 'bg-green-50 border-[var(--color-primary)]' 
                        : 'hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-900">{customer?.fullName || 'Unknown Customer'}</p>
                      <p className="font-extrabold text-[var(--color-primary)]">â‚¦{proof.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
                      <Calendar className="w-3 h-3" /> {new Date(proof.paymentDate).toLocaleDateString()}
                    </div>
                    <p className="text-xs text-gray-500 font-mono">Ref: {proof.referenceNumber}</p>
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
                <button onClick={() => setSelectedProof(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                
                {/* Proof & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Financial Impact */}
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Amount to Verify</p>
                      <p className="text-3xl font-extrabold text-amber-700">â‚¦{selectedProof.amount.toLocaleString()}</p>
                      <p className="text-sm font-bold text-amber-600 mt-2">Ref: {selectedProof.referenceNumber}</p>
                    </div>

                    {getAccount(selectedProof.customerId) && (
                      <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold text-gray-500">Current Balance:</span>
                          <span className="text-sm font-extrabold text-gray-900">â‚¦{getAccount(selectedProof.customerId)?.outstandingBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="text-sm font-bold text-[var(--color-primary)]">New Balance (After Approval):</span>
                          <span className="text-sm font-extrabold text-[var(--color-primary)]">
                            â‚¦{((getAccount(selectedProof.customerId)?.outstandingBalance || 0) - selectedProof.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Apply Payment To (Required)</label>
                      <select 
                        value={applyTo} onChange={e => setApplyTo(e.target.value)}
                        className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-white"
                      >
                        <option value="Initial Deposit">Initial Deposit</option>
                        <option value="Month 1">Month 1</option>
                        <option value="Month 2">Month 2</option>
                        <option value="Month 3">Month 3</option>
                        <option value="Custom">Custom / Multiple Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Evidence */}
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">Payment Evidence</p>
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center relative group overflow-hidden">
                      {/* In a real app, this would be the actual image: <img src={selectedProof.proofImageUrl} className="w-full h-full object-cover" /> */}
                      <Eye className="w-10 h-10 text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-gray-500 text-sm">View Uploaded Image</p>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <button className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl">View Full Screen</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 pt-6 flex gap-4">
                  <button onClick={handleVerify} className="flex-1 btn-primary py-4 text-base shadow-lg shadow-green-200 flex justify-center items-center gap-2">
                    <Check className="w-5 h-5" /> Verify & Update Ledger
                  </button>
                  <button onClick={() => toast.error('Reject Evidence flow coming soon')} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-4 rounded-xl transition-colors border border-red-100 flex justify-center items-center gap-2">
                    <X className="w-5 h-5" /> Reject Evidence
                  </button>
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
