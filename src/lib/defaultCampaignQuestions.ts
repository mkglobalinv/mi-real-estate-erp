import { CampaignQuestion } from './types';

// The approved initial qualification workflow (in order). Admin-configured
// per campaign via "Manage Questions" — this is only the starting seed a
// new campaign gets so it has a working, editable flow from day one.
// Plot size is deliberately free text: real plot-size options are
// campaign/project specific and must not be invented here — the Admin
// picks real options for that project via the existing question editor.
export const DEFAULT_QUALIFICATION_QUESTIONS: Array<
  Pick<CampaignQuestion, 'type' | 'questionText' | 'options' | 'isRequired' | 'questionKey' | 'orderIndex'>
> = [
  { questionKey: 'name', type: 'Text', questionText: 'What is your name?', orderIndex: 0, isRequired: true },
  { questionKey: 'location', type: 'Text', questionText: 'Where are you located?', orderIndex: 1, isRequired: true },
  { questionKey: 'plot_size', type: 'Text', questionText: 'Which plot size are you interested in?', orderIndex: 2, isRequired: true },
  { questionKey: 'purpose', type: 'Radio', questionText: 'What is your purpose of buying?', options: ['Personal Use', 'Investment', 'Resale / Business'], orderIndex: 3, isRequired: true },
  { questionKey: 'payment_preference', type: 'Radio', questionText: 'What is your payment preference?', options: ['Pay in Full (Outright)', 'Instalment / Easy Buy'], orderIndex: 4, isRequired: true },
  { questionKey: 'timeline', type: 'Radio', questionText: 'When do you want to buy?', options: ['Immediately', 'Within 30 Days', 'Within 90 Days', 'Just Researching'], orderIndex: 5, isRequired: true },
  { questionKey: 'readiness', type: 'Radio', questionText: 'Are you ready to buy once or start instalment?', options: ['Ready to buy once', 'Start with Instalment'], orderIndex: 6, isRequired: true }
];

// Client-side safety net only (e.g. a campaign created before question
// seeding existed). The canonical, admin-editable source of truth is
// always the campaign_questions table once seeded.
export function buildFallbackQuestions(campaignId: string): CampaignQuestion[] {
  return DEFAULT_QUALIFICATION_QUESTIONS.map((q, idx) => ({
    id: `fallback-${q.questionKey}-${idx}`,
    campaignId,
    createdAt: '',
    ...q
  }));
}
