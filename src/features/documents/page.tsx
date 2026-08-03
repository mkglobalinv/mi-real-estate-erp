"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Document as AppDocument, Customer } from '@/lib/types';
import { 
  FileText, Search, Filter, PlusCircle, ExternalLink, Download, File
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DocumentCenterPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const d = await api.getDocuments();
    const c = await api.getCustomers();
    setDocuments(d);
    setCustomers(c);
  };

  const getCustomer = (id: string) => customers.find(c => c.id === id);

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
            Document Center
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage customer files, receipts, allocations, and agreements.</p>
        </div>
        <button onClick={() => toast.error('Document upload coming soon')} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Upload Document
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search documents..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          <button onClick={() => toast.error('Filter coming soon')} className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4">Document</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date Generated</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {documents.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No documents found.</td></tr>
              ) : (
                documents.map((doc) => {
                  const cust = getCustomer(doc.customerId);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <File className="w-8 h-8 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
                          <div>
                            <p className="font-bold text-gray-900">{doc.title}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">PDF â€¢ 1.2 MB</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p onClick={() => toast.error('Customer profile coming soon')} className="text-sm font-bold text-gray-900 flex items-center gap-1.5 hover:text-[var(--color-primary)] cursor-pointer">
                          {cust?.fullName || 'Unknown'} <ExternalLink className="w-3 h-3" />
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{cust?.ref}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
                          {doc.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600">
                        {new Date(doc.generatedDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => toast.error('Document download coming soon')} className="text-gray-400 hover:text-[var(--color-primary)] p-2 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100">
                          <Download className="w-4 h-4" />
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
