"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CustomerCareTicket, Customer } from '@/lib/types';
import { 
  MessageSquare, Search, Filter, PlusCircle, CheckCircle2, 
  Clock, X, AlertTriangle, Phone, ExternalLink
} from 'lucide-react';

export default function CustomerCarePage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [tickets, setTickets] = useState<CustomerCareTicket[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '', type: 'Complaint', subject: '', description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await api.getCustomerCareTickets();
    const c = await api.getCustomers();
    setTickets(t);
    setCustomers(c);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveCustomerCareTicket({
      customerId: formData.customerId,
      type: formData.type as any,
      subject: formData.subject,
      description: formData.description,
      status: 'Pending',
      submittedByDirector: 'Customer Care'
    });
    setIsFormOpen(false);
    loadData();
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[var(--color-primary)]" />
            Customer Care Center
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage complaints, inquiries, requests, and follow-ups.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Complaints</p>
            <p className="text-2xl font-extrabold text-gray-900">{tickets.filter(t => t.type === 'Complaint').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Inquiries</p>
            <p className="text-2xl font-extrabold text-gray-900">{tickets.filter(t => t.type === 'Inquiry').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Phone className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Requests</p>
            <p className="text-2xl font-extrabold text-gray-900">{tickets.filter(t => t.type === 'Request').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Follow-Ups</p>
            <p className="text-2xl font-extrabold text-gray-900">{tickets.filter(t => t.type === 'Follow-Up').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search tickets..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customer care tickets found.</td></tr>
              ) : (
                tickets.map((t) => {
                  const cust = getCustomer(t.customerId);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{t.ref}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{new Date(t.createdAt!).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5 hover:text-[var(--color-primary)]">
                          {cust?.fullName || 'Unknown'} <ExternalLink className="w-3 h-3" />
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-gray-700">{t.subject}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                          t.type === 'Complaint' ? 'bg-red-100 text-red-700' :
                          t.type === 'Inquiry' ? 'bg-blue-100 text-blue-700' :
                          t.type === 'Request' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                          t.status === 'Resolved' || t.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' :
                          t.status === 'Under Review' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {t.status === 'Resolved' && <CheckCircle2 className="w-3 h-3" />}
                          {t.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">New Ticket</h2>
                <p className="text-sm text-gray-500">Log a new customer interaction.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="tktForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Customer</label>
                  <select required className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">Select a Customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Interaction Type</label>
                  <select required className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="Complaint">Complaint</option>
                    <option value="Inquiry">Inquiry</option>
                    <option value="Request">Request</option>
                    <option value="Follow-Up">Follow-Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                  <input required type="text" placeholder="Brief subject" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                  <textarea required rows={5} placeholder="Full details of the interaction..." className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button form="tktForm" type="submit" className="w-full btn-primary py-4 text-base shadow-lg shadow-green-200">
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
