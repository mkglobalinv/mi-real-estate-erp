"use client";

import React, { useState } from 'react';
import { Laptop, PhoneCall, Mail, Building, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function WebsiteEnquiryPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    businessType: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.submitWebsiteEnquiry(formData);
      setIsSuccess(true);
    } catch (error) {
      alert('Failed to submit enquiry. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      {/* Header */}
      <div className="bg-[var(--color-primary-dark)] text-white py-20 px-4 mt-[-6rem] pt-[12rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Laptop className="w-16 h-16 text-[var(--color-gold)] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Want A Website Like This?</h1>
          <p className="text-xl text-green-50">
            We build modern, high-converting websites for real estate companies, businesses, organizations, and entrepreneurs.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {isSuccess ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank you for your enquiry.</h2>
              <p className="text-lg text-gray-600 mb-8">
                Our team at Reciprocal Technologies will contact you shortly to discuss your project requirements.
              </p>
              <button 
                onClick={() => { setIsSuccess(false); setFormData({name: '', phone: '', email: '', company: '', businessType: '', description: ''}); }}
                className="btn-primary inline-flex items-center gap-2"
              >
                Submit Another Enquiry <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 bg-gray-50 p-10 border-r border-gray-100 hidden md:block">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg text-[var(--color-primary)] mt-1">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Premium Design</h4>
                      <p className="text-sm text-gray-500 mt-1">Modern, responsive, and tailored to your brand.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg text-[var(--color-primary)] mt-1">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Industry Expertise</h4>
                      <p className="text-sm text-gray-500 mt-1">Specialized in Real Estate and Corporate portals.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-[var(--color-primary)]/10 p-2 rounded-lg text-[var(--color-primary)] mt-1">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Dedicated Support</h4>
                      <p className="text-sm text-gray-500 mt-1">Ongoing maintenance and technical support.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="md:w-2/3 p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Project Details</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="08012345678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="Your Company Ltd"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <select 
                      required 
                      value={formData.businessType}
                      onChange={e => setFormData({...formData, businessType: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">Select Business Type</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="E-Commerce">E-Commerce</option>
                      <option value="Corporate/Agency">Corporate / Agency</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Project Description</label>
                    <textarea 
                      required 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                      placeholder="Tell us a little bit about what you need..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? 'Submitting...' : 'Send Enquiry'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
