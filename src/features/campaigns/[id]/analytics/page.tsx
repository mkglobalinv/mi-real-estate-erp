"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Eye, PlayCircle, CheckCircle2, UserPlus, MessageCircle, FileCheck, FileX } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsEvent {
  event_type: string;
}

interface SubmissionRow {
  id: string;
  name: string | null;
  phone: string;
  status: string;
  created_at: string;
  lead_scores?: Array<{ score: number; category: string }>;
}

const STAT_TILES: Array<{ key: string; label: string; icon: typeof Eye; color: string }> = [
  { key: 'page_view', label: 'Page Views', icon: Eye, color: 'text-blue-600 bg-blue-50' },
  { key: 'wizard_start', label: 'Wizard Started', icon: PlayCircle, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'wizard_complete', label: 'Wizard Completed', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  { key: 'lead_created', label: 'Leads Created', icon: UserPlus, color: 'text-purple-600 bg-purple-50' },
  { key: 'pre_application_accepted', label: 'Form Accepted', icon: FileCheck, color: 'text-teal-600 bg-teal-50' },
  { key: 'pre_application_declined', label: 'Form Declined', icon: FileX, color: 'text-amber-600 bg-amber-50' },
  { key: 'whatsapp_click', label: 'WhatsApp Clicks', icon: MessageCircle, color: 'text-green-700 bg-green-50' },
];

export default function CampaignAnalyticsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campaignId) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const camp = await api.getCampaignById(campaignId);
        if (!camp) {
          toast.error('Campaign not found');
          router.push(`${basePath}/campaigns`);
          return;
        }
        setCampaign(camp);
        const [eventRows, submissionRows] = await Promise.all([
          api.getCampaignAnalyticsEvents(campaignId),
          api.getCampaignSubmissions(campaignId)
        ]);
        setEvents(eventRows as AnalyticsEvent[]);
        setSubmissions(submissionRows as SubmissionRow[]);
      } catch (error) {
        toast.error('Failed to load campaign analytics');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  if (!campaign) return null;

  const countOf = (eventType: string) => events.filter(e => e.event_type === eventType).length;

  const scoreCounts = { Hot: 0, Warm: 0, Cold: 0 };
  submissions.forEach(s => {
    const category = s.lead_scores?.[0]?.category;
    if (category === 'Hot' || category === 'Warm' || category === 'Cold') scoreCounts[category]++;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`${basePath}/campaigns`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-gray-500">Performance and leads for: <strong>{campaign.name}</strong></p>
        </div>
      </div>

      {/* Funnel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_TILES.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{countOf(key)}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Lead Score Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Qualification Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl bg-red-50">
            <p className="text-2xl font-bold text-red-600">{scoreCounts.Hot}</p>
            <p className="text-sm text-red-500 font-medium">Hot</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-amber-50">
            <p className="text-2xl font-bold text-amber-600">{scoreCounts.Warm}</p>
            <p className="text-sm text-amber-500 font-medium">Warm</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-blue-50">
            <p className="text-2xl font-bold text-blue-600">{scoreCounts.Cold}</p>
            <p className="text-sm text-blue-500 font-medium">Cold</p>
          </div>
        </div>
      </div>

      {/* Campaign Leads Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Campaign Leads</h2>
          <span className="text-sm font-medium text-gray-500">{submissions.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Score</th>
                <th className="p-4">Status</th>
                <th className="p-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No leads submitted yet.</td></tr>
              ) : submissions.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{s.name || '—'}</td>
                  <td className="p-4 text-gray-700">{s.phone}</td>
                  <td className="p-4">
                    {s.lead_scores?.[0] ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.lead_scores[0].category === 'Hot' ? 'bg-red-100 text-red-700' :
                        s.lead_scores[0].category === 'Warm' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {s.lead_scores[0].category} ({s.lead_scores[0].score})
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-4 text-gray-700">{s.status}</td>
                  <td className="p-4 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
