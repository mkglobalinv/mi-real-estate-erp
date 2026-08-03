"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';

export default function PropertyRequestForm({ source = 'Property Request Form' }: { source?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    intent: 'Buy House',
    budget: '',
    location: '',
    urgency: 'Immediately',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.createRequest({
      name: formData.name,
      phone: formData.phone,
      type: formData.intent, // Fallback for old field
      intent: formData.intent as any,
      location: formData.location,
      budget: formData.budget,
      urgency: formData.urgency as any,
      notes: formData.notes
    });
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100">
        <h3 className="text-2xl font-bold text-green-800 mb-2">Request Submitted!</h3>
        <p className="text-green-700">We have received your property request. Our team will contact you shortly.</p>
        <button type="button" onClick={() => setSuccess(false)} className="mt-6 btn-primary px-6 py-2 text-sm">Submit Another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location *</label>
          <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Intent *</label>
          <select value={formData.intent} onChange={e => setFormData({...formData, intent: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <option value="Buy Land">Buy Land</option>
            <option value="Buy House">Buy House</option>
            <option value="Rent Property">Rent Property</option>
            <option value="Easy Buy">Easy Buy Scheme</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
          <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <option value="Immediately">Immediately</option>
            <option value="30 Days">30 Days</option>
            <option value="3 Months">3 Months</option>
            <option value="Just Researching">Just Researching</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range *</label>
          <input required type="text" placeholder="e.g. 50M - 100M" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Any specific requirements..."></textarea>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
