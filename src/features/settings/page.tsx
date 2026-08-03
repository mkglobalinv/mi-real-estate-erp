"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { OfficeInfo } from '@/lib/types';
import { Save } from 'lucide-react';

export default function AdminSettingsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getOfficeInfo().then(setOffice);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!office) return;
    setLoading(true);
    await api.updateOfficeInfo(office);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!office) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500">Manage global office information and contact details.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Office Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
            <textarea 
              rows={3} 
              value={office.address} 
              onChange={e => setOffice({...office, address: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Phone</label>
            <input 
              type="text" 
              value={office.phone1} 
              onChange={e => setOffice({...office, phone1: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Phone</label>
            <input 
              type="text" 
              value={office.phone2} 
              onChange={e => setOffice({...office, phone2: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input 
              type="text" 
              value={office.whatsapp} 
              onChange={e => setOffice({...office, whatsapp: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email</label>
            <input 
              type="email" 
              value={office.email1} 
              onChange={e => setOffice({...office, email1: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed Link</label>
            <input 
              type="url" 
              value={office.mapsLink} 
              onChange={e => setOffice({...office, mapsLink: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <input 
              type="text" 
              value={office.businessHours} 
              onChange={e => setOffice({...office, businessHours: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            />
          </div>
        </div>

        <div className="pt-6 flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {success && <span className="text-green-600 font-bold">Settings saved successfully!</span>}
        </div>
      </form>
    </div>
  );
}
