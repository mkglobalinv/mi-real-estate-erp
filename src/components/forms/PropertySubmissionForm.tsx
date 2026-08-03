"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { AlertCircle, UploadCloud } from 'lucide-react';

export default function PropertySubmissionForm({ source = 'Property Submission Form' }: { source?: string }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    type: 'House',
    purpose: 'Sale',
    location: '',
    bedrooms: '',
    parking: 'Yes',
    condition: 'New',
    price: '',
    description: '',
    marketing: 'Need Marketing Assistance'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await api.createSubmission({
      name: formData.name,
      phone: formData.phone,
      type: formData.type,
      purpose: formData.purpose as any,
      location: formData.location,
      price: formData.price,
      description: formData.description,
      marketing: formData.marketing
    });
    
    // Also save as a lead to jumpstart pipeline
    await api.createLead({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      source: source,
      interest: `Sell/Rent ${formData.type}`,
      budget: formData.price,
      location: formData.location
    });

    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100">
        <h3 className="text-2xl font-bold text-green-800 mb-2">Submission Received!</h3>
        <p className="text-green-700 mb-4">Your property details have been submitted for review.</p>
        <div className="bg-white p-4 rounded-xl text-sm text-gray-600 inline-block text-left">
          <p className="flex items-start gap-2"><AlertCircle className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" /> After review, our team will contact you regarding listing requirements and marketing materials.</p>
        </div>
        <div className="mt-6">
          <button onClick={() => setSuccess(false)} className="btn-primary px-6 py-2 text-sm">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100 mb-8">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>Notice:</strong> After review, our team will contact you regarding listing requirements and marketing materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="md:col-span-2"><h3 className="font-bold border-b pb-2">Your Contact Details</h3></div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>

        {/* Property Info */}
        <div className="md:col-span-2 mt-4"><h3 className="font-bold border-b pb-2">Property Details</h3></div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <option value="House">House</option>
            <option value="Land">Land</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <select value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <option value="Sale">Sell Property</option>
            <option value="Rent">Rent Property</option>
            <option value="Joint Venture">Joint Venture</option>
            <option value="Estate Partnership">Estate Partnership</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Exact Location / Address *</label>
          <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>
        
        {formData.type === 'House' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input type="number" value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parking Space</label>
              <select value={formData.parking} onChange={e => setFormData({...formData, parking: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
                <option value="New">Newly Built</option>
                <option value="Renovated">Renovated</option>
                <option value="Fair">Fair Condition</option>
                <option value="Needs Work">Needs Work</option>
              </select>
            </div>
          </>
        )}
        
        <div className={formData.type === 'House' ? '' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asking Price (₦) *</label>
          <input required type="text" placeholder="e.g. 50,000,000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
          <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
             <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
             <p className="font-medium text-gray-700 mb-1">Click to upload property images</p>
             <p className="text-xs">PNG, JPG up to 5MB</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Do you have a property video?</label>
          <select value={formData.marketing} onChange={e => setFormData({...formData, marketing: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none">
            <option value="Yes - Photos & Video">Yes, I have photos and video</option>
            <option value="No - Need Marketing Assistance">No, I need marketing assistance</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
          <textarea required rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" placeholder="Describe the property features, nearby landmarks, etc..."></textarea>
        </div>
      </div>
      
      <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto">
        {loading ? 'Submitting...' : 'Submit Property for Review'}
      </button>
    </form>
  );
}
