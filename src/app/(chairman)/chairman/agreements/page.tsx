"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckSquare, XCircle, AlertCircle, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChairmanAgreementsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const docs = await api.getDocuments();
      const custs = await api.getCustomers();
      
      // Filter for agreements
      const agreements = docs.filter(d => 
        (d.type === 'Sale Agreement' || d.type === 'Offer Letter') &&
        d.status === 'Pending Review'
      );
      setDocuments(agreements);
      setCustomers(custs);
    } catch (err: any) {
      toast.error('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (docId: string, action: 'Approved' | 'Rejected' | 'Revision Requested') => {
    try {
      const doc = documents.find(d => d.id === docId);
      const customer = customers.find(c => c.id === doc?.customerId);
      if (doc) {
        await api.saveDocument({ ...doc, status: action });
        
        await api.createActivityLog({
          module: 'Agreements',
          action: `Chairman ${action} Agreement`,
          details: { docId: doc.id, customerId: customer?.id }
        });

        await api.createNotification({
          title: `Agreement ${action}`,
          message: `Agreement for ${customer?.fullName || 'Customer'} was marked as ${action} by Chairman.`,
          type: action === 'Approved' ? 'System' : 'Alert'
        });

        toast.success(`Agreement ${action} successfully.`);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update agreement');
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse text-gray-500">Loading Agreements...</div>;
  }

  const filteredDocs = documents.filter(d => 
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customers.find(c => c.id === d.customerId)?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-primary)]" />
            Agreement Review
          </h1>
          <p className="text-gray-500 mt-1">Review legal agreements and offer letters pending your approval.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agreements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Document</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Customer Info</th>
                <th className="p-4 font-bold">Date Uploaded</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No agreements pending review.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => {
                  const customer = customers.find(c => c.id === doc.customerId);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{doc.title || 'Untitled Document'}</td>
                      <td className="p-4 text-gray-600">{doc.type}</td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{customer?.fullName || 'Unknown'}</p>
                      </td>
                      <td className="p-4 text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => window.open(doc.url || '#', '_blank')}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => handleAction(doc.id, 'Revision Requested')}
                          className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                        >
                          <AlertCircle className="w-3 h-3" />
                          Revision
                        </button>
                        <button
                          onClick={() => handleAction(doc.id, 'Rejected')}
                          className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAction(doc.id, 'Approved')}
                          className="inline-flex items-center gap-1 bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                        >
                          <CheckSquare className="w-3 h-3" />
                          Approve
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
