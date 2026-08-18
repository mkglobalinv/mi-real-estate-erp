"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function ReferralLinkPage() {
  const { serial } = useParams<{ serial: string }>();
  const [agentName, setAgentName] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [invalid, setInvalid] = useState(false);

  const [formData, setFormData] = useState({ customerName: '', customerPhone: '', estateLocation: '', plotSize: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof serial !== 'string') return;
    fetch(`/api/referrals/agent/${serial}`)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { setInvalid(true); return; }
        setAgentName(data.fullName);
      })
      .catch(() => setInvalid(true))
      .finally(() => setChecking(false));
  }, [serial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/referrals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentSerial: serial, ...formData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="bg-gray-50 min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (invalid) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Not Active</h2>
          <p className="text-gray-600 mb-8">This referral link isn&apos;t currently active. Please check the link or contact M.I. Real Estate directly.</p>
          <Link href="/" className="btn-primary inline-block px-8 py-3">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You</h2>
          <p className="text-gray-600 mb-8">Your details have been submitted. Our team will reach out to you shortly.</p>
          <Link href="/" className="btn-primary inline-block px-8 py-3">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">You&apos;ve Been Referred</h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">{agentName} invited you to explore M.I. Real Estate. Tell us a bit about what you&apos;re looking for.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input required type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({ ...formData, customerPhone: e.target.value })} className={inputClass} />
            </div>
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
            <textarea rows={3} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className={inputClass} placeholder="Anything else we should know" />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 rounded-lg border border-red-100">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
