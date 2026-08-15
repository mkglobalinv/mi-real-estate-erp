import { CampaignQuestion, Campaign } from './types';

export function calculateLeadScore(
  answers: { questionId: string; questionText: string; answerText: string }[],
  questions: CampaignQuestion[],
  campaign: Campaign
): { score: number; category: 'Hot' | 'Warm' | 'Cold'; readiness: string; timeline: string } {
  let score = 20; // Base score for completing the qualification

  let readiness = 'Not Specified';
  let timeline = 'Not Specified';

  // Data-driven calculation based on configured option scores
  answers.forEach(a => {
    const q = questions.find(q => q.id === a.questionId);
    if (q) {
      // Find the index of the selected answer in either English or Hausa options
      let optIdx = -1;
      if (q.options) {
        optIdx = q.options.findIndex(opt => opt === a.answerText);
      }
      if (optIdx === -1 && q.optionsHausa) {
        optIdx = q.optionsHausa.findIndex(opt => opt === a.answerText);
      }

      // Add the score configured for this option, if available
      if (optIdx !== -1 && q.optionsScores && q.optionsScores[optIdx] !== undefined) {
        score += q.optionsScores[optIdx];
      }
      
      // Still populate readiness and timeline if standard keys exist
      if (q.questionKey === 'readiness') {
        readiness = a.answerText;
      }
      if (q.questionKey === 'timeline') {
        timeline = a.answerText;
      }
    }
  });

  // Cap score at 100
  score = Math.min(score, 100);

  const hotThreshold = campaign.hotThreshold ?? 90;
  const warmThreshold = campaign.warmThreshold ?? 60;

  let category: 'Hot' | 'Warm' | 'Cold' = 'Cold';
  if (score >= hotThreshold) {
    category = 'Hot';
  } else if (score >= warmThreshold) {
    category = 'Warm';
  } else {
    category = 'Cold';
  }

  return { score, category, readiness, timeline };
}

