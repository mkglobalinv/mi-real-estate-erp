"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { Users, Search, Filter, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CustomersPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const custs = await api.getCustomers();
    setCustomers(custs);
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--color-primary)]" />
            Customer Directory
          </h1>
          <p className="text-gray-500 font-medium mt-1">Master list of all registered customers across operations.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search customers..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button onClick={() => toast.error('Filter feature coming soon')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{cust.fullName}</p>
                      <p className="text-[10px] text-[var(--color-primary)] font-mono font-bold mt-0.5">{cust.ref}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">{cust.phone}</p>
                      <p className="text-xs text-gray-500">{cust.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        cust.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        cust.status === 'Chairman Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        cust.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {cust.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                        {cust.status === 'Pending Review' && <Clock className="w-3 h-3" />}
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {new Date(cust.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => toast.error('Customer Profile 360 is not implemented yet')} className="text-[var(--color-primary)] hover:text-green-800 font-bold text-sm flex items-center justify-end gap-1 w-full">
                        View 360 <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
