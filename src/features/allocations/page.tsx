"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Allocation, Customer, Project } from '@/lib/types';
import { 
  MapPin, Search, Filter, CheckCircle2, Clock, 
  Map, ShieldCheck, UserCheck, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AllocationsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New Recommendation Form
  const [formData, setFormData] = useState({
    customerId: '', projectId: '', blockNumber: '', plotNumber: ''
  });

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

  return (
    <div className="pb-20">
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
            <input type="text" placeholder="Search allocations..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
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
                <th className="p-4">Estate Project</th>
                <th className="p-4">Block & Plot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allocations.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No allocations found.</td></tr>
              ) : (
                allocations.map((alloc) => {
                  const cust = getCustomer(alloc.customerId);
                  const proj = getProject(alloc.projectId);
                  
                  return (
                    <tr key={alloc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{cust?.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cust?.ref}</p>
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
                        {alloc.status === 'Allocated' ? (
                          <button onClick={() => toast.error('Generate Letter flow coming soon')} className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm">
                            Generate Letter
                          </button>
                        ) : (
                          <span className="text-gray-300 text-sm font-medium">Awaiting Chairman</span>
                        )}
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

    </div>
  );
}
