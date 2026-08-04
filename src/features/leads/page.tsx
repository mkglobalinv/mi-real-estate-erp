"use client";

import React, { useEffect, useState } from 'react';
import { Users, Filter, Calendar, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { Lead } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { useRole } from '@/components/providers/RoleProvider';
import { toast } from 'react-hot-toast';

export default function AdminLeadsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const { role, loading: roleLoading } = useRole();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = () => {
    api.getLeads().then(setLeads);
  };

  useEffect(() => {
    if (roleLoading) return;
    fetchLeads();
    setMounted(true);
  }, [roleLoading]);

  if (roleLoading || !mounted) return (
    <div className="flex items-center justify-center h-[500px]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading CRM Pipeline...</p>
      </div>
    </div>
  );

  const isSocialMediaDirector = role === 'Social Media Director';
  const isCustomerCare = role === 'Customer Care';

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.phone.includes(searchTerm) || 
      lead.ref.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leads Pipeline CRM</h1>
          <p className="text-gray-500 font-medium mt-1">Manage, qualify, and advance customer lifecycles.</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2 font-bold shadow-sm">
          <Filter className="w-4 h-4" /> {showFilters ? 'Hide Filters' : 'Filter Leads'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-4">
          <input 
            type="text" 
            placeholder="Search by name, phone, or ref..." 
            className="flex-1 p-2 border border-gray-200 rounded outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-200 rounded outline-none text-sm"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Qualified">Qualified</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Interest & Source</th>
                <th className="p-4">Lifecycle Stage</th>
                <th className="p-4">Lead Status</th>
                <th className="p-4">Operations & Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <p className="font-bold text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{lead.ref}</p>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>ðŸ“ž {lead.phone}</p>
                      {lead.whatsapp && <p className="text-green-600 font-medium">ðŸ’¬ {lead.whatsapp}</p>}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold mb-1">
                      {lead.temperature} ({lead.score})
                    </span>
                    <p className="font-bold text-[var(--color-primary)] text-sm">{lead.interest}</p>
                    <p className="text-xs text-gray-500 mt-1">Source: <span className="font-medium text-gray-700">{lead.source}</span></p>
                    {lead.campaign && <p className="text-xs text-green-700 font-bold mt-1">Campaign: {lead.campaign}</p>}
                    <p className="text-xs text-gray-500 mb-2">Budget: {lead.budget}</p>
                    
                    {lead.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100 text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {lead.notes}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    <select 
                      value={lead.lifecycleStage || 'Lead'}
                      disabled={true}
                      onChange={(e) => {
                        toast.error('Lifecycle Stage tracking requires Customer conversion workflow completion');
                      }}
                      className={`text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md px-2 py-1.5 outline-none border border-indigo-100 w-full cursor-not-allowed opacity-60`}
                    >
                      <option value="Lead">Lead</option>
                      <option value="Prospect">Prospect</option>
                      <option value="Application Submitted">Application Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Allocated">Allocated</option>
                      <option value="Active Customer">Active Customer</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4 align-top">
                    <select 
                      value={lead.status}
                      disabled={isSocialMediaDirector}
                      onChange={async (e) => {
                        const newStatus = e.target.value as any;
                        try {
                          await api.updateLeadStatus(lead.id, newStatus);
                          toast.success(`Lead status updated to ${newStatus}`);
                          fetchLeads();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to update lead status');
                        }
                      }}
                      className={`text-xs font-bold bg-gray-100 text-gray-700 rounded-md px-2 py-1.5 outline-none border border-gray-200 w-full ${isSocialMediaDirector ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Ready for Application">Ready for Application (Forward to Secretary)</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </td>
                  <td className="p-4 align-top">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-gray-400" />
                        <select 
                          value={lead.assignedTo || ''}
                          disabled={isCustomerCare}
                          onChange={(e) => {
                            api.assignLead(lead.id, e.target.value).then(fetchLeads);
                          }}
                          className={`text-xs font-medium text-gray-700 bg-transparent outline-none border-b border-gray-200 pb-0.5 ${isCustomerCare ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <option value="">Unassigned</option>
                          <option value="Admin Engineer">Admin Engineer</option>
                          <option value="Customer Care">Customer Care</option>
                          <option value="Social Media Director">Social Media Director</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium">Follow-Up: {lead.followUpDate || 'None Set'}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No leads pipeline data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
