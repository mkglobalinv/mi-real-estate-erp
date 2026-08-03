"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { WebsiteEnquiry } from '@/lib/types';
import { Search, Filter, Phone, Mail, Building, Trash2, CheckCircle, Clock } from 'lucide-react';

export default function WebsiteEnquiriesAdminPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [enquiries, setEnquiries] = useState<WebsiteEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    const data = await api.getWebsiteEnquiries();
    setEnquiries(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: WebsiteEnquiry['status']) => {
    await api.updateWebsiteEnquiryStatus(id, status);
    fetchEnquiries();
  };

  const deleteEnquiry = async (id: string) => {
    if (confirm('Are you sure you want to delete this enquiry?')) {
      await api.deleteWebsiteEnquiry(id);
      fetchEnquiries();
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          enquiry.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || enquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Enquiries</h1>
          <p className="text-sm text-gray-500 mt-1">Manage website development requests from clients.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-500">Total Enquiries: </span>
          <span className="text-lg font-bold text-gray-900">{enquiries.length}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name or company..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-400 w-5 h-5" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading enquiries...</p>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No enquiries found</h3>
          <p className="text-gray-500">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.map(enquiry => (
            <div key={enquiry.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900">{enquiry.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    enquiry.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {enquiry.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{enquiry.company}</span>
                    <span className="text-gray-400 text-xs">({enquiry.businessType})</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${enquiry.phone}`} className="hover:text-[var(--color-primary)]">{enquiry.phone}</a>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${enquiry.email}`} className="hover:text-[var(--color-primary)] truncate">{enquiry.email}</a>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100 mb-4">
                  "{enquiry.description}"
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {enquiry.status === 'New' && (
                    <button 
                      onClick={() => updateStatus(enquiry.id, 'Contacted')}
                      className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors tooltip"
                      title="Mark as Contacted"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                  {enquiry.status === 'Contacted' && (
                    <button 
                      onClick={() => updateStatus(enquiry.id, 'Closed')}
                      className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors tooltip"
                      title="Mark as Closed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteEnquiry(enquiry.id)}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors tooltip"
                    title="Delete Enquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
