"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { FileText, CheckCircle2, Clock, XCircle, FileSignature } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DirectorDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [apps, custs] = await Promise.all([
        api.getApplications(),
        api.getCustomers()
      ]);
      setApplications(apps);
      setCustomers(custs);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (app) {
        await api.saveApplication({ ...app, status: 'Director Reviewed' });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Director Approval',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Application Reviewed by Director',
          message: `Application ${app.ref} for ${customer?.fullName || 'Customer'} has been reviewed and forwarded to Chairman.`,
          type: 'System'
        });

        toast.success('Application forwarded to Chairman');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve application');
    }
  };

  const handleReject = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (app) {
        await api.saveApplication({ ...app, status: 'Rejected' });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Director Rejection',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Application Rejected by Director',
          message: `Application ${app.ref} for ${customer?.fullName || 'Customer'} was rejected.`,
          type: 'Alert'
        });

        toast.success('Application rejected and returned to Secretary');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application');
    }
  };

  if (loading) {
    return <div className="animate-pulse p-8 bg-white rounded-2xl">Loading Director Dashboard...</div>;
  }

  const pendingApps = applications.filter(a => a.status === 'Pending Review');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Pending Applications (Director Review)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl"><Clock className="w-6 h-6 text-amber-700" /></div>
          <div>
            <p className="text-sm font-bold text-gray-500">Pending Review</p>
            <p className="text-2xl font-black text-gray-900">{pendingApps.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="p-4">App Ref</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Documents</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pendingApps.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No applications pending review.</td></tr>
            ) : (
              pendingApps.map(app => {
                const customer = customers.find(c => c.id === app.customerId);
                return (
                  <tr key={app.id}>
                    <td className="p-4 font-bold text-gray-900">{app.ref}</td>
                    <td className="p-4">{customer?.fullName || 'Unknown'}</td>
                    <td className="p-4">
                      {app.documentsVerified ? (
                        <span className="text-green-600 font-bold flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3"/> Verified</span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1 text-xs"><Clock className="w-3 h-3"/> Pending</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded text-xs font-bold">
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleApprove(app.id)} className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                        Approve for Chairman
                      </button>
                      <button onClick={() => handleReject(app.id)} className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-red-200">
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
