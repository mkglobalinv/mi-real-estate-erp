"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Lock, Loader2, FolderOpen, DownloadCloud } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

interface DocumentRow {
  id: string;
  title: string;
  type: string;
  file_url: string | null;
  generated_date: string | null;
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

export default function PortalDocuments() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);

  useEffect(() => {
    async function loadDocs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) { setLoading(false); return; }

        // Resolve customer by email
        const { data: customer } = await supabase
          .from('customers').select('id').eq('email', user.email).maybeSingle();
        if (!customer) { setLoading(false); return; }

        // Fetch their documents
        const { data: docs } = await supabase
          .from('documents')
          .select('id, title, type, file_url, generated_date')
          .eq('customer_id', customer.id)
          .order('generated_date', { ascending: false });

        setDocuments(docs ?? []);
      } catch (err: unknown) {
        console.error('Failed to load documents', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const downloadableDocs = documents.filter(d => !!d.file_url);
  const allSelected = downloadableDocs.length > 0 && selectedIds.size === downloadableDocs.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(downloadableDocs.map(d => d.id)));
  };

  const handleDownload = async (doc: DocumentRow) => {
    if (!doc.file_url) return;
    setDownloadingId(doc.id);
    try {
      await downloadFile(doc.file_url, `${doc.title}.${fileExtension(doc.file_url)}`);
    } catch (err: any) {
      toast.error(err.message || `Failed to download ${doc.title}`);
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
        // Each file downloads as its own file (image stays image, PDF stays
        // PDF) - a short stagger between each avoids the browser blocking
        // several downloads fired at once.
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
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading documents...
      </div>
    );
  }

  // Group documents by type
  const grouped = documents.reduce<Record<string, DocumentRow[]>>((acc, doc) => {
    const key = doc.type || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  const typeColor: Record<string, string> = {
    'Registration': 'bg-indigo-50 border-indigo-100',
    'Financial': 'bg-emerald-50 border-emerald-100',
    'Allocation': 'bg-blue-50 border-blue-100',
    'Legal': 'bg-amber-50 border-amber-100',
    'Other': 'bg-gray-50 border-gray-100',
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <FolderOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Document Center</h1>
            <p className="text-gray-500 text-sm">
              Secure access to all your official files.
            </p>
          </div>
        </div>
        {downloadableDocs.length > 0 && (
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer">
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded accent-[var(--color-primary)]" />
            Select all
          </label>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-700 font-bold text-lg mb-1">No documents yet</h3>
          <p className="text-gray-400 text-sm">
            Your documents will appear here once they are generated by the office.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([type, docs]) => (
          <div
            key={type}
            className={`rounded-2xl border shadow-sm overflow-hidden ${typeColor[type] ?? typeColor['Other']}`}
          >
            <div className="px-6 py-4 border-b border-inherit">
              <h2 className="font-bold text-gray-800 text-sm">{type} Documents</h2>
              <p className="text-xs text-gray-500">{docs.length} file{docs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="divide-y divide-white/60">
              {docs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-3.5 bg-white/60 hover:bg-white/90 transition-colors gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {doc.file_url && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(doc.id)}
                        onChange={() => toggleSelected(doc.id)}
                        className="w-4 h-4 rounded accent-[var(--color-primary)] shrink-0"
                      />
                    )}
                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-400">
                        {doc.generated_date
                          ? new Date(doc.generated_date).toLocaleDateString()
                          : 'Date not set'}
                      </p>
                    </div>
                  </div>
                  {doc.file_url ? (
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
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
                    <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0 ml-4">
                      <Lock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Sticky bulk-download bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
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
