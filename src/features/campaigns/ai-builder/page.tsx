"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CampaignAiDraft } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Sparkles, CheckCircle, XCircle, AlertTriangle, GitBranch, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface DraftQuestion {
  questionKey?: string | null;
  type: string;
  questionText: string;
  options?: string[] | null;
  isRequired: boolean;
  parentQuestionKey?: string | null;
  showIfOption?: string | null;
}

interface DraftConfig {
  name: string;
  suggestedSlug: string;
  description?: string;
  greetingEnabled?: boolean;
  preApplicationEnabled?: boolean;
  preApplicationPrompt?: string | null;
  questions: DraftQuestion[];
  assumptionsForAdminReview?: string[];
}

const EXAMPLE_PROMPT = "Create a landing page for Sabuwar Abuja Residential Plots Extension. Show the property information, available plot sizes and payment information. Ask the customer their name, location, preferred plot size, purpose of buying, payment preference and when they want to buy. Ask them if they are ready to buy once or start instalment. If they agree to fill the form before coming to our office, send them the official application form. If they do not want the form, take them to WhatsApp.";

export default function CampaignAiBuilderPage({ basePath = '/admin' }: { basePath?: string, params?: any }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<CampaignAiDraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const data = await api.getCampaignAiDrafts();
      setDrafts(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (error) {
      toast.error('Failed to load AI drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Describe the campaign you want first');
      return;
    }
    setGenerating(true);
    try {
      const draft = await api.generateCampaignAiDraft(prompt.trim());
      toast.success('Draft generated — review it before approving');
      setPrompt('');
      setSelectedId(draft.id);
      loadDrafts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate draft');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (draftId: string) => {
    if (!confirm('Create a Draft campaign from this AI draft? You can still edit everything before activating it.')) return;
    setActionLoading(true);
    try {
      const campaign = await api.approveCampaignAiDraft(draftId);
      toast.success('Campaign created as a Draft — review and activate it when ready');
      router.push(`${basePath}/campaigns/${campaign.id}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (draftId: string) => {
    if (!confirm('Reject this AI draft? It will not become a campaign.')) return;
    setActionLoading(true);
    try {
      await api.rejectCampaignAiDraft(draftId);
      toast.success('Draft rejected');
      loadDrafts();
    } catch (error) {
      toast.error('Failed to reject draft');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedDraft = drafts.find(d => d.id === selectedId);
  const config = selectedDraft?.generatedConfig as unknown as DraftConfig | undefined;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`${basePath}/campaigns`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-[var(--color-primary)]" />
            AI Campaign Builder
          </h1>
          <p className="text-gray-500">Describe a campaign in plain language. AI drafts it — nothing publishes until you approve it.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Describe the campaign</label>
        <textarea
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={EXAMPLE_PROMPT}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> {generating ? 'Generating...' : 'Generate Draft'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No AI drafts yet. Describe a campaign above to generate one.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-2">
            {drafts.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedId === d.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
              >
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{d.promptText}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  d.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' :
                  d.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {d.status}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {config && selectedDraft && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{config.name}</h2>
                  <p className="text-sm text-gray-500">/c/{config.suggestedSlug}</p>
                </div>

                {config.description && (
                  <p className="text-gray-700 whitespace-pre-line">{config.description}</p>
                )}

                <div className="flex gap-4 text-sm">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${config.greetingEnabled !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    Greeting {config.greetingEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${config.preApplicationEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    Pre-Application Form {config.preApplicationEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
                {config.preApplicationEnabled && config.preApplicationPrompt && (
                  <p className="text-sm text-gray-600 italic">&ldquo;{config.preApplicationPrompt}&rdquo;</p>
                )}

                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Qualification Questions ({config.questions?.length || 0})</h3>
                  <ul className="space-y-2">
                    {(config.questions || []).map((q, idx) => (
                      <li key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.type}</span>
                          {q.isRequired && <span className="text-xs font-bold text-red-600">* Required</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{q.questionText}</p>
                        {q.options && q.options.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Options: {q.options.join(', ')}</p>
                        )}
                        {q.parentQuestionKey && (
                          <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <GitBranch className="w-3 h-3" /> Shown only if &ldquo;{q.parentQuestionKey}&rdquo; = &ldquo;{q.showIfOption}&rdquo;
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {config.assumptionsForAdminReview && config.assumptionsForAdminReview.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Needs Your Review Before Publishing
                    </h3>
                    <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                      {config.assumptionsForAdminReview.map((a, idx) => <li key={idx}>{a}</li>)}
                    </ul>
                  </div>
                )}

                {selectedDraft.status === 'Pending Review' && (
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleReject(selectedDraft.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedDraft.id)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Create Draft Campaign
                    </button>
                  </div>
                )}
                {selectedDraft.status !== 'Pending Review' && (
                  <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
                    This draft was {selectedDraft.status.toLowerCase()} on {selectedDraft.reviewedAt ? new Date(selectedDraft.reviewedAt).toLocaleString() : '—'}.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
