"use client";

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

// Shared selection bar + confirm modal for Chairman list pages that support
// checkbox multi-select delete (Customers, Agents, Campaigns, Banners).
// Renders nothing when nothing is selected.
export default function BulkDeleteBar({
  count,
  itemLabel,
  consequence,
  onConfirm,
  onClear,
}: {
  count: number;
  itemLabel: string;
  consequence?: string;
  onConfirm: () => Promise<void>;
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (count === 0) return null;

  const plural = count === 1 ? itemLabel : `${itemLabel}s`;

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 mb-4 flex items-center justify-between gap-4 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg">
        <span className="text-sm font-bold">{count} {plural} selected</span>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="text-xs font-medium text-gray-300 hover:text-white px-2 py-1">Clear</button>
          <button onClick={() => setConfirming(true)} className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete {count}
          </button>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setConfirming(false)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {count} {plural}?</h3>
            <p className="text-sm text-gray-500">This cannot be undone.</p>
            {consequence && <p className="text-sm text-gray-500 mt-2">{consequence}</p>}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => setConfirming(false)} disabled={deleting} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium disabled:opacity-50">Cancel</button>
              <button onClick={handleConfirm} disabled={deleting} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : `Delete ${count} ${plural}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
