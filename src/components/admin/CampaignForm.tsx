"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, Project, ApplicationFormTemplate } from '@/lib/types';
import { toast } from 'react-hot-toast';

const DEFAULT_PRE_APPLICATION_PROMPT = 'Can we share you the form to fill before coming to our office and complete the agreement?';

interface CampaignFormProps {
  initialData?: Campaign;
  isEdit?: boolean;
  basePath?: string;
}

export default function CampaignForm({ initialData, isEdit, basePath = '/admin' }: CampaignFormProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formTemplates, setFormTemplates] = useState<ApplicationFormTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Campaign>>(
    initialData || {
      name: '',
      slug: '',
      projectId: '',
      description: '',
      featuredImage: '',
      fbAdReference: '',
      status: 'Draft',
      startDate: '',
      endDate: '',
      whatsappNumber: '',
      preApplicationEnabled: false,
      applicationFormTemplateId: '',
      preApplicationPrompt: ''
    }
  );

  useEffect(() => {
    api.getProjects().then(setProjects);
    api.getApplicationFormTemplates().then(setFormTemplates);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Name and Slug are required');
      return;
    }
    
    // Check duplicate slug if not editing
    if (!isEdit) {
      const existing = await api.getCampaignBySlug(formData.slug);
      if (existing) {
        toast.error('Campaign slug already exists');
        return;
      }
    }

    setLoading(true);
    try {
      const saved = await api.saveCampaign(formData);
      if (!isEdit) {
        // New campaign: seed the approved default qualification questions
        // so it has a working, Admin-editable flow immediately.
        await api.seedDefaultCampaignQuestions(saved.id).catch(err => console.error('Failed to seed default questions', err));
      }
      toast.success(`Campaign ${isEdit ? 'updated' : 'created'} successfully`);
      router.push(`${basePath}/campaigns`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="e.g. Yarimawa 2026 Easy Buy Promo"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (URL) *</label>
          <input
            type="text"
            name="slug"
            required
            disabled={isEdit}
            value={formData.slug || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none disabled:bg-gray-100"
            placeholder="e.g. yarimawa-easy-buy"
          />
          <p className="text-xs text-gray-500 mt-1">Example: /campaign/your-slug</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Linked Project</label>
          <select
            name="projectId"
            value={formData.projectId || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="">Select a Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select
            name="status"
            value={formData.status || 'Draft'}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Archived">Archived</option>
            <option value="Ended">Ended</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number (Optional)</label>
          <input
            type="text"
            name="whatsappNumber"
            value={formData.whatsappNumber || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="e.g. 08012345678"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to use company default</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook Ad Reference</label>
          <input
            type="text"
            name="fbAdReference"
            value={formData.fbAdReference || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="e.g. AD-XYZ-123"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Featured Image URL</label>
          <input
            type="text"
            name="featuredImage"
            value={formData.featuredImage || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="Enter full description for the landing page..."
          ></textarea>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Optional Pre-Application Form</h3>
        <p className="text-sm text-gray-500 mb-4">After qualification, offer the customer the official application form before handing off to WhatsApp. If off, or no form is selected, qualified customers go straight to WhatsApp.</p>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="preApplicationEnabled"
            checked={!!formData.preApplicationEnabled}
            onChange={(e) => setFormData(prev => ({ ...prev, preApplicationEnabled: e.target.checked }))}
            className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="preApplicationEnabled" className="text-sm text-gray-700 font-medium">Enable Pre-Application Form</label>
        </div>

        {formData.preApplicationEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Official Application Form *</label>
              <select
                name="applicationFormTemplateId"
                required={formData.preApplicationEnabled}
                value={formData.applicationFormTemplateId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              >
                <option value="">Select a form template</option>
                {formTemplates.filter(t => t.status === 'Active').map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {formTemplates.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No form templates yet — add one under System Settings &rarr; Application Form Templates.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prompt Text</label>
              <input
                type="text"
                name="preApplicationPrompt"
                value={formData.preApplicationPrompt || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder={DEFAULT_PRE_APPLICATION_PROMPT}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use the default prompt shown above.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push(`${basePath}/campaigns`)}
          className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Campaign' : 'Create Campaign')}
        </button>
      </div>
    </form>
  );
}
