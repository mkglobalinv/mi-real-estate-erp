"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { AgentPageContent, AgentPagePlan, DEFAULT_AGENT_PAGE_CONTENT } from '@/lib/agent-page-content';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Megaphone, ExternalLink, Plus, Trash2, Save, RotateCcw, Banknote } from 'lucide-react';

const inputClass = "w-full px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm";
const labelClass = "block text-sm font-bold text-gray-700 mb-1";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AgentPageSettings() {
  const [content, setContent] = useState<AgentPageContent>(DEFAULT_AGENT_PAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  useEffect(() => {
    api.getAgentPageContent().then(setContent).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AgentPageContent>(key: K, value: AgentPageContent[K]) =>
    setContent(prev => ({ ...prev, [key]: value }));

  const updatePlan = (i: number, patch: Partial<AgentPagePlan>) =>
    set('estatePlans', content.estatePlans.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let heroImageUrl = content.heroImageUrl;
      if (heroFile) {
        const supabase = createClient();
        const ext = heroFile.name.split('.').pop();
        const path = `agent_page_hero_${Date.now()}.${ext}`;
        const { error: storageError } = await supabase.storage.from('banners').upload(path, heroFile);
        if (storageError) throw new Error(storageError.message);
        heroImageUrl = supabase.storage.from('banners').getPublicUrl(path).data?.publicUrl || heroImageUrl;
      }
      const saved = await api.saveAgentPageContent({
        ...content,
        heroImageUrl,
        estateFeatures: content.estateFeatures.map(f => f.trim()).filter(Boolean),
        faqs: content.faqs.filter(f => f.q.trim() && f.a.trim()),
      });
      setContent(saved);
      setHeroFile(null);
      toast.success('Agent landing page updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Replace every field with the original default content? Nothing is saved until you click Save.')) {
      setContent(DEFAULT_AGENT_PAGE_CONTENT);
      setHeroFile(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  const heroPreview = heroFile ? URL.createObjectURL(heroFile) : content.heroImageUrl;

  return (
    <form onSubmit={handleSave} className="p-6 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--color-primary)]" /> Agent Landing Page
          </h1>
          <p className="text-gray-500 text-sm mt-1">Edit the hero banner, commission, featured estate and text on the public Become an Agent page.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/become-an-agent" target="_blank" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm inline-flex items-center gap-2 hover:bg-gray-50">
            View Page <ExternalLink className="w-4 h-4" />
          </Link>
          <button type="submit" disabled={saving} className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold text-sm inline-flex items-center gap-2 hover:bg-green-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <Section title="Hero Banner" description="The flyer or photo at the top of the page. Portrait flyers show in full without cropping.">
        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Upload New Banner Image</label>
              <input type="file" accept="image/*" onChange={e => setHeroFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              <p className="text-xs text-gray-400 mt-1">Leave empty to keep the current image.</p>
            </div>
            <div>
              <label className={labelClass}>Image Description (for screen readers)</label>
              <input type="text" value={content.heroImageAlt} onChange={e => set('heroImageAlt', e.target.value)} className={inputClass} />
            </div>
          </div>
          {heroPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPreview} alt="Hero preview" className="w-full h-60 object-contain rounded-xl border border-gray-200 bg-gray-50" />
          )}
        </div>
        <div>
          <label className={labelClass}>Badge Text</label>
          <input type="text" value={content.heroBadge} onChange={e => set('heroBadge', e.target.value)} placeholder="e.g. Now Selling: ..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Headline</label>
          <input type="text" required value={content.heroHeadline} onChange={e => set('heroHeadline', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Intro Text</label>
          <textarea rows={3} value={content.heroIntro} onChange={e => set('heroIntro', e.target.value)} className={inputClass} />
        </div>
      </Section>

      <Section title="Commission" description="What the page advertises. This does not change what agents are paid.">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <Banknote className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Actual payouts per plot type are set in <Link href="/chairman/commission-rules" className="font-bold underline">Commission Rules</Link>. Keep the two in agreement.</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Commission Rate (% of initial deposit)</label>
            <input type="number" min={0} max={100} step="0.1" required value={content.commissionRate} onChange={e => set('commissionRate', parseFloat(e.target.value) || 0)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tip Text</label>
            <input type="text" value={content.commissionTip} onChange={e => set('commissionTip', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Commission Intro</label>
          <textarea rows={2} value={content.commissionIntro} onChange={e => set('commissionIntro', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Disclaimer Under Example</label>
          <textarea rows={2} value={content.commissionNote} onChange={e => set('commissionNote', e.target.value)} className={inputClass} />
        </div>
      </Section>

      <Section title="Featured Estate" description="The estate agents are currently selling, its plot prices and payment plans. The commission example uses these deposits.">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <input type="checkbox" checked={content.estateEnabled} onChange={e => set('estateEnabled', e.target.checked)} className="w-5 h-5 accent-[var(--color-primary)]" />
          Show featured estate section
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Estate Name</label>
            <input type="text" value={content.estateName} onChange={e => set('estateName', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" value={content.estateLocation} onChange={e => set('estateLocation', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Title Document</label>
            <input type="text" value={content.estateTitleDocument} onChange={e => set('estateTitleDocument', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Payment Duration (months)</label>
            <input type="number" min={1} value={content.estateDurationMonths} onChange={e => set('estateDurationMonths', parseInt(e.target.value) || 0)} className={inputClass} />
          </div>
        </div>

        <div>
          <p className={labelClass}>Plot Plans</p>
          <div className="space-y-3">
            {content.estatePlans.map((plan, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end bg-gray-50 p-3 rounded-xl">
                <div>
                  <label className="text-xs font-bold text-gray-500">Plot Size</label>
                  <input type="text" required value={plan.size} onChange={e => updatePlan(i, { size: e.target.value })} placeholder="50 x 50" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Total Price (₦)</label>
                  <input type="number" min={0} required value={plan.price} onChange={e => updatePlan(i, { price: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Initial Deposit (₦)</label>
                  <input type="number" min={0} required value={plan.deposit} onChange={e => updatePlan(i, { deposit: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500">Monthly (₦)</label>
                  <input type="number" min={0} required value={plan.monthly} onChange={e => updatePlan(i, { monthly: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <button type="button" onClick={() => set('estatePlans', content.estatePlans.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg justify-self-start" aria-label="Remove plan">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set('estatePlans', [...content.estatePlans, { size: '', price: 0, deposit: 0, monthly: 0 }])} className="mt-3 text-sm font-bold text-[var(--color-primary)] inline-flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Plot Plan
          </button>
        </div>

        <div>
          <label className={labelClass}>Estate Features (one per line)</label>
          <textarea rows={8} value={content.estateFeatures.join('\n')} onChange={e => set('estateFeatures', e.target.value.split('\n'))} className={inputClass} />
        </div>
      </Section>

      <Section title="Frequently Asked Questions">
        <div className="space-y-3">
          {content.faqs.map((faq, i) => (
            <div key={i} className="bg-gray-50 p-3 rounded-xl space-y-2">
              <div className="flex gap-2">
                <input type="text" value={faq.q} placeholder="Question" onChange={e => set('faqs', content.faqs.map((f, idx) => idx === i ? { ...f, q: e.target.value } : f))} className={`${inputClass} font-bold`} />
                <button type="button" onClick={() => set('faqs', content.faqs.filter((_, idx) => idx !== i))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" aria-label="Remove question">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <textarea rows={2} value={faq.a} placeholder="Answer" onChange={e => set('faqs', content.faqs.map((f, idx) => idx === i ? { ...f, a: e.target.value } : f))} className={inputClass} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set('faqs', [...content.faqs, { q: '', a: '' }])} className="text-sm font-bold text-[var(--color-primary)] inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </Section>

      <Section title="Closing Call to Action">
        <div>
          <label className={labelClass}>Heading</label>
          <input type="text" value={content.finalCtaHeading} onChange={e => set('finalCtaHeading', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Text</label>
          <textarea rows={2} value={content.finalCtaText} onChange={e => set('finalCtaText', e.target.value)} className={inputClass} />
        </div>
      </Section>

      <Section title="Link Preview (WhatsApp, Facebook, Google)" description="The title and description shown when the page link is shared or searched. The hero image is used as the preview picture.">
        <div>
          <label className={labelClass}>Page Title</label>
          <input type="text" value={content.seoTitle} onChange={e => set('seoTitle', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Page Description</label>
          <textarea rows={3} value={content.seoDescription} onChange={e => set('seoDescription', e.target.value)} className={inputClass} />
        </div>
      </Section>

      <div className="flex justify-between gap-3 pt-2">
        <button type="button" onClick={resetToDefaults} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm inline-flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 inline-flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
