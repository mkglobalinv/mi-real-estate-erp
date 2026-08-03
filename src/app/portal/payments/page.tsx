"use client";

import React, { useState } from 'react';
import { 
  Wallet, UploadCloud, CheckCircle2, AlertCircle, 
  Clock, Download, ChevronRight
} from 'lucide-react';

export default function PortalPayments() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'upload'>('timeline');

  // Mock data
  const installments = [
    { id: 1, month: 'Initial Deposit', amount: 500000, due: '2025-01-15', status: 'Paid', datePaid: '2025-01-10' },
    { id: 2, month: 'Installment 1', amount: 187500, due: '2025-02-15', status: 'Paid', datePaid: '2025-02-14' },
    { id: 3, month: 'Installment 2', amount: 187500, due: '2025-03-15', status: 'Paid', datePaid: '2025-03-10' },
    { id: 4, month: 'Installment 3', amount: 187500, due: '2025-04-15', status: 'Paid', datePaid: '2025-04-15' },
    { id: 5, month: 'Installment 4', amount: 187500, due: '2025-05-15', status: 'Pending Verification', datePaid: '2025-05-12' },
    { id: 6, month: 'Installment 5', amount: 187500, due: '2025-06-15', status: 'Upcoming', datePaid: null },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Payments</h1>
          <p className="text-gray-500 font-medium mt-1">Track your Easy Buy installments and upload payment proofs.</p>
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
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

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-extrabold text-gray-900">Installment Ledger</h2>
            <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
              Outstanding: ₦1,750,000
            </span>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-6">Installment</th>
                  <th className="p-4 md:p-6">Due Date</th>
                  <th className="p-4 md:p-6">Amount</th>
                  <th className="p-4 md:p-6">Status</th>
                  <th className="p-4 md:p-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {installments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 md:p-6">
                      <p className="font-bold text-gray-900">{inst.month}</p>
                      {inst.datePaid && <p className="text-[10px] text-gray-500 font-mono mt-0.5">Paid: {inst.datePaid}</p>}
                    </td>
                    <td className="p-4 md:p-6 font-medium text-gray-600">{inst.due}</td>
                    <td className="p-4 md:p-6 font-bold text-gray-900">₦{inst.amount.toLocaleString()}</td>
                    <td className="p-4 md:p-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        inst.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        inst.status === 'Pending Verification' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {inst.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                        {inst.status === 'Pending Verification' && <Clock className="w-3 h-3" />}
                        {inst.status === 'Upcoming' && <AlertCircle className="w-3 h-3" />}
                        {inst.status}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      {inst.status === 'Paid' ? (
                        <button className="text-[var(--color-primary)] hover:text-green-800 transition-colors inline-flex items-center gap-1 text-sm font-bold">
                          <Download className="w-4 h-4" /> <span className="hidden sm:inline">Receipt</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-sm font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-4">Submit Payment Proof</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Apply Payment To</label>
                  <select className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-gray-50">
                    <option>Installment 5 (Due: 15th Jun 2025)</option>
                    <option>Installment 6 (Due: 15th Jul 2025)</option>
                    <option>Custom Amount / Multi-Month</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount Paid (₦)</label>
                    <input type="number" placeholder="e.g. 187500" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date of Payment</label>
                    <input type="date" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-gray-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bank Reference / Description</label>
                  <input type="text" placeholder="e.g. TRF/JAMILU/YARIMAWA" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Screenshot (JPEG, PNG, PDF)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer bg-white">
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="btn-primary w-full py-4 text-base shadow-lg shadow-green-200">
                    Submit Payment for Verification
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Payments are verified within 24 hours. A receipt will be automatically generated.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <h3 className="font-extrabold mb-4 relative z-10">Company Bank Details</h3>
               <div className="space-y-4 relative z-10">
                 <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                   <p className="text-xs font-bold text-gray-400 uppercase mb-1">Bank Name</p>
                   <p className="font-bold">Jaiz Bank Plc</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                   <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Name</p>
                   <p className="font-bold">M.I. Real Estate & Gen Ent Ltd</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                   <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Number</p>
                   <p className="font-mono text-xl tracking-wider font-extrabold text-[var(--color-gold)]">0123456789</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
