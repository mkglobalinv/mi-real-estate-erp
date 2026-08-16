"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer, Project, EasyBuyAccount } from '@/lib/types';
import { 
  UserPlus, Search, Filter, ChevronRight, CheckCircle2, Clock, 
  X, UploadCloud, Building2, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegistrationsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', address: '', occupation: '',
    nextOfKinName: '', nextOfKinPhone: '',
    projectId: '', propertyType: '', initialDepositPaid: 'No',
    depositAmount: '', depositDate: '', depositRef: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const custData = await api.getCustomers();
    const projData = await api.getProjects();
    setCustomers(custData);
    setProjects(projData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Create Customer
      const customer = await api.saveCustomer({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        occupation: formData.occupation,
        nextOfKinName: formData.nextOfKinName,
        nextOfKinPhone: formData.nextOfKinPhone,
        status: 'Pending Review', // Needs Chairman Approval
        submittedByDirector: 'Admin Engineer'
      });

      // 2. If Initial Deposit Paid, we would technically create a Payment Proof linked to this registration
      if (formData.initialDepositPaid === 'Yes') {
        await api.savePaymentProof({
          customerId: customer.id,
          amount: Number(formData.depositAmount),
          paymentDate: formData.depositDate,
          referenceNumber: formData.depositRef,
          proofImageUrl: 'pending_upload.jpg',
          appliedTo: 'Initial Deposit',
          status: 'Pending Verification',
          notes: `Project ID: ${formData.projectId}`
        });
      }

      toast.success('Registration submitted successfully');
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit registration');
    }
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Registrations</h1>
          <p className="text-gray-500 font-medium mt-1">Director Workflow: Register customers and submit for Chairman approval.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> New Registration
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search customers..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button onClick={() => toast.error('Filter feature coming soon')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Ref & Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customer registrations found.</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{customer.fullName}</p>
                      <p className="text-[10px] text-[var(--color-primary)] font-mono font-bold mt-0.5">{customer.ref}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{customer.phone}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {new Date(customer.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        customer.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        customer.status === 'Chairman Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        customer.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {customer.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        {customer.status === 'Pending Review' && <Clock className="w-3 h-3" />}
                        {customer.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toast.error('View Profile feature coming soon')} className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">New Registration</h2>
                <p className="text-sm text-gray-500">Director registration workflow.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <form id="regForm" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Personal Details */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">1. Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                      <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none" 
                        value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                      <input required type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                      <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
                      <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Occupation</label>
                      <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Next of Kin */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">2. Next of Kin</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                      <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.nextOfKinName} onChange={e => setFormData({...formData, nextOfKinName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                      <input required type="tel" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.nextOfKinPhone} onChange={e => setFormData({...formData, nextOfKinPhone: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Property Selection */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">3. Estate Project</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Select Estate Project</label>
                      <select required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:border-[var(--color-primary)] outline-none"
                        value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                        <option value="">Select an Estate...</option>
                        {projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Initial Deposit */}
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4">4. Initial Deposit</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Initial Deposit Paid?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="deposit" value="Yes" className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={formData.initialDepositPaid === 'Yes'} onChange={e => setFormData({...formData, initialDepositPaid: e.target.value})} />
                        <span className="font-bold">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="deposit" value="No" className="w-4 h-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={formData.initialDepositPaid === 'No'} onChange={e => setFormData({...formData, initialDepositPaid: e.target.value})} />
                        <span className="font-bold">No</span>
                      </label>
                    </div>
                  </div>

                  {formData.initialDepositPaid === 'Yes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid (â‚¦)</label>
                        <input required type="number" placeholder="e.g 500000" className="w-full border border-green-200 rounded-xl px-4 py-2.5 outline-none"
                          value={formData.depositAmount} onChange={e => setFormData({...formData, depositAmount: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Payment Date</label>
                        <input required type="date" className="w-full border border-green-200 rounded-xl px-4 py-2.5 outline-none"
                          value={formData.depositDate} onChange={e => setFormData({...formData, depositDate: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Bank Reference</label>
                        <input required type="text" placeholder="e.g. TRF/YARIMAWA/001" className="w-full border border-green-200 rounded-xl px-4 py-2.5 outline-none"
                          value={formData.depositRef} onChange={e => setFormData({...formData, depositRef: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 mt-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Upload Proof (Required for Secretary Verification)</label>
                        <div className="border border-dashed border-green-300 rounded-xl p-4 text-center bg-white cursor-pointer hover:bg-green-50 transition-colors">
                          <UploadCloud className="w-6 h-6 text-green-500 mx-auto mb-1" />
                          <span className="text-xs font-bold text-green-700">Click to upload transfer screenshot</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button form="regForm" type="submit" className="w-full btn-primary py-4 text-base shadow-lg shadow-green-200">
                Submit Registration for Chairman Approval
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
