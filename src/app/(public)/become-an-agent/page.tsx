"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function BecomeAnAgentPage() {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '',
    bankName: '', accountNumber: '', accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentSerial, setAgentSerial] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setAgentSerial(data.agent.agentSerial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (agentSerial) {
    return (
      <div className="bg-gray-50 min-h-screen pb-20 pt-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
            <p className="text-gray-600 mb-1">Your Agent ID:</p>
            <p className="text-2xl font-extrabold text-[var(--color-primary)] mb-6">{agentSerial}</p>
            <p className="text-gray-600 mb-8">Your application is pending Chairman approval. You&apos;ll be able to sign in and start submitting customer referrals once approved.</p>
            <Link href="/login" className="btn-primary inline-block px-8 py-3">Go to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become an Agent</h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Refer customers to M.I. Real Estate and earn commission on completed deals.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input required type="password" minLength={8} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="At least 8 characters" />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pt-4">Bank Details — for commission payments</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Bank Name *</label>
                <input required type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Account Number *</label>
                <input required type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Account Name *</label>
                <input required type="text" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 rounded-lg border border-red-100">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Register as Agent'}
          </button>
          <p className="text-xs text-gray-400 text-center">Already registered? <Link href="/login" className="text-[var(--color-primary)] font-medium">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
