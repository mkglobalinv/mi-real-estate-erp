"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Campaign } from '@/lib/types';
import Link from 'next/link';
import { ExternalLink, Plus, Search, Edit, Trash2, Settings, ListPlus, MessageSquare, Copy, Play, Pause, Archive, BarChart3, Sparkles, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminCampaignsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.deleteCampaign(id);
        toast.success('Campaign deleted successfully');
        loadCampaigns();
      } catch (error) {
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateCampaign(id);
      toast.success('Campaign duplicated as a new Draft');
      loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleStatusChange = async (id: string, status: Campaign['status']) => {
    try {
      await api.updateCampaignStatus(id, status);
      toast.success(`Campaign ${status.toLowerCase()}`);
      loadCampaigns();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update campaign status');
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-500">Manage your active marketing campaigns.</p>
        </div>
        <div className="flex gap-3">
          <Link href={`${basePath}/campaigns/ai-builder`} className="bg-white border border-[var(--color-primary)] text-[var(--color-primary)] px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[var(--color-primary-light)]">
            <Sparkles className="w-5 h-5" />
            AI Builder
          </Link>
          <Link href={`${basePath}/campaigns/create`} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90">
            <Plus className="w-5 h-5" />
            Create Campaign
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search campaigns by name or slug..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
              <tr>
                <th className="p-4">Campaign Details</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4">Metrics</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-4"><div className="h-3 bg-gray-200 rounded w-24 mb-2"></div><div className="h-3 bg-gray-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16 mb-2"></div><div className="h-3 bg-gray-200 rounded w-16"></div></td>
                    <td className="p-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredCampaigns.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No campaigns found.</td></tr>
              ) : filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{camp.name}</p>
                    <p className="text-xs text-gray-500">/campaign/{camp.slug}</p>
                    {camp.whatsappNumber && <p className="text-xs text-green-600 mt-1">WA: {camp.whatsappNumber}</p>}
                  </td>
                  <td className="p-4 text-gray-700">
                    <p className="text-xs">Start: {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-xs">End: {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      camp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      camp.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      camp.status === 'Paused' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {camp.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{camp.clicks || 0} Clicks</p>
                    <p className="text-xs text-[var(--color-primary)] font-bold">{camp.leadsGenerated || 0} Leads</p>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <Link href={`/c/${camp.slug}`} target="_blank" title="Preview" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link href={`${basePath}/campaigns/${camp.id}/faqs`} title="Manage FAQs" className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link href={`${basePath}/campaigns/${camp.id}/packages`} title="Manage Packages" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg">
                        <Wallet className="w-4 h-4" />
                      </Link>
                      <Link href={`${basePath}/campaigns/${camp.id}/analytics`} title="View Analytics & Leads" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg">
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      <Link href={`${basePath}/campaigns/${camp.id}/questions`} title="Manage Questions" className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <ListPlus className="w-4 h-4" />
                      </Link>
                      <Link href={`${basePath}/campaigns/${camp.id}/edit`} title="Edit Campaign" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDuplicate(camp.id)} title="Duplicate" className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg">
                        <Copy className="w-4 h-4" />
                      </button>
                      {camp.status !== 'Active' && (
                        <button onClick={() => handleStatusChange(camp.id, 'Active')} title="Activate" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {camp.status === 'Active' && (
                        <button onClick={() => handleStatusChange(camp.id, 'Paused')} title="Pause" className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {camp.status !== 'Archived' && (
                        <button onClick={() => handleStatusChange(camp.id, 'Archived')} title="Archive" className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg">
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(camp.id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
