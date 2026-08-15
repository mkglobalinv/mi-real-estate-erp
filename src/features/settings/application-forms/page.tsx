"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, FileText, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { ApplicationFormTemplate } from '@/lib/types';
import { toast } from 'react-hot-toast';

const emptyForm = { name: '', description: '', fileUrl: '', status: 'Active' as const };

export default function ApplicationFormTemplatesPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [templates, setTemplates] = useState<ApplicationFormTemplate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ApplicationFormTemplate>>(emptyForm);
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      const data = await api.getApplicationFormTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load application form templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSave = async () => {
    if (!form.name?.trim() || !form.fileUrl?.trim()) {
      toast.error('Name and Form URL are required');
      return;
    }
    try {
      await api.saveApplicationFormTemplate(editingId ? { ...form, id: editingId } : form);
      toast.success(editingId ? 'Template updated' : 'Template created');
      setForm(emptyForm);
      setEditingId(null);
      setIsAdding(false);
      loadTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const startEdit = (t: ApplicationFormTemplate) => {
    setEditingId(t.id);
    setForm({ name: t.name, description: t.description, fileUrl: t.fileUrl, status: t.status });
    setIsAdding(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-2 text-[var(--color-primary)]" />
            Official Application Form Templates
          </h1>
          <p className="text-gray-500 text-sm mt-1">These are the real ERP application forms a campaign can offer as its optional pre-application form.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setForm(emptyForm); }}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[var(--color-primary-dark)]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Template
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
          <h2 className="text-lg font-bold">{editingId ? 'Edit Template' : 'New Template'}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              placeholder="e.g. Residential Plot Application Form"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Form URL *</label>
            <input
              type="text"
              value={form.fileUrl || ''}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              placeholder="https://... (hosted PDF or official form link)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status || 'Active'}
              onChange={(e) => setForm({ ...form, status: e.target.value as ApplicationFormTemplate['status'] })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">Save</button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{t.name}</div>
                  {t.description && <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>}
                  {t.fileUrl && (
                    <a href={t.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" /> View form
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => startEdit(t)} className="text-blue-600 hover:text-blue-900 mr-4">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && templates.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  No application form templates yet. Add the official forms customers can be offered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
