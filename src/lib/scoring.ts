export function calculateLeadScore(answers: { questionText: string; answerText: string }[]): { score: number; category: 'Hot' | 'Warm' | 'Cold'; readiness: string; timeline: string } {
  let score = 20; // Base score for completing the qualification

  let readiness = 'Not Specified';
  let timeline = 'Not Specified';

  // We perform heuristic string matching to find standard question intents
  answers.forEach(a => {
    const qLower = a.questionText.toLowerCase();
    const ansLower = a.answerText.toLowerCase();

    // Ready to start payment (+40)
    if (qLower.includes('ready to start') || qLower.includes('payment') || qLower.includes('ready to proceed')) {
      if (ansLower.includes('yes') || ansLower.includes('ready') || ansLower.includes('immediately')) {
        score += 40;
        readiness = 'Ready';
      } else {
        readiness = 'Not Ready';
      }
    }

    // Can pay form fee (+20)
    if (qLower.includes('form fee') || qLower.includes('registration fee')) {
      if (ansLower.includes('yes') || ansLower.includes('can pay') || ansLower.includes('ready')) {
        score += 20;
      }
    }

    // Timeline (+20 / +15 / +10)
    if (qLower.includes('timeline') || qLower.includes('when') || qLower.includes('how soon')) {
      if (ansLower.includes('immediate') || ansLower.includes('now') || ansLower.includes('1 week')) {
        score += 20;
        timeline = 'Immediate';
      } else if (ansLower.includes('30 days') || ansLower.includes('1 month') || ansLower.includes('few weeks')) {
        score += 15;
        timeline = 'Within 30 Days';
      } else if (ansLower.includes('90 days') || ansLower.includes('3 months')) {
        score += 10;
        timeline = 'Within 90 Days';
      } else {
        timeline = 'Future';
      }
    }

    // Budget match (+20)
    if (qLower.includes('budget') || qLower.includes('how much')) {
      // Assuming if they answered a budget question with anything other than 'I don't have' or 'None', it's a match.
      // In a real strict system, we'd compare against campaign minimum budget.
      if (ansLower.includes('don\'t') || ansLower.includes('none') || ansLower.includes('zero')) {
        // no match
      } else {
        score += 20;
      }
    }
  });

  // Cap score at 100
  score = Math.min(score, 100);

  let category: 'Hot' | 'Warm' | 'Cold' = 'Cold';
  if (score >= 90) {
    category = 'Hot';
  } else if (score >= 60) {
    category = 'Warm';
  } else {
    category = 'Cold';
  }

  return { score, category, readiness, timeline };
}
