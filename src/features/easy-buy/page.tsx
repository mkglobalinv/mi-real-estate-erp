"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { EasyBuyAccount, Customer, Project } from '@/lib/types';
import { 
  Building2, Search, Filter, CheckCircle2, Clock, 
  AlertCircle, ChevronRight, BarChart3, Wallet
} from 'lucide-react';

export default function EasyBuyAccountsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [accounts, setAccounts] = useState<EasyBuyAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const accs = await api.getEasyBuyAccounts();
    const custs = await api.getCustomers();
    const projs = await api.getProjects();
    setAccounts(accs);
    setCustomers(custs);
    setProjects(projs);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
            Easy Buy Accounts
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage active installment plans, defaulters, and account statuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Building2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Total Accounts</p>
            <p className="text-2xl font-extrabold text-gray-900">{accounts.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Active</p>
            <p className="text-2xl font-extrabold text-gray-900">{accounts.filter(a => a.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Wallet className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Completed</p>
            <p className="text-2xl font-extrabold text-gray-900">{accounts.filter(a => a.status === 'Completed').length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Defaulting</p>
            <p className="text-2xl font-extrabold text-gray-900">{accounts.filter(a => a.status === 'Defaulting').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search accounts..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Account & Customer</th>
                <th className="p-4">Project</th>
                <th className="p-4">Financials</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No Easy Buy accounts found.</td></tr>
              ) : (
                accounts.map((acc) => {
                  const cust = getCustomer(acc.customerId);
                  const proj = getProject(acc.projectId);
                  const progress = Math.round(((acc.totalPropertyPrice - acc.outstandingBalance) / acc.totalPropertyPrice) * 100);
                  
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{cust?.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-[var(--color-primary)] font-mono font-bold mt-0.5">{acc.ref}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-700">{proj?.name || 'Unknown Project'}</p>
                        <p className="text-xs text-gray-500">Plot: {acc.plotNumber || 'Unassigned'}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-extrabold text-gray-900">â‚¦{acc.totalPropertyPrice.toLocaleString()}</p>
                        <p className="text-xs font-bold text-amber-600 mt-0.5">Bal: â‚¦{acc.outstandingBalance.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="w-full max-w-[120px]">
                          <div className="flex justify-between text-[10px] font-bold mb-1">
                            <span className="text-gray-500">Paid</span>
                            <span className="text-[var(--color-primary)]">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[var(--color-primary)] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          acc.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                          acc.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          acc.status === 'Defaulting' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {acc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm flex items-center justify-end gap-1 ml-auto">
                          Ledger <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
