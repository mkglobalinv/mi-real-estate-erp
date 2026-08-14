"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { CheckSquare, XCircle, AlertCircle, FileText, Search, Clock, ShieldAlert, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

// ─── Helper: notify profiles by role ─────────────────────────────────────────
// api.createNotification() is broken — callers never pass userId, so all
// notifications land with user_id = null. We insert directly instead.

async function notifyByRole(
  role: string,
  title: string,
  message: string,
  type: string = 'System'
): Promise<void> {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', role)
    .eq('active_status', true);

  for (const p of profiles ?? []) {
    await supabase.from('notifications').insert({
      user_id: p.id,
      title,
      message,
      type,
      read_status: false, // actual DB column — NOT is_read
    });
  }
}

// ─── Helper: log activity directly ───────────────────────────────────────────

async function logActivity(
  userId: string,
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  const supabase = createClient();
  await supabase.from('activity_logs').insert({
    user_id: userId,
    module: 'Applications',
    action,
    details,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChairmanApprovalsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Remarks keyed by app ID — required before any action
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Get authenticated UUID on mount — useRole() does not provide UUID
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setCurrentUserId(data.user.id);
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [apps, custs] = await Promise.all([
        api.getApplications(),
        api.getCustomers(),
      ]);
      setApplications(
        (apps as Application[]).filter(
          a => a.status === 'Director Approved' || a.status === 'Awaiting Chairman Approval'
        )
      );
      setCustomers(custs as Customer[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load applications';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleApprove = async (appId: string) => {
    if (!currentUserId) {
      toast.error('Authentication error — please refresh and try again.');
      return;
    }
    const note = (remarks[appId] ?? '').trim();
    if (!note) {
      toast.error('Chairman remarks are required before approving.');
      return;
    }

    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (!app) return;

      // Save with correct status and approved_by UUID (not hardcoded 'Chairman')
      await api.saveApplication({
        ...app,
        status: 'Chairman Approved',
        approvedBy: currentUserId,
      });

      await logActivity(currentUserId, 'Chairman Approved Application', {
        appId: app.id,
        ref: app.ref,
        previousStatus: app.status,
        newStatus: 'Chairman Approved',
        chairmanRemarks: note,
      });

      // Notify Director and Secretary
      const msg = `Application ${app.ref} for ${customer?.fullName ?? 'Customer'} has been approved by the Chairman.`;
      await notifyByRole('Director', 'Application Approved by Chairman', msg);
      await notifyByRole('Secretary', 'Application Approved by Chairman', msg);

      toast.success('Approved and forwarded to Finance.');
      setRemarks(r => { const n = { ...r }; delete n[appId]; return n; });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve application';
      toast.error(msg);
    }
  };

  const handleReject = async (appId: string) => {
    if (!currentUserId) {
      toast.error('Authentication error — please refresh and try again.');
      return;
    }
    const note = (remarks[appId] ?? '').trim();
    if (!note) {
      toast.error('A rejection reason is required before rejecting.');
      return;
    }

    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (!app) return;

      await api.saveApplication({ ...app, status: 'Returned to Director' });

      await logActivity(currentUserId, 'Chairman Rejected Application', {
        appId: app.id,
        ref: app.ref,
        previousStatus: app.status,
        newStatus: 'Returned to Director',
        chairmanRemarks: note,
      });

      await notifyByRole(
        'Director',
        'Application Rejected by Chairman',
        `Application ${app.ref} for ${customer?.fullName ?? 'Customer'} was rejected. Reason: ${note}`,
        'Alert'
      );

      toast.success('Rejected and returned to Director.');
      setRemarks(r => { const n = { ...r }; delete n[appId]; return n; });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application';
      toast.error(msg);
    }
  };

  const handleRequestCorrection = async (appId: string) => {
    if (!currentUserId) {
      toast.error('Authentication error — please refresh and try again.');
      return;
    }
    const note = (remarks[appId] ?? '').trim();
    if (!note) {
      toast.error('Correction notes are required.');
      return;
    }

    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (!app) return;

      await api.saveApplication({ ...app, status: 'Returned to Secretary' });

      await logActivity(currentUserId, 'Chairman Requested Correction', {
        appId: app.id,
        ref: app.ref,
        previousStatus: app.status,
        newStatus: 'Returned to Secretary',
        correctionNotes: note,
      });

      await notifyByRole(
        'Secretary',
        'Correction Requested by Chairman',
        `Application ${app.ref} for ${customer?.fullName ?? 'Customer'} requires correction. Notes: ${note}`,
        'Alert'
      );

      toast.success('Correction requested. Returned to Secretary.');
      setRemarks(r => { const n = { ...r }; delete n[appId]; return n; });
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request correction';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-500">
        <div className="h-6 w-6 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        Loading Applications...
      </div>
    );
  }

  const filteredApps = applications.filter(a =>
    a.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customers.find(c => c.id === a.customerId)?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-[var(--color-primary)]" />
          Pending Applications
        </h1>
        <p className="text-gray-500 mt-1">Review applications forwarded by the Director.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Application No. or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
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
                <th className="p-4 font-bold">Chairman Remarks <span className="text-red-500">*</span></th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No applications pending Chairman review.
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
                          <p className="font-bold text-gray-800">{customer?.fullName ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{customer?.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.documentsVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {app.documentsVerified ? 'Docs Verified' : 'Docs Pending'}
                          </span>
                        </td>
                        <td className="p-4 min-w-[220px]">
                          <textarea
                            rows={2}
                            value={remarks[app.id] ?? ''}
                            onChange={e => setRemarks(r => ({ ...r, [app.id]: e.target.value }))}
                            placeholder="Required before any action..."
                            className="w-full text-xs border border-gray-300 rounded-lg px-2 py-1.5 resize-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              Details
                            </button>
                            <button
                              onClick={() => handleRequestCorrection(app.id)}
                              className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
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
                              className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                              <CheckSquare className="w-3 h-3" />
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedAppId === app.id && (
                        <tr className="bg-gray-50 border-t border-gray-100">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-500" /> Documents
                                </h4>
                                <p className="text-xs text-gray-400">
                                  Documents are managed via the Secretary module and uploaded to the customer record.
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-indigo-500" /> Timeline
                                </h4>
                                <ul className="relative pl-6 border-l border-gray-200 space-y-3 text-xs text-gray-600">
                                  <li className="relative">
                                    <span className="absolute -left-[1.35rem] top-1 w-2 h-2 bg-green-500 rounded-full" />
                                    Submitted by Secretary
                                  </li>
                                  <li className="relative">
                                    <span className="absolute -left-[1.35rem] top-1 w-2 h-2 bg-green-500 rounded-full" />
                                    Reviewed by Director
                                  </li>
                                  <li className="relative">
                                    <span className="absolute -left-[1.35rem] top-1 w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                                    Awaiting Chairman Decision
                                  </li>
                                </ul>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4 text-green-500" /> Application Detail
                                </h4>
                                <div className="space-y-2 text-xs text-gray-600">
                                  <p><span className="font-bold text-gray-700">Ref:</span> {app.ref}</p>
                                  <p><span className="font-bold text-gray-700">Status:</span> {app.status}</p>
                                  <p>
                                    <span className="font-bold text-gray-700">Docs Verified:</span>{' '}
                                    {app.documentsVerified ? 'Yes' : 'No'}
                                  </p>
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
