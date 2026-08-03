"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LedgerTransaction, EasyBuyAccount } from '@/lib/types';
import { 
  BarChart3, TrendingUp, TrendingDown, Wallet, DollarSign, 
  Users, Activity, ArrowUpRight, ArrowDownRight, Calendar, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceDashboardPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [mounted, setMounted] = useState(false);
  const [ledger, setLedger] = useState<LedgerTransaction[]>([]);
  const [accounts, setAccounts] = useState<EasyBuyAccount[]>([]);
  const [revenue, setRevenue] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0, total: 0 });
  const [defaulters, setDefaulters] = useState({ 
    totalDefaulters: 0, days30: 0, days60: 0, days90Plus: 0, defaulterAccounts: [] as any[] 
  });

  useEffect(() => {
    async function loadData() {
      const l = await api.getLedgerTransactions();
      const a = await api.getEasyBuyAccounts();
      const rev = await api.getRevenueReports();
      const def = await api.getDefaulters();
      
      setLedger(l);
      setAccounts(a);
      setRevenue(rev);
      setDefaulters(def);
      setMounted(true);
    }
    loadData();
  }, []);

  if (!mounted) return null;

  const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.outstandingBalance, 0);
  const totalAccounts = accounts.length;

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-amber-600" />
            Financial Dashboard
          </h1>
          <p className="text-gray-500 font-medium mt-1">Executive overview of revenue, collections, outstanding balances, and defaulters.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">Live Data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 rounded-2xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" /> Monthly: â‚¦{revenue.monthly.toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Collections</p>
          <h3 className="text-3xl font-extrabold text-gray-900">â‚¦{revenue.total.toLocaleString()}</h3>
        </div>

        {/* Outstanding Balances */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl">
              <Wallet className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Outstanding Balances</p>
          <h3 className="text-3xl font-extrabold text-gray-900">â‚¦{totalOutstanding.toLocaleString()}</h3>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Active Accounts</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{totalAccounts}</h3>
        </div>

        {/* Defaulters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-200 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              90+ Days: {defaulters.days90Plus}
            </span>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Defaulters</p>
          <h3 className="text-3xl font-extrabold text-red-600">{defaulters.totalDefaulters}</h3>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Defaulters Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-extrabold text-gray-900">Defaulter Engine</h2>
            <p className="text-xs text-gray-500 mt-1">Breakdown of late installments</p>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-yellow-800">Pending / Overdue</p>
                  <p className="text-[10px] text-yellow-600 uppercase font-bold">1 - 29 Days Late</p>
                </div>
                <span className="text-xl font-extrabold text-yellow-700">{defaulters.days30}</span>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-orange-800">Overdue</p>
                  <p className="text-[10px] text-orange-600 uppercase font-bold">30 - 59 Days Late</p>
                </div>
                <span className="text-xl font-extrabold text-orange-700">{defaulters.days60}</span>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-red-800">Defaulting Status</p>
                  <p className="text-[10px] text-red-600 uppercase font-bold">90+ Days Late</p>
                </div>
                <span className="text-xl font-extrabold text-red-700">{defaulters.days90Plus}</span>
              </div>
            </div>

            {defaulters.defaulterAccounts.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Critical Accounts</h3>
                <div className="space-y-2">
                  {defaulters.defaulterAccounts.slice(0, 5).map((def: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg">
                      <Link href={`${basePath}/customers/${def.account.customerId}`} className="font-bold text-[var(--color-primary)] hover:underline">
                        {def.account.ref}
                      </Link>
                      <span className="text-xs font-bold text-red-600">{def.maxDaysLate} days late</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ledger */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Recent Ledger Entries</h2>
              <p className="text-xs text-gray-500 mt-1">Single source of truth for all collections</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500">Daily Collections</p>
              <p className="text-sm font-extrabold text-green-600">â‚¦{revenue.daily.toLocaleString()}</p>
            </div>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4 md:p-6">Transaction Date</th>
                  <th className="p-4 md:p-6">Description</th>
                  <th className="p-4 md:p-6">Type</th>
                  <th className="p-4 md:p-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ledger.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No transactions recorded yet.</td></tr>
                ) : (
                  ledger.slice(0, 8).map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 md:p-6">
                        <p className="font-bold text-gray-900">{new Date(tx.date).toLocaleDateString()}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Ref: {tx.referenceId}</p>
                      </td>
                      <td className="p-4 md:p-6">
                        <p className="text-sm font-bold text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-[var(--color-primary)] font-bold mt-0.5">Customer ID: {tx.customerId}</p>
                      </td>
                      <td className="p-4 md:p-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${
                          tx.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.type === 'Credit' ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        <p className={`text-base font-extrabold ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'Credit' ? '+' : '-'}â‚¦{tx.amount.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
