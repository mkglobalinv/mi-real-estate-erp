"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Application, Customer } from '@/lib/types';
import { TrendingUp, FileCheck, Briefcase, Users as UsersIcon, FileText, Activity, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChairmanDashboard() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [revenue, setRevenue] = useState<any>({ monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [allAllocations, allCustomers, allRevenue, allApps] = await Promise.all([
        api.getAllocations(),
        api.getCustomers(),
        api.getRevenueReports(),
        api.getApplications()
      ]);
      setAllocations(allAllocations);
      setCustomers(allCustomers);
      setRevenue(allRevenue);
      setApplications(allApps);
    } catch (err) {
      toast.error('Failed to load Chairman Dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const handleFinalApproval = async (app: Application) => {
    try {
      // 1. Approve Application
      await api.saveApplication({ ...app, status: 'Chairman Approved' });
      
      // 2. Activate Customer
      const customer = customers.find(c => c.id === app.customerId);
      if (customer) {
        await api.saveCustomer({ ...customer, status: 'Active' });
      }
      
      toast.success('Application Approved and Customer Activated!');
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

  const pendingAllocations = allocations.filter(a => a.status === 'Pending Allocation').length;
  const monthlyRevenue = revenue?.monthly || 0;
  const activeCustomers = customers.length; 
  const pendingAppsForChairman = applications.filter(a => a.status === 'Director Reviewed');
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
            <div className="flex items-center gap-2 mb-2"><Briefcase className="w-5 h-5 text-indigo-500"/><span className="text-sm font-bold text-gray-500 uppercase">Allocations</span></div>
            <h3 className="text-3xl font-extrabold">{pendingAllocations}</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2"><UsersIcon className="w-5 h-5 text-blue-500"/><span className="text-sm font-bold text-gray-500 uppercase">Customers</span></div>
            <h3 className="text-3xl font-extrabold">{activeCustomers}</h3>
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
                        <button onClick={() => handleFinalApproval(app)} className="text-xs font-bold px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors shadow-sm">
                          Final Approval (Activate)
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
    </div>
  );
}
