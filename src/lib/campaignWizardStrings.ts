import { Campaign, CampaignGreetingConfig } from './types';

export type WizardLanguage = 'English' | 'Hausa';

export const SUPPORTED_LANGUAGES: WizardLanguage[] = ['English', 'Hausa'];

interface WizardStrings {
  welcomeHeading: string;
  welcomeSubtext: string;
  startButton: string;
  questionLabel: (index: number, total: number) => string;
  backButton: string;
  yourDetailsHeading: string;
  yourDetailsSubtext: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  completeButton: string;
  processingButton: string;
  successHeading: string;
  successSubtext: (name: string, category: string) => string;
  nextStepLabel: string;
  nextStepBody: string;
  continueWhatsApp: string;
  changeLanguage: string;
  languagePrompt: string;
  continueButton: string;
  defaultPreApplicationPrompt: string;
  yesButton: string;
  noButton: string;
  openFormButton: string;
  formOpenedNote: string;
}

const STRINGS: Record<WizardLanguage, WizardStrings> = {
  English: {
    welcomeHeading: 'Welcome!',
    welcomeSubtext: 'Answer a few quick questions to see if you qualify for our exclusive offers.',
    startButton: 'Start Qualification',
    questionLabel: (i, n) => `Question ${i} of ${n}`,
    backButton: 'Back',
    yourDetailsHeading: 'Your Details',
    yourDetailsSubtext: 'Great! Where should we send your tailored recommendations?',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '08012345678',
    completeButton: 'Complete Qualification',
    processingButton: 'Processing...',
    successHeading: "You're Qualified!",
    successSubtext: (name, category) => `Thank you, ${name}. Based on your answers, you are a ${category} Match for this offer.`,
    nextStepLabel: 'Next Step:',
    nextStepBody: 'Click below to connect with our Campaign Specialist directly on WhatsApp to finalize your slot.',
    continueWhatsApp: 'Continue to WhatsApp',
    changeLanguage: 'Change language',
    languagePrompt: 'Can you continue with English or Hausa?',
    continueButton: 'Continue',
    defaultPreApplicationPrompt: 'Can we share you the form to fill before coming to our office and complete the agreement?',
    yesButton: 'Yes, please',
    noButton: 'No, thanks',
    openFormButton: 'Open Application Form',
    formOpenedNote: "We've opened the application form in a new tab. You can also continue to WhatsApp below."
  },
  Hausa: {
    welcomeHeading: 'Barka da zuwa!',
    welcomeSubtext: "Ka amsa 'yan tambayoyi kadan don mu ga ko ka cancanci tayin mu na musamman.",
    startButton: 'Fara Tambayoyin Cancanta',
    questionLabel: (i, n) => `Tambaya ${i} daga cikin ${n}`,
    backButton: 'Baya',
    yourDetailsHeading: 'Bayananka',
    yourDetailsSubtext: 'Madalla! A ina za mu aiko maka da shawarwarin da suka dace da kai?',
    fullNameLabel: 'Cikakken Suna',
    fullNamePlaceholder: 'Shigar da cikakken sunanka',
    phoneLabel: 'Lambar Waya',
    phonePlaceholder: '08012345678',
    completeButton: 'Kammala Tambayoyin',
    processingButton: 'Ana aiwatarwa...',
    successHeading: 'Ka Cancanta!',
    successSubtext: (name, category) => `Na gode, ${name}. Bisa amsoshinka, kai ${category} ne ga wannan tayi.`,
    nextStepLabel: 'Mataki na Gaba:',
    nextStepBody: 'Danna kasa don tuntubar Kwararrenmu na Kamfen kai tsaye a WhatsApp domin kammala matakinka.',
    continueWhatsApp: 'Ci gaba zuwa WhatsApp',
    changeLanguage: 'Canza Harshe',
    languagePrompt: 'Za ka iya ci gaba da Turanci ko Hausa?',
    continueButton: 'Ci gaba',
    defaultPreApplicationPrompt: 'Za mu iya raba maka fom din da za ka cika kafin zuwa ofishinmu domin kammala yarjejeniya?',
    yesButton: 'Ee, don Allah',
    noButton: "A'a, na gode",
    openFormButton: 'Bude Fom din Nema',
    formOpenedNote: 'Mun bude fom din a shafi na daban. Hakanan za ka iya ci gaba zuwa WhatsApp a kasa.'
  }
};

export function getWizardStrings(language: string): WizardStrings {
  return STRINGS[language as WizardLanguage] || STRINGS.English;
}

const DEFAULT_GREETINGS: Record<WizardLanguage, { morning: string; afternoon: string; evening: string }> = {
  English: {
    morning: 'Hello, Good morning. Welcome to M.I. Real Estate and General Enterprises Ltd.',
    afternoon: 'Hello, Good afternoon. Welcome to M.I. Real Estate and General Enterprises Ltd.',
    evening: 'Hello, Good evening. Welcome to M.I. Real Estate and General Enterprises Ltd.'
  },
  Hausa: {
    morning: 'Barka da safiya. Barka da zuwa M.I. Real Estate and General Enterprises Ltd.',
    afternoon: 'Barka da rana. Barka da zuwa M.I. Real Estate and General Enterprises Ltd.',
    evening: 'Barka da yamma. Barka da zuwa M.I. Real Estate and General Enterprises Ltd.'
  }
};

// The formal greeting is shown before the customer has picked a language,
// so it always uses the campaign's default language (English unless the
// Admin configured otherwise) — never the in-progress wizard selection.
export function getFormalGreeting(campaign: Campaign): string {
  const hour = new Date().getHours();
  const timeOfDay: 'morning' | 'afternoon' | 'evening' = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const language = (campaign.defaultLanguage as WizardLanguage) || 'English';
  const overrideConfig = campaign.greetingConfig as CampaignGreetingConfig | undefined;
  const override = overrideConfig?.[language]?.[timeOfDay];
  if (override) return override;
  return (DEFAULT_GREETINGS[language] || DEFAULT_GREETINGS.English)[timeOfDay];
}
