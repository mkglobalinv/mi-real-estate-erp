"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { TrendingUp, FileCheck, Briefcase, Users as UsersIcon, FileText, Activity, CheckCircle, Eye, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ChairmanDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [revenue, setRevenue] = useState<any>({ monthly: 0, total: 0 });
  const [qualifierStats, setQualifierStats] = useState({ visits: 0, submissions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allDocs, allCustomers, allRevenue, allApps, landingStats] = await Promise.all([
        (api as any).getDocuments ? (api as any).getDocuments() : Promise.resolve([]),
        api.getCustomers(),
        api.getRevenueReports(),
        api.getApplications(),
        api.getQualifierLandingStats()
      ]);
      setDocuments(allDocs);
      setCustomers(allCustomers);
      setRevenue(allRevenue);
      setApplications(allApps);
      setQualifierStats(landingStats);
    } catch (err) {
      toast.error('Failed to load Chairman Dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const handleFinalApproval = async (app: Application) => {
    try {
      // 1. Approve Application (Forward to Finance)
      await api.saveApplication({ ...app, status: 'Chairman Approved' });
      
      const customer = customers.find(c => c.id === app.customerId);
      
      // 2. Log Activity and Notify
      await api.createActivityLog({
        module: 'Applications',
        action: 'Chairman Final Approval',
        details: { appId: app.id, customerId: customer?.id }
      });

      await api.createNotification({
        title: 'Application Forwarded to Finance',
        message: `Chairman has given final approval for ${customer?.fullName || 'Customer'}. Forwarded to Finance queue.`,
        type: 'System'
      });

      toast.success('Application Approved and Forwarded to Finance!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute final approval');
    }
  };

  if (loading) return (
    <div className="mb-12 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="col-span-2 bg-green-50 rounded-2xl h-32"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-32"></div>
        ))}
      </div>
    </div>
  );

  const pendingAgreements = documents.filter(d => 
    (d.type === 'Sale Agreement' || d.type === 'Offer Letter') && d.status === 'Pending Review'
  ).length;
  const monthlyRevenue = revenue?.monthly || 0;
  const activeCustomers = customers.length; 
  const pendingAppsForChairman = applications.filter(a => a.status === 'Director Approved' || a.status === 'Awaiting Chairman Approval');
  const executiveReports = 5;

  return (
    <div className="mb-12 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Executive Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm border border-green-200 col-span-2">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-6 h-6 text-green-700"/><span className="text-sm font-bold text-green-800 uppercase">Monthly Revenue</span></div>
            <h3 className="text-4xl font-extrabold text-green-900">₦{monthlyRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><FileCheck className="w-5 h-5 text-orange-500"/><span className="text-sm font-bold text-gray-500 uppercase">Approvals</span></div>
            <h3 className="text-3xl font-extrabold">{pendingAppsForChairman.length}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><Briefcase className="w-5 h-5 text-indigo-500"/><span className="text-sm font-bold text-gray-500 uppercase">Pending Agreements</span></div>
            <h3 className="text-3xl font-extrabold">{pendingAgreements}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><UsersIcon className="w-5 h-5 text-blue-500"/><span className="text-sm font-bold text-gray-500 uppercase">Customers</span></div>
            <h3 className="text-3xl font-extrabold">{activeCustomers}</h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Landing Page Analytics <span className="text-sm font-normal text-gray-400">(mirealestat.com/?qualify=true)</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><Eye className="w-5 h-5 text-blue-500"/><span className="text-sm font-bold text-gray-500 uppercase">Visits</span></div>
            <h3 className="text-3xl font-extrabold">{qualifierStats.visits}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><MessageCircle className="w-5 h-5 text-green-600"/><span className="text-sm font-bold text-gray-500 uppercase">Submitted (WhatsApp)</span></div>
            <h3 className="text-3xl font-extrabold">{qualifierStats.submissions}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-orange-500"/><span className="text-sm font-bold text-gray-500 uppercase">Conversion Rate</span></div>
            <h3 className="text-3xl font-extrabold">{qualifierStats.visits > 0 ? Math.round((qualifierStats.submissions / qualifierStats.visits) * 100) : 0}%</h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Pending Final Approvals</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">App Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Documents</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pendingAppsForChairman.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No applications pending Chairman approval.</td></tr>
              ) : (
                pendingAppsForChairman.map(app => {
                  const customer = customers.find(c => c.id === app.customerId);
                  return (
                    <tr key={app.id}>
                      <td className="p-4 font-bold text-gray-900">{app.ref}</td>
                      <td className="p-4">{customer?.fullName || 'Unknown'}</td>
                      <td className="p-4">
                        {app.documentsVerified ? (
                          <span className="text-green-600 font-bold flex items-center gap-1 text-xs"><CheckCircle className="w-3 h-3"/> Verified by Secretary</span>
                        ) : (
                          <span className="text-gray-500 font-bold flex items-center gap-1 text-xs">Pending Verification</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Link href="/chairman/approvals" className="text-xs font-bold px-4 py-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] rounded-lg transition-colors shadow-sm">
                          Review Application
                        </Link>
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
