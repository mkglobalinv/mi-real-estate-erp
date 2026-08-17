"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Allocation, Customer, Project } from '@/lib/types';
import {
  MapPin, Search, Filter, CheckCircle2, Clock,
  Map, ShieldCheck, UserCheck, X, Pencil, Share2, Printer, Copy, Mail, MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ALLOCATION_STATUSES: Allocation['status'][] = ['Not Allocated', 'Pending Allocation', 'Approved', 'Allocated', 'Revoked'];

// idSerial isn't a separate column on customers - the Director's Create
// Customer form embeds it into address as "[ID: <serial>] <address>"
// (see create-customer-account/route.ts). Parsed back out here rather
// than adding a schema column for it.
function parseIdSerial(address?: string): string | null {
  if (!address) return null;
  const match = address.match(/^\[ID:\s*([^\]]+)\]/);
  return match ? match[1].trim() : null;
}

function allocationShareText(alloc: Allocation, customer: Customer | undefined, project: Project | undefined, idSerial: string | null): string {
  return [
    'M.I. Real Estate - Plot Allocation',
    `Customer: ${customer?.fullName || 'Unknown'}`,
    idSerial ? `ID/Serial: ${idSerial}` : null,
    `Ref: ${customer?.ref || '-'}`,
    `Estate: ${project?.name || 'Unknown Project'}`,
    `Plot: ${alloc.plotNumber}, Block: ${alloc.blockNumber}`,
    `Status: ${alloc.status}`,
  ].filter(Boolean).join('\n');
}

