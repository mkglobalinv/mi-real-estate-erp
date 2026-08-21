"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Banner } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BulkDeleteBar from '@/components/admin/BulkDeleteBar';

const emptyBanner: Partial<Banner> = { isActive: true, orderIndex: 0 };

export default function BannerManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Banner>>(emptyBanner);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getBanners();
    setBanners(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.imageUrl && !file) return;
    setUploading(true);
    try {
      let imageUrl = current.imageUrl || '';
      if (file) {
        const supabase = createClient();
        const ext = file.name.split('.').pop();
        const path = `banner_${Date.now()}.${ext}`;
        const { error: storageError } = await supabase.storage.from('banners').upload(path, file);
        if (storageError) throw new Error(storageError.message);
        const { data: urlData } = supabase.storage.from('banners').getPublicUrl(path);
        imageUrl = urlData?.publicUrl || '';
      }
      await api.saveBanner({ ...current, imageUrl });
      setIsEditing(false);
      setCurrent(emptyBanner);
      setFile(null);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      await api.deleteBanner(id);
      loadData();
    }
  };

  const toggleStatus = async (banner: Banner) => {
    await api.saveBanner({ ...banner, isActive: !banner.isActive });
    loadData();
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.length === banners.length ? [] : banners.map(b => b.id));
  };

  const handleBulkDelete = async () => {
    try {
      await api.deleteBanners(selectedIds);
      toast.success(`${selectedIds.length} banner(s) deleted`);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete banners');
    }
  };

  // datetime-local inputs need "YYYY-MM-DDTHH:mm" with no timezone suffix.
  const toLocalInput = (iso?: string) => iso ? iso.slice(0, 16) : '';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[var(--color-primary)]" /> Promo Banners
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage the promotional slider shown on the customer portal dashboard.</p>
        </div>
        <button onClick={() => { setIsEditing(true); setCurrent(emptyBanner); setFile(null); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{current.id ? 'Edit Banner' : 'Create Banner'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Banner Image {current.id ? '' : <span className="text-red-500">*</span>}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              {(file || current.imageUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file ? URL.createObjectURL(file) : current.imageUrl}
                  alt="Preview"
                  className="mt-3 h-24 w-full max-w-md object-cover rounded-xl border border-gray-200"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title (optional)</label>
                <input type="text" value={current.title || ''} onChange={e => setCurrent({ ...current, title: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Click Destination URL (optional)</label>
                <input type="url" value={current.clickUrl || ''} onChange={e => setCurrent({ ...current, clickUrl: e.target.value })} placeholder="https://..." className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description (optional)</label>
              <textarea value={current.description || ''} onChange={e => setCurrent({ ...current, description: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" rows={2}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Starts (optional)</label>
                <input type="datetime-local" value={toLocalInput(current.startAt)} onChange={e => setCurrent({ ...current, startAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ends (optional)</label>
                <input type="datetime-local" value={toLocalInput(current.endAt)} onChange={e => setCurrent({ ...current, endAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Display Order</label>
                <input type="number" value={current.orderIndex ?? 0} onChange={e => setCurrent({ ...current, orderIndex: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="banner-status" checked={current.isActive ?? true} onChange={e => setCurrent({ ...current, isActive: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary)]" />
                <label htmlFor="banner-status" className="font-bold text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setIsEditing(false); setFile(null); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button type="submit" disabled={uploading} className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50">
                {uploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <BulkDeleteBar
        count={selectedIds.length}
        itemLabel="banner"
        onConfirm={handleBulkDelete}
        onClear={() => setSelectedIds([])}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 w-10">
                <input type="checkbox" checked={banners.length > 0 && selectedIds.length === banners.length} onChange={toggleSelectAll} className="w-4 h-4 accent-[var(--color-primary)]" aria-label="Select all banners" />
              </th>
              <th className="p-4 font-bold text-gray-600 text-sm">Image</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Title</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Destination</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Order</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {banners.map(b => (
              <tr key={b.id} className={`hover:bg-gray-50 ${selectedIds.includes(b.id) ? 'bg-green-50/50' : ''}`}>
                <td className="p-4">
                  <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelected(b.id)} className="w-4 h-4 accent-[var(--color-primary)]" aria-label={`Select ${b.title || 'banner'}`} />
                </td>
                <td className="p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.imageUrl} alt={b.title || 'Banner'} className="h-12 w-24 object-cover rounded-lg border border-gray-100 bg-gray-50" />
                </td>
                <td className="p-4 font-bold text-gray-900">{b.title || <span className="text-gray-400 font-normal italic">Untitled</span>}</td>
                <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                  {b.clickUrl ? (
                    <a href={b.clickUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      {b.clickUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : <span className="text-gray-400 italic">None</span>}
                </td>
                <td className="p-4 text-gray-600 text-sm">{b.orderIndex}</td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(b)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {b.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 flex items-center gap-2">
                  <button onClick={() => { setCurrent(b); setIsEditing(true); setFile(null); }} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-500">No banners found. Create one to populate the customer dashboard slider.</div>
        )}
      </div>
    </div>
  );
}
