"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Campaign, CampaignQuestion } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, ArrowLeft, GripVertical, GitBranch } from 'lucide-react';
import Link from 'next/link';

export default function CampaignQuestionsPage({ basePath = '/admin', params: routeParams }: { basePath?: string, params?: any }) {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [questions, setQuestions] = useState<CampaignQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<CampaignQuestion>>({
    type: 'Text',
    questionText: '',
    questionTextHausa: '',
    options: [],
    optionsHausa: [],
    optionsScores: [],
    isRequired: true,
    orderIndex: 0
  });
  const [optionsInput, setOptionsInput] = useState('');
  const [optionsHausaInput, setOptionsHausaInput] = useState('');
  const [optionsScoresInput, setOptionsScoresInput] = useState('');

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
      const qs = await api.getCampaignQuestions(campaignId);
      setQuestions(qs);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) loadData();
  }, [campaignId]);

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.questionText) {
      toast.error('Question text is required');
      return;
    }

    try {
      const qToSave: Partial<CampaignQuestion> = {
        ...currentQuestion,
        campaignId,
        options: (currentQuestion.type === 'Radio' || currentQuestion.type === 'Dropdown') 
          ? optionsInput.split(',').map(s => s.trim()).filter(Boolean) 
          : [],
        optionsHausa: (currentQuestion.type === 'Radio' || currentQuestion.type === 'Dropdown') && optionsHausaInput
          ? optionsHausaInput.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        optionsScores: (currentQuestion.type === 'Radio' || currentQuestion.type === 'Dropdown') && optionsScoresInput
          ? optionsScoresInput.split(',').map(s => Number(s.trim()) || 0)
          : []
      };
      
      // Auto-set order index if new
      if (!qToSave.id) {
        qToSave.orderIndex = questions.length;
      }

      await api.saveCampaignQuestion(qToSave);
      toast.success(isEditing ? 'Question updated' : 'Question added');
      
      // Reset form
      setIsEditing(false);
      setCurrentQuestion({ type: 'Text', questionText: '', questionTextHausa: '', options: [], optionsHausa: [], optionsScores: [], isRequired: true, orderIndex: questions.length + 1 });
      setOptionsInput('');
      setOptionsHausaInput('');
      setOptionsScoresInput('');
      loadData();
    } catch (error) {
      toast.error('Failed to save question');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await api.deleteCampaignQuestion(id);
        toast.success('Question deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const handleEdit = (q: CampaignQuestion) => {
    setCurrentQuestion(q);
    setOptionsInput(q.options?.join(', ') || '');
    setOptionsHausaInput(q.optionsHausa?.join(', ') || '');
    setOptionsScoresInput(q.optionsScores?.join(', ') || '');
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
          <h1 className="text-3xl font-bold text-gray-900">Qualification Questions</h1>
          <p className="text-gray-500">Manage questions for campaign: <strong>{campaign.name}</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question Type</label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                >
                  <option value="Text">Short Text</option>
                  <option value="Text Area">Long Text</option>
                  <option value="Number">Number</option>
                  <option value="Phone">Phone Number</option>
                  <option value="Radio">Single Choice (Radio)</option>
                  <option value="Dropdown">Dropdown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                <input
                  type="text"
                  required
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="e.g. What is your budget?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Question Text (Hausa)</label>
                <input
                  type="text"
                  value={currentQuestion.questionTextHausa || ''}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, questionTextHausa: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder="Hausa translation..."
                />
              </div>

              {(currentQuestion.type === 'Radio' || currentQuestion.type === 'Dropdown') && (
                <div className="space-y-4 border p-4 rounded-lg bg-gray-50 border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Options (English) *</label>
                    <input
                      type="text"
                      required
                      value={optionsInput}
                      onChange={(e) => setOptionsInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="e.g. Yes, No (Comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Options (Hausa)</label>
                    <input
                      type="text"
                      value={optionsHausaInput}
                      onChange={(e) => setOptionsHausaInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="e.g. Eh, Aa (Must match English order)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Option Scores</label>
                    <input
                      type="text"
                      value={optionsScoresInput}
                      onChange={(e) => setOptionsScoresInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="e.g. 10, 0 (Scores assigned to each option)"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={currentQuestion.isRequired}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, isRequired: e.target.checked})}
                  className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="isRequired" className="text-sm text-gray-700 font-medium">Required Question</label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Index</label>
                <input
                  type="number"
                  value={currentQuestion.orderIndex}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, orderIndex: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1">
                  <GitBranch className="w-4 h-4" /> Conditional Display (optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">Only show this question if another question was answered a specific way.</p>
                <select
                  value={currentQuestion.parentQuestionId || ''}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, parentQuestionId: e.target.value || null, showIfOption: null})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none mb-2"
                >
                  <option value="">Always show</option>
                  {questions.filter(q => q.id !== currentQuestion.id).map(q => (
                    <option key={q.id} value={q.id}>{q.questionText}</option>
                  ))}
                </select>

                {currentQuestion.parentQuestionId && (() => {
                  const parentQuestion = questions.find(q => q.id === currentQuestion.parentQuestionId);
                  const parentOptions = parentQuestion?.options || [];
                  return parentOptions.length > 0 ? (
                    <select
                      required
                      value={currentQuestion.showIfOption || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, showIfOption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                    >
                      <option value="">Show when answer is...</option>
                      {parentOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={currentQuestion.showIfOption || ''}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, showIfOption: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Exact answer text that triggers this question"
                    />
                  );
                })()}
              </div>

              <div className="pt-4 flex gap-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setCurrentQuestion({ type: 'Text', questionText: '', options: [], isRequired: true, orderIndex: questions.length });
                      setOptionsInput('');
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
                  {isEditing ? 'Update' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Current Questions</h2>
              <span className="text-sm font-medium text-gray-500">{questions.length} questions total</span>
            </div>
            
            {questions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No questions added yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {questions.map((q, idx) => (
                  <li key={q.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                    <div className="mt-1 text-gray-400 cursor-move">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">#{q.orderIndex}</span>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{q.type}</span>
                        {q.isRequired && <span className="text-xs font-bold text-red-600">* Required</span>}
                      </div>
                      <p className="font-semibold text-gray-900">{q.questionText}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-500"><strong className="text-gray-600">EN:</strong> {q.options.join(', ')}</p>
                          {q.optionsHausa && q.optionsHausa.length > 0 && (
                            <p className="text-gray-500"><strong className="text-gray-600">HA:</strong> {q.optionsHausa.join(', ')}</p>
                          )}
                          {q.optionsScores && q.optionsScores.length > 0 && (
                            <p className="text-gray-500"><strong className="text-gray-600">Scores:</strong> {q.optionsScores.join(', ')}</p>
                          )}
                        </div>
                      )}
                      {q.parentQuestionId && (
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          Shown only if &ldquo;{questions.find(p => p.id === q.parentQuestionId)?.questionText || 'deleted question'}&rdquo; = &ldquo;{q.showIfOption}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(q)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
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
