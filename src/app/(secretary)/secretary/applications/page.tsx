"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { FileText, CheckSquare, Search, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

export default function SecretaryApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get authenticated user UUID on mount (useRole() does not provide UUID)
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    fetchUser();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [apps, custs] = await Promise.all([
        api.getApplications(),
        api.getCustomers(),
      ]);
      setApplications(apps as Application[]);
      setCustomers(custs as Customer[]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load applications';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleForwardToDirector = async (appId: string) => {
    const supabase = createClient();
    try {
      const app = applications.find(a => a.id === appId);
      const customer = customers.find(c => c.id === app?.customerId);
      if (!app) return;

      // Save application with correct status and submittedBy UUID
      await api.saveApplication({
        ...app,
        status: 'Pending Review',
        submittedBy: currentUserId ?? undefined,
      });

      // Log activity directly with user UUID and details JSONB
      await supabase.from('activity_logs').insert({
        user_id: currentUserId,
        module: 'Applications',
        action: 'Secretary Forwarded to Director',
        details: {
          appId: app.id,
          ref: app.ref,
          customerName: customer?.fullName ?? 'Unknown',
          previousStatus: app.status,
          newStatus: 'Pending Review',
        },
        ip_address: null,
      });

      // Notify all active Directors directly — api.createNotification() is broken (no user_id)
      const { data: directors } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'Director')
        .eq('active_status', true);

      for (const d of directors ?? []) {
        await supabase.from('notifications').insert({
          user_id: d.id,
          title: 'New Application for Review',
          message: `Application ${app.ref} for ${customer?.fullName ?? 'Customer'} has been forwarded for your review.`,
          type: 'System',
          read_status: false, // actual DB column name
        });
      }

      toast.success('Application forwarded to Director');
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to forward application';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse text-gray-500 flex items-center gap-3">
        <div className="h-6 w-6 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        Loading Applications...
      </div>
    );
  }

  // Show Draft, Pending Review, Returned to Secretary, and Rejected — Secretary must see all actionable states
  const filteredApps = applications.filter(a =>
    (a.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customers.find(c => c.id === a.customerId)?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (
      a.status === 'Draft' ||
      a.status === 'Pending Review' ||
      a.status === 'Returned to Secretary' ||
      a.status === 'Rejected'
    )
  );

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Draft':                 return 'bg-gray-100 text-gray-700';
      case 'Pending Review':        return 'bg-blue-100 text-blue-700';
      case 'Rejected':              return 'bg-red-100 text-red-700';
      case 'Returned to Secretary': return 'bg-amber-100 text-amber-700';
      default:                      return 'bg-green-100 text-green-700';
    }
  };

  // Forward button only for actionable statuses — not for apps already pending or rejected without correction
  const canForward = (status: string) =>
    status === 'Draft' || status === 'Returned to Secretary';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
            Application Records
          </h1>
          <p className="text-gray-500 mt-1">Manage and forward customer applications to the Director.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
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
                      <td className="p-4 text-gray-600">{customer?.fullName ?? 'Unknown'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(app.status ?? '')}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        {canForward(app.status ?? '') && (
                          <button
                            onClick={() => handleForwardToDirector(app.id)}
                            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                          >
                            {app.status === 'Returned to Secretary'
                              ? <RotateCcw className="w-4 h-4" />
                              : <CheckSquare className="w-4 h-4" />}
                            {app.status === 'Returned to Secretary'
                              ? 'Resubmit to Director'
                              : 'Forward to Director'}
                          </button>
                        )}
                        {app.status === 'Pending Review' && (
                          <span className="text-xs text-blue-600 font-medium">Awaiting Director Review</span>
                        )}
                        {app.status === 'Rejected' && (
                          <span className="text-xs text-red-600 font-medium">Rejected — No further action</span>
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
