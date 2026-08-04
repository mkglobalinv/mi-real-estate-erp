"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { Archive as ArchiveIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArchivePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const apps = await api.getApplications();
        const custs = await api.getCustomers();
        
        // Archive only shows Chairman Approved apps and Active/Closed customers
        setApplications(apps.filter(a => a.status === 'Chairman Approved'));
        setCustomers(custs);
      } catch (err: any) {
        toast.error('Failed to load archive: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading Archive Data...</div>;
  }

  const filteredApps = applications.filter(a => 
    a.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <ArchiveIcon className="w-8 h-8 text-gray-700" />
            Completed Workflows
          </h1>
          <p className="text-gray-500 mt-1">Read-only view of all approved applications and activated customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-90">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Application No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">App No.</th>
                <th className="p-4 font-bold">Customer Name</th>
                <th className="p-4 font-bold">Workflow Status</th>
                <th className="p-4 font-bold">Archived Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No completed applications in archive.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const customer = customers.find(c => c.id === app.customerId);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-600">{app.ref}</td>
                      <td className="p-4 text-gray-600">{customer?.fullName || 'Unknown'}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
