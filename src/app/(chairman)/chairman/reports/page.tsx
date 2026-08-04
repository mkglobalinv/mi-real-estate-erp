"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Activity, TrendingUp, Users, MapPin, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ChairmanReportsPage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState<any>(null);
  const [customersCount, setCustomersCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const [revData, custs, apps, ledger] = await Promise.all([
          api.getRevenueReports(),
          api.getCustomers(),
          api.getApplications(),
          api.getLedgerTransactions()
        ]);
        setRevenue(revData);
        setCustomersCount(custs.length);
        setAppsCount(apps.length);

        const monthlyStats: Record<string, { revenue: number, sales: number }> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthlyStats[`${months[d.getMonth()]} ${d.getFullYear()}`] = { revenue: 0, sales: 0 };
        }
        
        ledger.forEach(tx => {
          if (tx.type === 'Credit') {
            const d = new Date(tx.date);
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            if (monthlyStats[key]) {
              monthlyStats[key].revenue += Number(tx.amount);
            }
          }
        });
        
        apps.forEach(app => {
          if (app.status?.includes('Approved')) {
            const d = new Date(app.createdAt || new Date());
            const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            if (monthlyStats[key]) {
              monthlyStats[key].sales += 1;
            }
          }
        });

        setChartData(Object.entries(monthlyStats).map(([name, data]) => ({ name, ...data })));
      } catch (err: any) {
        toast.error('Failed to load executive reports');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) return <div className="p-8 animate-pulse">Loading Reports...</div>;



  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600" />
            Executive Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">High-level financial and operational overview.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-indigo-700 transition">
          Export Full PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-green-600"/><span className="text-sm font-bold text-gray-500 uppercase">Monthly Revenue</span></div>
          <h3 className="text-3xl font-extrabold text-gray-900">₦{revenue?.monthly?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-blue-600"/><span className="text-sm font-bold text-gray-500 uppercase">Total Revenue YTD</span></div>
          <h3 className="text-3xl font-extrabold text-gray-900">₦{(revenue?.monthly * 6 || 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-purple-600"/><span className="text-sm font-bold text-gray-500 uppercase">Active Customers</span></div>
          <h3 className="text-3xl font-extrabold text-gray-900">{customersCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-orange-600"/><span className="text-sm font-bold text-gray-500 uppercase">Total Applications</span></div>
          <h3 className="text-3xl font-extrabold text-gray-900">{appsCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" /> Revenue Trend (Last 6 Months)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₦${val/1000000}M`} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} formatter={(val: number) => `₦${val.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" /> Sales Volume Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
