"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Calendar, CheckSquare, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomerProfilePage({ params, readOnly = false }: { params: { id: string }, readOnly?: boolean }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [params.id]);

  const loadCustomer = async () => {
    try {
      const allCustomers = await api.getCustomers();
      const c = allCustomers.find(c => c.id === params.id) || null;
      setCustomer(c);
    } catch (err: any) {
      toast.error('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading Customer Profile...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-red-500 font-bold">Customer not found.</div>;
  }

  return (
    <div className="pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-[var(--color-primary)]" />
            Customer 360: {customer.fullName}
          </h1>
          <p className="text-gray-500 font-medium mt-1">Ref: {customer.ref} &bull; Status: {customer.status}</p>
        </div>
        {!readOnly && (
          <button onClick={() => toast.error('Create Application not implemented')} className="btn-primary flex items-center gap-2">
            <FileText className="w-5 h-5" /> Create Application
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Profile Details</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                <p className="font-medium text-gray-900">{customer.phone}</p>
              </div>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                  <p className="font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Address</p>
                  <p className="font-medium text-gray-900">{customer.address}</p>
                </div>
              </div>
            )}
            {customer.occupation && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Occupation</p>
                  <p className="font-medium text-gray-900">{customer.occupation}</p>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-gray-900 mb-4 mt-8 border-b pb-1">Next of Kin</h3>
          <div className="space-y-3">
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Name:</span> {customer.nextOfKinName || 'N/A'}</p>
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Phone:</span> {customer.nextOfKinPhone || 'N/A'}</p>
            <p className="text-sm"><span className="font-bold text-gray-500 mr-2">Relation:</span> {customer.nextOfKinRelationship || 'N/A'}</p>
          </div>
        </div>

        {/* Applications & Documents */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900">Applications & Allocations</h2>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>No applications found for this customer.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900">Documents</h2>
              {!readOnly && (
                <button onClick={() => toast.error('Document Upload not implemented')} className="text-[var(--color-primary)] font-bold text-sm flex items-center gap-1 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors">
                  <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
              )}
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>No documents uploaded yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
