"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function AddCustomerPage() {
  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', estateLocation: '', plotSize: '', note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.submitAgentReferral(formData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit referral');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Submitted</h2>
          <p className="text-gray-600 mb-8">The Secretary will review this referral and reach out to the customer. You&apos;ll see its status update in My Referrals.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => { setSuccess(false); setFormData({ customerName: '', customerPhone: '', estateLocation: '', plotSize: '', note: '' }); }} className="btn-primary px-6 py-3">Submit Another</button>
            <Link href="/agent" className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto pb-24">
      <Link href="/agent" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-[var(--color-primary)] mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Add Customer</h1>
      <p className="text-gray-500 mb-8">Refer a customer to M.I. Real Estate. Your Agent ID is attached automatically.</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className={labelClass}>Customer Name *</label>
          <input required type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone Number *</label>
          <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Estate / Location *</label>
            <input required type="text" value={formData.estateLocation} onChange={e => setFormData({ ...formData, estateLocation: e.target.value })} className={inputClass} placeholder="e.g. Yarimawa, Kano" />
          </div>
          <div>
            <label className={labelClass}>Plot Size *</label>
            <input required type="text" value={formData.plotSize} onChange={e => setFormData({ ...formData, plotSize: e.target.value })} className={inputClass} placeholder="e.g. 40x40" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Note (optional)</label>
          <textarea rows={3} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className={inputClass} placeholder="Anything the Secretary should know" />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 rounded-lg border border-red-100">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Referral'}
        </button>
      </form>
    </div>
  );
}