export default function AllocationsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Share
  const [shareTarget, setShareTarget] = useState<Allocation | null>(null);

  // Print
  const [printingAlloc, setPrintingAlloc] = useState<Allocation | null>(null);

  // New Recommendation Form
  const [formData, setFormData] = useState({
    customerId: '', projectId: '', blockNumber: '', plotNumber: ''
  });

  // Edit existing allocation
  const [editingAlloc, setEditingAlloc] = useState<Allocation | null>(null);
  const [editForm, setEditForm] = useState({ projectId: '', blockNumber: '', plotNumber: '', status: 'Pending Allocation' as Allocation['status'] });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allocs = await api.getAllocations();
    const custs = await api.getCustomers();
    const projs = await api.getProjects();
    setAllocations(allocs);
    setCustomers(custs);
    setProjects(projs);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveAllocation({
        customerId: formData.customerId,
        projectId: formData.projectId,
        blockNumber: formData.blockNumber,
        plotNumber: formData.plotNumber,
        status: 'Pending Allocation', // Awaiting Chairman
        submittedByDirector: 'Director',
        directorRecommendation: 'Recommended based on completed 60% payment.'
      });
      toast.success('Allocation recommended successfully');
      setIsFormOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to recommend allocation');
    }
  };

  const openEdit = (alloc: Allocation) => {
    setEditingAlloc(alloc);
    setEditForm({
      projectId: alloc.projectId || '',
      blockNumber: alloc.blockNumber || '',
      plotNumber: alloc.plotNumber || '',
      status: alloc.status
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlloc) return;
    setSavingEdit(true);
    try {
      // Spread the full existing record before the edited fields - saveAllocation
      // upserts, and Postgres validates NOT NULL on the proposed row even when
      // updating an existing one, so a partial payload can fail on columns
      // that aren't actually changing.
      await api.saveAllocation({ ...editingAlloc, ...editForm });
      toast.success('Allocation updated');
      setEditingAlloc(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update allocation');
    } finally {
      setSavingEdit(false);
    }
  };

  // Print: wait for printingAlloc's content to actually render before
  // opening the print dialog, then clear it once the dialog closes.
  useEffect(() => {
    if (!printingAlloc) return;
    const timer = setTimeout(() => window.print(), 50);
    const handleAfterPrint = () => setPrintingAlloc(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [printingAlloc]);

  const handleShare = async (alloc: Allocation) => {
    const customer = getCustomer(alloc.customerId);
    const project = getProject(alloc.projectId);
    const idSerial = parseIdSerial(customer?.address);
    const text = allocationShareText(alloc, customer, project, idSerial);

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Plot Allocation', text });
      } catch (err: any) {
        // AbortError just means the user cancelled the native share sheet.
        if (err?.name !== 'AbortError') toast.error('Failed to share');
      }
      return;
    }
    setShareTarget(alloc);
  };

  const copyShareText = async (alloc: Allocation) => {
    const customer = getCustomer(alloc.customerId);
    const project = getProject(alloc.projectId);
    const idSerial = parseIdSerial(customer?.address);
    try {
      await navigator.clipboard.writeText(allocationShareText(alloc, customer, project, idSerial));
      toast.success('Copied to clipboard');
      setShareTarget(null);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const filteredAllocations = allocations.filter(alloc => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const customer = getCustomer(alloc.customerId);
    const idSerial = parseIdSerial(customer?.address);
    return (
      customer?.fullName?.toLowerCase().includes(term) ||
      customer?.ref?.toLowerCase().includes(term) ||
      idSerial?.toLowerCase().includes(term) ||
      false
    );
  });

  return (
    <>
    <div className="pb-20 print:hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[var(--color-primary)]" />
            Plot Allocations
          </h1>
          <p className="text-gray-500 font-medium mt-1">Director Workflow: Recommend physical plot allocations for Chairman approval.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary flex items-center gap-2">
          <Map className="w-5 h-5" /> Recommend Allocation
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or ID/Serial..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <button onClick={() => toast.error('Filter feature coming soon')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">ID / Serial</th>
                <th className="p-4">Estate Project</th>
                <th className="p-4">Block & Plot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAllocations.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No allocations found.</td></tr>
              ) : (
                filteredAllocations.map((alloc) => {
                  const cust = getCustomer(alloc.customerId);
                  const proj = getProject(alloc.projectId);
                  const idSerial = parseIdSerial(cust?.address);

                  return (
                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{cust?.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cust?.ref}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{cust?.phone}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono text-gray-700">{idSerial || '—'}</span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-700">{proj?.name || 'Unknown Project'}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700 border border-gray-200">
                            Blk: {alloc.blockNumber}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-700 border border-gray-200">
                            Plt: {alloc.plotNumber}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                          alloc.status === 'Allocated' ? 'bg-green-50 text-green-700 border-green-200' :
                          alloc.status === 'Pending Allocation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {alloc.status === 'Allocated' && <CheckCircle2 className="w-3 h-3" />}
                          {alloc.status === 'Pending Allocation' && <ShieldCheck className="w-3 h-3" />}
                          {alloc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {alloc.status === 'Allocated' && (
                            <button onClick={() => toast.error('Generate Letter flow coming soon')} className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm mr-1">
                              Letter
                            </button>
                          )}
                          <button onClick={() => handleShare(alloc)} title="Share" className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setPrintingAlloc(alloc)} title="Print" className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(alloc)} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        </div>
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
                <h2 className="text-xl font-extrabold text-gray-900">Recommend Allocation</h2>
                <p className="text-sm text-gray-500">Submit physical plot to Chairman.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="allocForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Customer</label>
                  <select required className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">Select an Active Customer...</option>
                    {customers.filter(c => c.status === 'Chairman Approved' || c.status === 'Active').map(c => 
                      <option key={c.id} value={c.id}>{c.fullName} ({c.ref})</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Select Estate Project</label>
                  <select required className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">Select an Estate...</option>
                    {projects.filter(p => !p.archived).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Block Number</label>
                    <input required type="text" placeholder="e.g. C" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                      value={formData.blockNumber} onChange={e => setFormData({...formData, blockNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Plot Number</label>
                    <input required type="text" placeholder="e.g. 42" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                      value={formData.plotNumber} onChange={e => setFormData({...formData, plotNumber: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white">
              <button form="allocForm" type="submit" className="w-full btn-primary py-4 text-base shadow-lg shadow-green-200 flex justify-center gap-2 items-center">
                <ShieldCheck className="w-5 h-5" /> Submit to Chairman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Allocation */}
      {editingAlloc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Edit Allocation</h2>
                <p className="text-sm text-gray-500">{getCustomer(editingAlloc.customerId)?.fullName || 'Unknown customer'}</p>
              </div>
              <button onClick={() => setEditingAlloc(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <form id="editAllocForm" onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estate Project</label>
                <select required className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                  value={editForm.projectId} onChange={e => setEditForm({ ...editForm, projectId: e.target.value })}>
                  <option value="">Select an Estate...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Block Number</label>
                  <input required type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={editForm.blockNumber} onChange={e => setEditForm({ ...editForm, blockNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Plot Number</label>
                  <input required type="text" className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                    value={editForm.plotNumber} onChange={e => setEditForm({ ...editForm, plotNumber: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <select className="w-full border-gray-200 rounded-xl px-4 py-3 focus:ring-[var(--color-primary)] bg-gray-50"
                  value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as Allocation['status'] })}>
                  {ALLOCATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setEditingAlloc(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button form="editAllocForm" type="submit" disabled={savingEdit} className="flex-1 btn-primary py-3 font-bold disabled:opacity-60">
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

    {/* Print-only allocation summary - hidden on screen, shown only when printing */}
    {printingAlloc && (() => {
      const cust = getCustomer(printingAlloc.customerId);
      const proj = getProject(printingAlloc.projectId);
      const idSerial = parseIdSerial(cust?.address);
      return (
        <div className="hidden print:block p-10">
          <h1 className="text-2xl font-extrabold mb-1">M.I. Real Estate</h1>
          <p className="text-sm text-gray-600 mb-8">Plot Allocation Summary</p>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Customer</td><td className="py-2">{cust?.fullName || 'Unknown'}</td></tr>
              {idSerial && <tr className="border-b"><td className="py-2 font-bold pr-4">ID / Serial</td><td className="py-2">{idSerial}</td></tr>}
              <tr className="border-b"><td className="py-2 font-bold pr-4">Customer Ref</td><td className="py-2">{cust?.ref}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Phone</td><td className="py-2">{cust?.phone}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Estate Project</td><td className="py-2">{proj?.name || 'Unknown Project'}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Block</td><td className="py-2">{printingAlloc.blockNumber}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Plot</td><td className="py-2">{printingAlloc.plotNumber}</td></tr>
              <tr className="border-b"><td className="py-2 font-bold pr-4">Status</td><td className="py-2">{printingAlloc.status}</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-10">Printed {new Date().toLocaleString()}</p>
        </div>
      );
    })()}

    {/* Share fallback (browsers without the native Web Share API) */}
    {shareTarget && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h2 className="text-lg font-extrabold text-gray-900">Share Allocation</h2>
            <button onClick={() => setShareTarget(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(allocationShareText(shareTarget, getCustomer(shareTarget.customerId), getProject(shareTarget.projectId), parseIdSerial(getCustomer(shareTarget.customerId)?.address)))}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-bold text-gray-700"
            >
              <MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent('Plot Allocation')}&body=${encodeURIComponent(allocationShareText(shareTarget, getCustomer(shareTarget.customerId), getProject(shareTarget.projectId), parseIdSerial(getCustomer(shareTarget.customerId)?.address)))}`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-bold text-gray-700"
            >
              <Mail className="w-5 h-5 text-blue-600" /> Email
            </a>
            <button
              onClick={() => copyShareText(shareTarget)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors font-bold text-gray-700"
            >
              <Copy className="w-5 h-5 text-gray-500" /> Copy to Clipboard
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
