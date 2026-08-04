"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { Users, Search, MapPin, Briefcase, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChairmanCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const custs = await api.getCustomers();
        setCustomers(custs);
      } catch (err: any) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 animate-pulse">Loading Customers...</div>;

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Customer Profiles (Read-Only)
          </h1>
          <p className="text-gray-500 mt-1">Executive oversight of registered customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name or Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Ref No.</th>
                <th className="p-4 font-bold">Customer Name</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{c.ref}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{c.fullName}</p>
                      <p className="text-xs text-gray-500">{c.occupation}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <p>{c.phone}</p>
                      <p className="text-xs">{c.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button className="text-xs font-bold px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors shadow-sm">
                        View Details
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