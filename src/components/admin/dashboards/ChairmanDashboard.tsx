"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TrendingUp, FileCheck, Briefcase, Users as UsersIcon, FileText, Activity } from 'lucide-react';

export default function ChairmanDashboard() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any>({ monthly: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const fetchPromises: Promise<void>[] = [];
      fetchPromises.push(api.getAllocations().then(setAllocations));
      fetchPromises.push(api.getCustomers().then(setCustomers));
      fetchPromises.push(api.getRevenueReports().then(setRevenue));

      await Promise.all(fetchPromises);
      setLoading(false);
    }
    loadData();
  }, []);

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

  const pendingApprovals = allocations.filter(a => a.status === 'Pending Approval' || a.status === 'Draft').length;
  const pendingAllocations = allocations.filter(a => a.status === 'Pending Allocation').length;
  const monthlyRevenue = revenue?.monthly || 0;
  const activeCustomers = customers.length; // all registered
  const executiveReports = 5;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Executive Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-sm border border-green-200 col-span-2">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-6 h-6 text-green-700"/><span className="text-sm font-bold text-green-800 uppercase">Monthly Revenue</span></div>
          <h3 className="text-4xl font-extrabold text-green-900">₦{monthlyRevenue.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><FileCheck className="w-5 h-5 text-orange-500"/><span className="text-sm font-bold text-gray-500 uppercase">Approvals</span></div>
          <h3 className="text-3xl font-extrabold">{pendingApprovals}</h3>
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
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-gray-400"/>
            <div>
              <p className="font-bold">Executive Reports</p>
              <p className="text-xs text-gray-500">{executiveReports} Ready for review</p>
            </div>
          </div>
          <button className="btn-primary px-4 py-2 text-sm rounded-lg border border-gray-200">View</button>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-400"/>
            <div>
              <p className="font-bold">Project Performance Summary</p>
              <p className="text-xs text-gray-500">Live ROI and Allocation Tracking</p>
            </div>
          </div>
          <button className="btn-primary px-4 py-2 text-sm rounded-lg border border-gray-200">View</button>
          </div>
      </div>
    </div>
  );
}
