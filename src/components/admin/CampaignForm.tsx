"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, Project } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface CampaignFormProps {
  initialData?: Campaign;
  isEdit?: boolean;
}

export default function CampaignForm({ initialData, isEdit }: CampaignFormProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
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
      whatsappNumber: ''
    }
  );

  useEffect(() => {
    api.getProjects().then(setProjects);
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
      await api.saveCampaign(formData);
      toast.success(`Campaign ${isEdit ? 'updated' : 'created'} successfully`);
      router.push('/admin/campaigns');
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

      <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.push('/admin/campaigns')}
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
