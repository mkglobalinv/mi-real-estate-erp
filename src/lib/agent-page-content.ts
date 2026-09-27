// Editable content for the public "Become an Agent" landing page
// (src/app/(public)/become-an-agent). Stored as one JSON row in
// public.agent_page_settings (schema.sql section 40) and edited by the
// Chairman at /chairman/agent-page. DEFAULT_AGENT_PAGE_CONTENT is what the
// page shows before anything has been saved, or if the row can't be read.
//
// The commission rate here is display copy only. Actual commission paid is
// set per plot type in Commission Rules (agent_commission_rules).

export interface AgentPagePlan {
  size: string;
  price: number;
  deposit: number;
  monthly: number;
}

export interface AgentPageFaq {
  q: string;
  a: string;
}

export interface AgentPageContent {
  heroBadge: string;
  heroHeadline: string;
  heroIntro: string;
  heroImageUrl: string;
  heroImageAlt: string;

  commissionRate: number; // percent of the customer's initial deposit, e.g. 50
  commissionIntro: string;
  commissionNote: string;
  commissionTip: string;

  estateEnabled: boolean;
  estateName: string;
  estateLocation: string;
  estateTitleDocument: string;
  estateDurationMonths: number;
  estatePlans: AgentPagePlan[];
  estateFeatures: string[];

  faqs: AgentPageFaq[];

  finalCtaHeading: string;
  finalCtaText: string;

  seoTitle: string;
  seoDescription: string;
}

export const DEFAULT_AGENT_PAGE_CONTENT: AgentPageContent = {
  heroBadge: 'Now Selling: Yarimawa Hills Estate, Kano',
  heroHeadline: 'Become an M.I. Real Estate Agent',
  heroIntro: 'Sell plots at Yarimawa Hills Estate Private Layout, opposite Janguza Langel, Kano — 50x50 plots at ₦4,000,000 or 25x50 plots at ₦2,000,000 on 18-month Easy-Buy — and earn 50% commission on your customer’s initial deposit. Registration is free.',
  heroImageUrl: '/images/yarimawa-hills-flyer.jpg',
  heroImageAlt: 'Yarimawa Hills Estate Private Layout, opposite Janguza Langel, Kano — 50x50 plot ₦4,000,000, 25x50 plot ₦2,000,000, 18-month Easy-Buy',

  commissionRate: 50,
  commissionIntro: 'When you refer a customer who is verified, approved and successfully pays the initial deposit to start their plot payment.',
  commissionNote: 'Example only, based on the current Easy-Buy deposits. Actual commission is set per plot type and is subject to customer verification, Chairman approval and confirmation of the customer’s successful initial payment.',
  commissionTip: 'The more people you connect to land, the more you earn!',

  estateEnabled: true,
  estateName: 'Yarimawa Hills Estate',
  estateLocation: 'Opposite Janguza Langel, Kano',
  estateTitleDocument: 'Letter of Grant issued by Kano State Ministry of Land and Physical Planning',
  estateDurationMonths: 18,
  estatePlans: [
    { size: '50 x 50', price: 4000000, deposit: 400000, monthly: 200000 },
    { size: '25 x 50', price: 2000000, deposit: 200000, monthly: 100000 },
  ],
  estateFeatures: ['Good Road Network', 'Mosque & Islamiyyah', 'Nursery School', 'Clinic', 'Shopping Area', 'Recreational Area', 'Secure & Serene Environment', 'Ideal for Families'],

  faqs: [
    { q: 'Which estate am I selling right now?', a: 'Yarimawa Hills Estate Private Layout, opposite Janguza Langel, Kano — 50x50 plots at ₦4,000,000 and 25x50 plots at ₦2,000,000, both on an 18-month Easy-Buy plan, with a Letter of Grant from the Kano State Ministry of Land and Physical Planning.' },
    { q: 'Do I need to visit your office?', a: 'No. You can register online and operate as an agent from wherever you are.' },
    { q: 'Who can become an agent?', a: 'Individuals, marketers, property consultants, businesses and other eligible people can apply.' },
    { q: 'How much is the commission?', a: 'Commission is a percentage of the qualifying customer’s initial deposit, set per plot type by the Chairman — for example, at 50%, a 50x50 plot (₦4,000,000) with a ₦400,000 deposit earns you ₦200,000, and a 25x50 plot (₦2,000,000) with a ₦200,000 deposit earns you ₦100,000.' },
    { q: 'When do I receive my commission?', a: 'After your customer is verified and approved, successfully pays their initial deposit, and the commission is approved by the Chairman.' },
    { q: 'Can I promote your projects online?', a: 'Yes. Share your referral link or any live project listing on WhatsApp, Facebook, TikTok, Instagram or anywhere else.' },
    { q: 'Can I see my customers?', a: 'Yes. Every customer you refer and their status is visible in your agent dashboard.' },
    { q: 'Can I contact M.I. Real Estate?', a: 'Yes. Your dashboard and every project page include a direct WhatsApp option.' },
    { q: 'Is there a registration fee?', a: 'No. Registration is completely free.' },
  ],

  finalCtaHeading: 'Ready to Become an M.I. Real Estate Agent?',
  finalCtaText: 'Create your free account online and start connecting customers to plots at Yarimawa Hills Estate, Kano — invest today for a better tomorrow.',

  seoTitle: 'Become an Agent — Yarimawa Hills Estate, Kano | M.I. Real Estate',
  seoDescription: 'Join M.I. Real Estate as an agent and earn 50% commission selling plots at Yarimawa Hills Estate Private Layout, opposite Janguza Langel, Kano. 50x50 plots ₦4,000,000 and 25x50 plots ₦2,000,000 with 18-month Easy-Buy instalments. Letter of Grant issued by Kano State Ministry of Land. Free registration.',
};

// Fills in any field missing from a saved row (e.g. one saved before a new
// field was added) so the page never renders undefined.
export function withAgentPageDefaults(saved: Partial<AgentPageContent> | null | undefined): AgentPageContent {
  const merged = { ...DEFAULT_AGENT_PAGE_CONTENT };
  if (!saved) return merged;
  for (const key of Object.keys(merged) as (keyof AgentPageContent)[]) {
    const value = saved[key];
    if (value !== undefined && value !== null) (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}
