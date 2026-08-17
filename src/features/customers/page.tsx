"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { Customer, Project } from '@/lib/types';
import { Users, Search, ChevronRight, CheckCircle2, Clock, PlusCircle, X, Copy, Check, UploadCloud, FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomersPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [successData, setSuccessData] = useState<{name: string, username: string, tempPass: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    // Section A
    fullName: '', phone: '', email: '', idSerial: '', address: '',
    // Section B
    projectId: '', plotSize: '', plotNumber: '', totalAmount: 0,
    // Section C
    initialDeposit: 0, installmentPeriod: 12, installmentStartDate: '',
    // Section D
    nokName: '', nokPhone: '', nokRelation: ''
  });
  // Section E
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  useEffect(() => {
    loadData();
    api.getProjects().then(setProjects);
  }, []);

  const loadData = async () => {
    const custs = await api.getCustomers();
    setCustomers(custs);
  };

  const calculateInstallments = () => {
    const amount = formData.totalAmount - formData.initialDeposit;
    if (amount <= 0 || formData.installmentPeriod <= 0) return 0;
    return Math.floor(amount / formData.installmentPeriod);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const emailToUse = formData.email || `customer-${Date.now()}@mirealestate.portal`;

      // 1. Upload any Customer Documents first, so their URLs can be sent
      // to the API alongside the rest of the form (file objects can't go
      // through the JSON body below). A file that fails to upload is
      // skipped with a warning rather than blocking account creation.
      const customerDocuments: { title: string; fileUrl: string }[] = [];
      if (documentFiles.length > 0) {
        setUploadingDocs(true);
        const supabase = createClient();
        for (const file of documentFiles) {
          try {
            const ext = file.name.split('.').pop();
            const path = `customer-docs/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: storageError } = await supabase.storage.from('payment-proofs').upload(path, file);
            if (storageError) throw storageError;
            const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(path);
            if (!urlData?.publicUrl) throw new Error('Failed to generate file URL');
            customerDocuments.push({ title: file.name.replace(/\.[^.]+$/, ''), fileUrl: urlData.publicUrl });
          } catch (uploadErr: any) {
            toast.error(`Failed to upload ${file.name}: ${uploadErr.message || 'unknown error'}`);
          }
        }
        setUploadingDocs(false);
      }

      // 2. Create Portal Account & Save to Database via API
      const authRes = await fetch('/api/admin/create-customer-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          fullName: formData.fullName,
          phone: formData.phone,
          formData: {
            ...formData,
            monthlyInst: calculateInstallments(),
            customerDocuments
          }
        })
      });
      const authData = await authRes.json();
      
      if (!authRes.ok) {
        throw new Error(authData.error || 'Failed to create customer and account');
      }

      setSuccessData({
        name: formData.fullName,
        username: emailToUse,
        tempPass: authData.tempPassword
      });
      
      toast.success('Customer and Portal Account created successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register customer');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!successData) return;
    const text = `Customer Portal Credentials\nURL: https://mirealestate.com/login\nUsername: ${successData.username}\nPassword: ${successData.tempPass}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSuccessData(null);
    setFormData({
      fullName: '', phone: '', email: '', idSerial: '', address: '',
      projectId: '', plotSize: '', plotNumber: '', totalAmount: 0,
      initialDeposit: 0, installmentPeriod: 12, installmentStartDate: '',
      nokName: '', nokPhone: '', nokRelation: ''
    });
    setDocumentFiles([]);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchTerm === '' || 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <PlusCircle className="w-5 h-5" /> Create New Customer
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
          <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Create New Customer</h2>
                <p className="text-sm text-gray-500">Provision CRM record and portal access.</p>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              {successData ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">CUSTOMER PORTAL CREATED SUCCESSFULLY</h3>
                  <p className="text-gray-600 mb-8 font-medium">Portal access has been provisioned for <br/><strong className="text-gray-900">{successData.name}</strong></p>
                  
                  <div className="bg-gray-900 text-white p-6 rounded-2xl max-w-sm mx-auto text-left shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Username</p>
                      <p className="font-mono text-lg mb-4 select-all">{successData.username}</p>
                      
                      <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Temporary Password</p>
                      <p className="font-mono text-lg text-[var(--color-gold)] select-all">{successData.tempPass}</p>
                    </div>
                  </div>
                  
                  <button onClick={copyCredentials} className="mt-6 btn-primary flex items-center gap-2 mx-auto px-6 py-3 shadow-md">
                    {copied ? <><Check className="w-5 h-5"/> Copied!</> : <><Copy className="w-5 h-5"/> COPY LOGIN DETAILS</>}
                  </button>
                </div>
              ) : (
                <form id="custForm" onSubmit={handleCreateCustomer} className="space-y-8">
                  {/* SECTION A */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 text-[var(--color-primary)]">Section A: Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Customer Full Name *</label>
                        <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white transition-colors"
                          value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number *</label>
                        <input required type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input type="email" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">ID / Serial Number *</label>
                        <input required type="text" placeholder="e.g. SARPE/00" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.idSerial} onChange={e => setFormData({...formData, idSerial: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Residential Address</label>
                        <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION B */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 text-[var(--color-primary)]">Section B: Property Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Project / Estate *</label>
                        <select required className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                          <option value="">Select a project...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Plot Size *</label>
                        <input required type="text" placeholder="e.g. 50x100" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.plotSize} onChange={e => setFormData({...formData, plotSize: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Plot Number</label>
                        <input type="text" placeholder="Pending Allocation if empty" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.plotNumber} onChange={e => setFormData({...formData, plotNumber: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Total Plot Amount (₦) *</label>
                        <input required type="number" min="0" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white font-bold text-lg text-gray-900"
                          value={formData.totalAmount || ''} onChange={e => setFormData({...formData, totalAmount: Number(e.target.value)})} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION C */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 text-[var(--color-primary)]">Section C: Payment & Installment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Initial Deposit Amount (₦) *</label>
                        <input required type="number" min="0" max={formData.totalAmount} className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white font-bold"
                          value={formData.initialDeposit || ''} onChange={e => setFormData({...formData, initialDeposit: Number(e.target.value)})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Installment Period (Months) *</label>
                        <input required type="number" min="1" max="120" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.installmentPeriod || ''} onChange={e => setFormData({...formData, installmentPeriod: Number(e.target.value)})} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Installment Start Date *</label>
                        <input required type="date" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.installmentStartDate} onChange={e => setFormData({...formData, installmentStartDate: e.target.value})} />
                      </div>
                    </div>
                    {/* Auto Calculated Summary */}
                    {formData.totalAmount > 0 && formData.installmentPeriod > 0 && (
                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Calculated Monthly Payment</p>
                          <p className="text-xl font-extrabold text-blue-800">₦{calculateInstallments().toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Outstanding</p>
                          <p className="text-lg font-bold text-blue-800">₦{(formData.totalAmount - formData.initialDeposit).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION D */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 text-[var(--color-primary)]">Section D: Next of Kin</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.nokName} onChange={e => setFormData({...formData, nokName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.nokPhone} onChange={e => setFormData({...formData, nokPhone: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Relationship</label>
                        <input type="text" className="w-full border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 focus:bg-white"
                          value={formData.nokRelation} onChange={e => setFormData({...formData, nokRelation: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* SECTION E */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 text-[var(--color-primary)]">Section E: Customer Documents</h3>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors bg-gray-50">
                      <UploadCloud className="w-7 h-7 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-500">Click to upload ID, agreements, or other files</span>
                      <span className="text-xs text-gray-400">PDF, JPEG or PNG - multiple files allowed</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        onChange={e => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length) setDocumentFiles(prev => [...prev, ...files]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {documentFiles.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {documentFiles.map((file, idx) => (
                          <li key={`${file.name}-${idx}`} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDocumentFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-red-500 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </form>
              )}
            </div>
            
            {!successData && (
              <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <button disabled={isLoading} form="custForm" type="submit" className="w-full btn-primary py-4 text-base font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all">
                  {isLoading ? <Clock className="w-5 h-5 animate-spin" /> : null}
                  {isLoading ? (uploadingDocs ? 'UPLOADING DOCUMENTS...' : 'CREATING PORTAL...') : 'CREATE CUSTOMER PORTAL'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
