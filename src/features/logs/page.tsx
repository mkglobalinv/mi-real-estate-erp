"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Search, Calendar, Filter } from 'lucide-react';

export default function AdminActivityLogsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.getLogs().then(setLogs);
  }, []);

  const FILTERS = ['All', 'Leads', 'Reservations', 'Inspections', 'Properties', 'Projects'];

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Activity Logs</h1>
          <p className="text-gray-500 font-medium mt-1">System audit trail and operational tracking.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Date Range" disabled className="bg-transparent border-none outline-none text-sm text-gray-500 cursor-not-allowed w-24" />
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm focus-within:border-[var(--color-primary)] transition-colors">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search actions..." className="bg-transparent border-none outline-none text-sm text-gray-700 w-40" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {FILTERS.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors shadow-sm border ${
              filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Date & Time</th>
                <th className="p-4">User</th>
                <th className="p-4">Module</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {logs.filter(log => filter === 'All' || log.module === filter || (filter === 'Properties' && log.module === 'Submissions')).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{log.date}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.time}</p>
                  </td>
                  <td className="p-4 font-bold text-[var(--color-primary)]">{log.user}</td>
                  <td className="p-4 font-medium text-gray-600">{log.module}</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-gray-100 border border-gray-200 text-gray-700">
                      {log.action}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No activity logs found matching the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
