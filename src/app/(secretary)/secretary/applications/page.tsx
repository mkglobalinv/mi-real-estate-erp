"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { FileText, CheckSquare, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecretaryApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const apps = await api.getApplications();
      const custs = await api.getCustomers();
      setApplications(apps);
      setCustomers(custs);
    } catch (err: any) {
      toast.error('Failed to load applications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleForwardToDirector = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (app) {
        await api.saveApplication({ ...app, status: 'Pending Review' });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Forwarded to Director',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Application Forwarded',
          message: `Application ${app.ref} for ${customer?.fullName || 'Customer'} was forwarded to Director for review.`,
          type: 'System'
        });

        toast.success('Application forwarded to Director');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to forward application');
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading Applications...</div>;
  }

  const filteredApps = applications.filter(a => 
    a.ref.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (a.status === 'Draft' || a.status === 'Pending Review' || a.status === 'Rejected')
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
            Application Records
          </h1>
          <p className="text-gray-500 mt-1">Manage and forward customer applications.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Application No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">App No.</th>
                <th className="p-4 font-bold">Customer Name</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Date Created</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No matching applications found.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const customer = customers.find(c => c.id === app.customerId);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{app.ref}</td>
                      <td className="p-4 text-gray-600">{customer?.fullName || 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          app.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                          app.status === 'Pending Review' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {app.status !== 'Pending Review' && (
                          <button
                            onClick={() => handleForwardToDirector(app.id)}
                            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Forward to Director
                          </button>
                        )}
                      </td>
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
