"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { CheckSquare, XCircle, AlertCircle, FileText, Search, Clock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChairmanApprovalsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const apps = await api.getApplications();
      const custs = await api.getCustomers();
      setApplications(apps.filter(a => a.status === 'Director Approved' || a.status === 'Awaiting Chairman Approval'));
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

  const handleApprove = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (app) {
        await api.saveApplication({ 
          ...app, 
          status: 'Chairman Approved',
          approvedBy: 'Chairman',
        });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Chairman Final Approval',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Application Approved',
          message: `Application ${app.ref} for ${customer?.fullName || 'Customer'} was approved by Chairman. Forwarded to Finance.`,
          type: 'System'
        });

        toast.success('Approved and forwarded to Finance.');
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
        await api.saveApplication({ 
          ...app, 
          status: 'Returned to Director',
        });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Chairman Rejection',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Application Rejected by Chairman',
          message: `Application ${app.ref} for ${customer?.fullName || 'Customer'} was rejected. Returned to Director.`,
          type: 'Alert'
        });

        toast.success('Rejected and returned to Director.');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application');
    }
  };

  const handleRequestCorrection = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (app) {
        await api.saveApplication({ 
          ...app, 
          status: 'Returned to Secretary',
        });
        
        await api.createActivityLog({
          module: 'Applications',
          action: 'Chairman Requested Correction',
          details: { appId: app.id, ref: app.ref }
        });

        await api.createNotification({
          title: 'Correction Requested by Chairman',
          message: `Application ${app.ref} requires correction. Returned to Secretary.`,
          type: 'Alert'
        });

        toast.success('Correction requested. Returned to Secretary.');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to request correction');
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading Applications...</div>;
  }

  const filteredApps = applications.filter(a => 
    a.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-[var(--color-primary)]" />
            Pending Applications
          </h1>
          <p className="text-gray-500 mt-1">Review applications forwarded by the Director.</p>
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
                <th className="p-4 font-bold">Customer Info</th>
                <th className="p-4 font-bold">Verification</th>
                <th className="p-4 font-bold">Remarks</th>
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
                    <React.Fragment key={app.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{app.ref}</td>
                        <td className="p-4">
                          <p className="font-bold text-gray-800">{customer?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{customer?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.documentsVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.documentsVerified ? 'Docs Verified' : 'Docs Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-600 max-w-xs truncate">
                          {app.directorNotes || 'No remarks provided.'}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleRequestCorrection(app.id)}
                            className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Correction
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                          >
                            <CheckSquare className="w-3 h-3" />
                            Approve
                          </button>
                        </td>
                      </tr>
                      {expandedAppId === app.id && (
                        <tr className="bg-gray-50 border-t border-gray-100">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Documents</h4>
                                <ul className="space-y-2 text-xs text-gray-600">
                                  <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>Application Form</span> <button className="text-blue-600 font-bold">View</button></li>
                                  <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>ID Card</span> <button className="text-blue-600 font-bold">View</button></li>
                                  <li className="flex justify-between items-center bg-gray-50 p-2 rounded"><span>Proof of Address</span> <button className="text-blue-600 font-bold">View</button></li>
                                </ul>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> Timeline</h4>
                                <ul className="space-y-3 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-gray-200 pl-6 text-xs text-gray-600">
                                  <li className="relative"><span className="absolute -left-6 w-2 h-2 bg-green-500 rounded-full top-1"></span> Submitted by Customer</li>
                                  <li className="relative"><span className="absolute -left-6 w-2 h-2 bg-green-500 rounded-full top-1"></span> Docs Verified by Secretary</li>
                                  <li className="relative"><span className="absolute -left-6 w-2 h-2 bg-green-500 rounded-full top-1"></span> Approved by Director</li>
                                </ul>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-green-500" /> Inspection & Plot</h4>
                                <div className="space-y-2 text-xs text-gray-600">
                                  <p><span className="font-bold text-gray-700">Project:</span> {app.projectId || 'N/A'}</p>
                                  <p><span className="font-bold text-gray-700">Inspection:</span> {app.inspectionNotes || 'Completed satisfactorily.'}</p>
                                  <p><span className="font-bold text-gray-700">Director Notes:</span> {app.directorNotes || 'None'}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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