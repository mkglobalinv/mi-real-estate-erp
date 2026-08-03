"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, CampaignFaq } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowLeft, GripVertical } from 'lucide-react';
import Link from 'next/link';

export default function CampaignFaqsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [faqs, setFaqs] = useState<CampaignFaq[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<Partial<CampaignFaq>>({
    question: '',
    answer: '',
    orderIndex: 0
  });

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
      const fqs = await api.getCampaignFaqs(campaignId);
      setFaqs(fqs);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) loadData();
  }, [campaignId]);

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaq.question || !currentFaq.answer) {
      toast.error('Question and Answer are required');
      return;
    }

    try {
      const faqToSave: Partial<CampaignFaq> = {
        ...currentFaq,
        campaignId
      };
      
      if (!faqToSave.id) {
        faqToSave.orderIndex = faqs.length;
      }

      await api.saveCampaignFaq(faqToSave);
      toast.success(isEditing ? 'FAQ updated' : 'FAQ added');
      
      setIsEditing(false);
      setCurrentFaq({ question: '', answer: '', orderIndex: faqs.length + 1 });
      loadData();
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.deleteCampaignFaq(id);
        toast.success('FAQ deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete FAQ');
      }
    }
  };

  const handleEdit = (f: CampaignFaq) => {
    setCurrentFaq(f);
    setIsEditing(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!campaign) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`${basePath}/campaigns`} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign FAQs</h1>
          <p className="text-gray-500">Manage Frequently Asked Questions for: <strong>{campaign.name}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            <form onSubmit={handleSaveFaq} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={currentFaq.question}
                  onChange={(e) => setCurrentFaq({...currentFaq, question: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="e.g. Is the initial deposit refundable?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={currentFaq.answer}
                  onChange={(e) => setCurrentFaq({...currentFaq, answer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Provide the answer..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Index</label>
                <input
                  type="number"
                  value={currentFaq.orderIndex}
                  onChange={(e) => setCurrentFaq({...currentFaq, orderIndex: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentFaq({ question: '', answer: '', orderIndex: faqs.length });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold hover:bg-opacity-90"
                >
                  {isEditing ? 'Update' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Current FAQs</h2>
              <span className="text-sm font-medium text-gray-500">{faqs.length} FAQs total</span>
            </div>
            
            {faqs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No FAQs added yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {faqs.map((faq) => (
                  <li key={faq.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                    <div className="mt-1 text-gray-400 cursor-move">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">#{faq.orderIndex}</span>
                      </div>
                      <p className="font-semibold text-gray-900">{faq.question}</p>
                      <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(faq)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
