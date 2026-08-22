"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Customer } from '@/lib/types';
import { FileText, Search, Download, Eye, DownloadCloud, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentRow {
  id: string;
  title: string;
  type: string;
  file_url: string | null;
  generated_date: string | null;
  customer_id: string | null;
  customer_ref: string;
}

function fileExtension(url: string): string {
  const clean = url.split('?')[0];
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : 'pdf';
}

async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch file (${res.status})`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

// Same blob-download mechanics as the Customer Portal's Document Center
// (src/app/portal/documents/page.tsx) — that one scopes to the signed-in
// customer's own documents, this one is unfiltered across every customer,
// for Chairman oversight.
export default function DocumentCenterPage({ basePath = '/chairman' }: { basePath?: string }) {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, custs] = await Promise.all([api.getDocuments(), api.getCustomers()]);
      setDocuments(docs as DocumentRow[]);
      setCustomers(custs);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const customerFor = (id: string | null) => customers.find(c => c.id === id);

  const documentTypes = useMemo(() => Array.from(new Set(documents.map(d => d.type))).sort(), [documents]);

  const filteredDocuments = useMemo(() => documents.filter(d => {
    const cust = customerFor(d.customer_id);
    const term = searchTerm.toLowerCase();
    const matchesSearch = term === '' ||
      d.title.toLowerCase().includes(term) ||
      cust?.fullName.toLowerCase().includes(term) ||
      d.customer_ref.toLowerCase().includes(term);
    const matchesType = typeFilter === '' || d.type === typeFilter;
    return matchesSearch && matchesType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [documents, customers, searchTerm, typeFilter]);

  const downloadableDocs = filteredDocuments.filter(d => !!d.file_url);
  const allSelected = downloadableDocs.length > 0 && downloadableDocs.every(d => selectedIds.has(d.id));

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(downloadableDocs.map(d => d.id)));
  };

  const handleDownload = async (doc: DocumentRow) => {
    if (!doc.file_url) return;
    setDownloadingId(doc.id);
    try {
      await downloadFile(doc.file_url, `${doc.title}.${fileExtension(doc.file_url)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to download ${doc.title}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadSelected = async () => {
    const docs = downloadableDocs.filter(d => selectedIds.has(d.id));
    if (docs.length === 0) return;
    setBulkDownloading(true);
    let failed = 0;
    for (const doc of docs) {
      try {
        // A short stagger between each download avoids the browser
        // blocking several triggered at once.
        await downloadFile(doc.file_url!, `${doc.title}.${fileExtension(doc.file_url!)}`);
        await new Promise(r => setTimeout(r, 300));
      } catch {
        failed++;
      }
    }
    setBulkDownloading(false);
    if (failed > 0) {
      toast.error(`${failed} of ${docs.length} file${docs.length !== 1 ? 's' : ''} failed to download.`);
    } else {
      toast.success(`Downloaded ${docs.length} file${docs.length !== 1 ? 's' : ''}.`);
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-[var(--color-primary)]" />
            Document Center
          </h1>
          <p className="text-gray-500 font-medium mt-1">Every document uploaded across all customers — select any to download.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer or document title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">All Types</option>
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {downloadableDocs.length > 0 && (
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
              Select all
            </label>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-4 w-10"></th>
                <th className="p-4">Document</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading documents...</td></tr>
              ) : filteredDocuments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No documents found.</td></tr>
              ) : (
                filteredDocuments.map(doc => {
                  const cust = customerFor(doc.customer_id);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        {doc.file_url && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(doc.id)}
                            onChange={() => toggleSelected(doc.id)}
                            className="w-4 h-4 rounded accent-[var(--color-primary)]"
                            aria-label={`Select ${doc.title}`}
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-gray-300 shrink-0" />
                          <p className="font-bold text-gray-900">{doc.title}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900">{cust?.fullName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{doc.customer_ref}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border bg-gray-100 text-gray-700 border-gray-200">
                          {doc.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-600">
                        {doc.generated_date ? new Date(doc.generated_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 text-right">
                        {doc.file_url ? (
                          <div className="flex items-center justify-end gap-3">
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:underline">
                              <Eye className="w-3.5 h-3.5" /> View
                            </a>
                            <button
                              onClick={() => handleDownload(doc)}
                              disabled={downloadingId === doc.id}
                              className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" />
                              {downloadingId === doc.id ? 'Downloading...' : 'Download'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No file</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-gray-700">{selectedIds.size} file{selectedIds.size !== 1 ? 's' : ''} selected</p>
            <button
              onClick={handleDownloadSelected}
              disabled={bulkDownloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <DownloadCloud className="w-4 h-4" />
              {bulkDownloading ? 'Downloading...' : `Download Selected (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
