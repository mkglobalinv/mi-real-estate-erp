"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { Users, Search, Filter, ChevronRight, CheckCircle2, Clock, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomersPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', occupation: '', nokName: '', nokPhone: '', nokRelation: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const custs = await api.getCustomers();
    setCustomers(custs);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveCustomer({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        occupation: formData.occupation,
        nextOfKinName: formData.nokName,
        nextOfKinPhone: formData.nokPhone,
        nextOfKinRelationship: formData.nokRelation,
        status: 'Active'
      });
      toast.success('Customer registered successfully!');
      setIsFormOpen(false);
      setFormData({ fullName: '', email: '', phone: '', address: '', occupation: '', nokName: '', nokPhone: '', nokRelation: '' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register customer');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchTerm === '' || 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm);
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--color-primary)]" />
            Customer Directory
          </h1>
          <p className="text-gray-500 font-medium mt-1">Master list of all registered customers across operations.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2 px-4 py-2 font-bold shadow-sm">
          <PlusCircle className="w-5 h-5" /> Register Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Chairman Approved">Chairman Approved</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{cust.fullName}</p>
                      <p className="text-[10px] text-[var(--color-primary)] font-mono font-bold mt-0.5">{cust.ref}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{cust.phone}</p>
                      <p className="text-xs text-gray-500">{cust.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        cust.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        cust.status === 'Chairman Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        cust.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {cust.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        {cust.status === 'Pending Review' && <Clock className="w-3 h-3" />}
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {new Date(cust.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`${basePath}/customers/${cust.id}`} className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm flex items-center justify-end gap-1 w-full">
                        View 360 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Register Customer</h2>
                <p className="text-sm text-gray-500">Create a new customer profile.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="custForm" onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                  <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                    <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                  <textarea rows={2} className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Occupation</label>
                  <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                    value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} />
                </div>
                
                <h3 className="font-bold text-gray-900 border-b pb-1 mt-6">Next of Kin Details</h3>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                    value={formData.nokName} onChange={e => setFormData({...formData, nokName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                    <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                      value={formData.nokPhone} onChange={e => setFormData({...formData, nokPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Relationship</label>
                    <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2 bg-gray-50"
                      value={formData.nokRelation} onChange={e => setFormData({...formData, nokRelation: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button form="custForm" type="submit" className="w-full btn-primary py-4 text-base shadow-lg shadow-green-200">
                Register Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
