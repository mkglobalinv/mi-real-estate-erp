"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users as UsersIcon, Flame, ThermometerSun, Snowflake, Megaphone, MessageCircle, Percent, Activity } from 'lucide-react';

export default function SMDDashboard({ leads: propLeads }: { leads?: any[] | null }) {
  const [leads, setLeads] = useState<any[]>(propLeads || []);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propLeads !== undefined && propLeads !== null) {
      setLeads(propLeads);
      setLoading(false);
    }
  }, [propLeads]);

  useEffect(() => {
    async function loadData() {
      const fetchPromises: Promise<void>[] = [];
      if (propLeads === undefined) {
        fetchPromises.push(api.getLeads().then(setLeads));
      }
      fetchPromises.push(api.getCampaigns().then(setCampaigns));
      fetchPromises.push(api.getCampaignAnalyticsEvents().then(setAnalytics));

      await Promise.all(fetchPromises);
      if (propLeads === undefined || propLeads !== null) {
        setLoading(false);
      }
    }
    loadData();
  }, [propLeads]);

  if (loading) return (
    <div className="mb-12 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28"></div>
        ))}
      </div>
    </div>
  );

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.temperature === 'Hot').length;
  const warmLeads = leads.filter(l => l.temperature === 'Warm').length;
  const coldLeads = leads.filter(l => l.temperature === 'Cold').length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'Active').length;
  const whatsappClicks = analytics.filter(a => a.event_type === 'whatsapp_click' || a.eventType === 'whatsapp_click').length;
  const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.status === 'Closed Won').length / totalLeads) * 100).toFixed(1) : '0.0';
  const topCampaign = campaigns.length > 0 ? [...campaigns].sort((a, b) => b.leadsGenerated - a.leadsGenerated)[0] : null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Marketing Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><UsersIcon className="w-5 h-5 text-blue-500"/><span className="text-sm font-bold text-gray-500 uppercase">Total Leads</span></div>
          <h3 className="text-3xl font-extrabold">{totalLeads}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Flame className="w-5 h-5 text-red-500"/><span className="text-sm font-bold text-gray-500 uppercase">Hot Leads</span></div>
          <h3 className="text-3xl font-extrabold text-red-600">{hotLeads}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><ThermometerSun className="w-5 h-5 text-orange-500"/><span className="text-sm font-bold text-gray-500 uppercase">Warm Leads</span></div>
          <h3 className="text-3xl font-extrabold text-orange-600">{warmLeads}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Snowflake className="w-5 h-5 text-blue-300"/><span className="text-sm font-bold text-gray-500 uppercase">Cold Leads</span></div>
          <h3 className="text-3xl font-extrabold text-blue-600">{coldLeads}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Megaphone className="w-5 h-5 text-purple-500"/><span className="text-sm font-bold text-gray-500 uppercase">Active Campaigns</span></div>
          <h3 className="text-3xl font-extrabold">{activeCampaignsCount}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><MessageCircle className="w-5 h-5 text-green-500"/><span className="text-sm font-bold text-gray-500 uppercase">WhatsApp Clicks</span></div>
          <h3 className="text-3xl font-extrabold">{whatsappClicks}</h3>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2"><Percent className="w-5 h-5 text-teal-500"/><span className="text-sm font-bold text-gray-500 uppercase">Conversion Rate</span></div>
          <h3 className="text-3xl font-extrabold">{conversionRate}%</h3>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-indigo-700"/><span className="text-sm font-bold text-indigo-800 uppercase">Top Campaign</span></div>
          <h3 className="text-xl font-extrabold text-indigo-900 truncate" title={topCampaign?.name}>{topCampaign?.name || 'N/A'}</h3>
        </div>
      </div>
    </div>
  );
}
