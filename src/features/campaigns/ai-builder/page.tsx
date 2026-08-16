"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CampaignQuestion } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EXAMPLE_PROMPT = "Create a landing page for Sabuwar Abuja Residential Plots Extension. Show the property information, available plot sizes and payment information. Ask the customer their name, location, preferred plot size, purpose of buying, payment preference and when they want to buy. Ask them if they are ready to buy once or start instalment. If they agree to fill the form before coming to our office, send them the official application form. If they do not want the form, take them to WhatsApp.";

interface DraftConfig {
  name: string;
  suggestedSlug: string;
  description?: string;
  greetingEnabled?: boolean;
  preApplicationEnabled?: boolean;
  preApplicationPrompt?: string | null;
  questions: Array<{
    questionKey?: string | null;
    type: CampaignQuestion['type'];
    questionText: string;
    options?: string[] | null;
    isRequired: boolean;
    parentQuestionKey?: string | null;
    showIfOption?: string | null;
  }>;
}

export default function CampaignAiBuilderPage({ basePath = '/admin' }: { basePath?: string, params?: any }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Describe the campaign you want first');
      return;
    }
    setGenerating(true);
    try {
      const draft = await api.generateCampaignAiDraft(prompt.trim());
      const config = draft.generatedConfig as unknown as DraftConfig;

      let slug = (config.suggestedSlug || config.name || 'campaign').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (await api.getCampaignBySlug(slug)) {
        slug = `${slug}-${Date.now().toString().slice(-5)}`;
      }

      let campaign;
      try {
        campaign = await api.saveCampaign({
          name: config.name,
          slug,
          description: config.description,
          status: 'Draft',
          greetingEnabled: config.greetingEnabled,
          preApplicationEnabled: config.preApplicationEnabled,
          preApplicationPrompt: config.preApplicationPrompt || undefined
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'unknown error';
        throw new Error(`Failed to create campaign: ${msg}`);
      }

      const keyToId = new Map<string, string>();
      try {
        for (const q of config.questions || []) {
          const saved = await api.saveCampaignQuestion({
            campaignId: campaign.id,
            type: q.type,
            questionText: q.questionText,
            options: q.options || undefined,
            isRequired: q.isRequired,
            questionKey: q.questionKey || undefined
          });
          if (q.questionKey) keyToId.set(q.questionKey, saved.id);
        }
        for (const q of config.questions || []) {
          if (q.questionKey && q.parentQuestionKey && keyToId.has(q.parentQuestionKey)) {
            const childId = keyToId.get(q.questionKey);
            const parentId = keyToId.get(q.parentQuestionKey);
            if (childId && parentId) {
              await api.saveCampaignQuestion({ id: childId, parentQuestionId: parentId, showIfOption: q.showIfOption || null });
            }
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : (err as { message?: string })?.message || 'unknown error';
        throw new Error(`Campaign "${campaign.name}" was created, but saving its questions failed: ${msg}`);
      }

      toast.success('Campaign created as a Draft — review and activate it when ready');
      router.push(`${basePath}/campaigns/${campaign.id}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate campaign');
    } finally {
      setGenerating(false);
    }
  };

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
          <p className="text-gray-500">Describe a campaign in plain language. AI creates it as a Draft campaign — review and activate it from the campaign editor.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
            <Sparkles className="w-4 h-4" /> {generating ? 'Creating campaign...' : 'Generate & Create Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
