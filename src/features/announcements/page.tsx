"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Announcement } from '@/lib/types';
import { Megaphone, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function AnnouncementsManager({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Partial<Announcement>>({ priority: 'Normal', activeStatus: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await api.getAnnouncements();
    setAnnouncements(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.title || !current.message) return;
    await api.saveAnnouncement(current);
    setIsEditing(false);
    setCurrent({ priority: 'Normal', activeStatus: true });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      await api.deleteAnnouncement(id);
      loadData();
    }
  };

  const toggleStatus = async (ann: Announcement) => {
    await api.saveAnnouncement({ ...ann, activeStatus: !ann.activeStatus });
    loadData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--color-primary)]" /> Announcements Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage scrolling news marquee on the public website.</p>
        </div>
        <button onClick={() => { setIsEditing(true); setCurrent({ priority: 'Normal', activeStatus: true }); }} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold mb-4">{current.id ? 'Edit Announcement' : 'Create Announcement'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input required type="text" value={current.title || ''} onChange={e => setCurrent({...current, title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                <select value={current.priority || 'Normal'} onChange={e => setCurrent({...current, priority: e.target.value as any})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
              <textarea required value={current.message || ''} onChange={e => setCurrent({...current, message: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" rows={3}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                <input required type="date" value={current.endDate || ''} onChange={e => setCurrent({...current, endDate: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="status" checked={current.activeStatus || false} onChange={e => setCurrent({...current, activeStatus: e.target.checked})} className="w-5 h-5 accent-[var(--color-primary)]" />
                <label htmlFor="status" className="font-bold text-gray-700">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-green-700">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-sm">Title</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Message</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Priority</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {announcements.map(ann => (
              <tr key={ann.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{ann.title}</td>
                <td className="p-4 text-gray-600 text-sm max-w-xs truncate">{ann.message}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${ann.priority === 'High' ? 'bg-red-100 text-red-700' : ann.priority === 'Normal' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {ann.priority}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => toggleStatus(ann)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${ann.activeStatus ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ann.activeStatus ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {ann.activeStatus ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 flex items-center gap-2">
                  <button onClick={() => { setCurrent(ann); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-[var(--color-primary)] hover:bg-green-50 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">No announcements found.</div>
        )}
      </div>
    </div>
  );
}
