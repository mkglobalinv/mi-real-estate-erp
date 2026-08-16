"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ArrowRight, CheckCircle, MessageCircle, User, Globe, Building2 } from 'lucide-react';
import { calculateLeadScore } from '@/lib/scoring';
import { Campaign, CampaignQuestion, ApplicationFormTemplate } from '@/lib/types';
import { getWizardStrings, getFormalGreeting, SUPPORTED_LANGUAGES, WizardLanguage } from '@/lib/campaignWizardStrings';

type Phase = 'greeting' | 'language' | 'wizard';

// Purely presentational wrapper: gives any step content the look of an
// incoming chat message (assistant avatar + rounded bubble with a tail).
function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center flex-shrink-0 mb-1">
        <Building2 className="w-4 h-4" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-4 sm:px-5 sm:py-5 max-w-[calc(100%-2.25rem)] w-full">
        {children}
      </div>
    </div>
  );
}

// Owns its own input state so it naturally resets/restores whenever the
// enclosing question step remounts (its parent motion.div already changes
// `key` per step) — no effect-driven state sync needed.
function QuestionTextInput({ question, initialValue, onSubmit, continueLabel }: {
  question: CampaignQuestion;
  initialValue: string;
  onSubmit: (text: string) => void;
  continueLabel: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div>
      {question.type === 'Text Area' ? (
        <textarea
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-base"
        />
      ) : (
        <input
          autoFocus
          type={question.type === 'Number' ? 'number' : question.type === 'Phone' ? 'tel' : 'text'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && value.trim()) onSubmit(value.trim());
          }}
          className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-base"
        />
      )}
      <button
        onClick={() => onSubmit(value.trim())}
        disabled={question.isRequired && !value.trim()}
        className="w-full mt-3 py-3.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {continueLabel} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function CampaignWizard({ campaign, questions }: { campaign: Campaign, questions: CampaignQuestion[] }) {
  const sessionKey = `mire-campaign-lang-${campaign.id}`;
  const greetingEnabled = campaign.greetingEnabled !== false;

  const [phase, setPhase] = useState<Phase>(greetingEnabled ? 'greeting' : 'wizard');
  const [language, setLanguage] = useState<WizardLanguage>((campaign.defaultLanguage as WizardLanguage) || 'English');
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Welcome, 0 to n is questions, n+1 is Contact, n+2 is Success
  const [answers, setAnswers] = useState<{ questionId: string; questionText: string; answerText: string }[]>([]);
  const [contactData, setContactData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState<{score: number; category: string}>({ score: 0, category: 'Cold' });
  const [formTemplate, setFormTemplate] = useState<ApplicationFormTemplate | null>(null);
  const [formOpened, setFormOpened] = useState(false);

  const t = getWizardStrings(language);
  const showPreApplication = !!campaign.preApplicationEnabled && !!campaign.applicationFormTemplateId;

  // Fetch the selected official application form template — a genuine
  // async data load from an external system, the documented case for effects.
  useEffect(() => {
    if (campaign.applicationFormTemplateId) {
      api.getApplicationFormTemplateById(campaign.applicationFormTemplateId).then(setFormTemplate).catch(console.error);
    }
  }, [campaign.applicationFormTemplateId]);

  // If this browser session already picked a language for this campaign,
  // don't re-ask — jump straight into the wizard with that language. This
  // is a legitimate one-time sync with an external system (browser storage)
  // that must run client-only; sessionStorage isn't available during SSR.
  useEffect(() => {
    try {
      const savedLang = sessionStorage.getItem(sessionKey);
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as WizardLanguage)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguage(savedLang as WizardLanguage);
        setPhase('wizard');
      }
    } catch {
      // sessionStorage unavailable (e.g. private mode) — fall back to greeting flow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Track Wizard Start
    if (phase === 'wizard' && currentStep === 0) {
      api.trackCampaignEvent(campaign.id, 'wizard_start').catch(console.error);
    }
  }, [phase, currentStep, campaign.id]);

  // Conditional branching: a question with a parentQuestionId is only
  // shown once the parent question has actually been answered with its
  // showIfOption value. Recomputed each render from the current answers,
  // so a question appears/disappears live as the triggering answer changes.
  const visibleQuestions = questions.filter(q => {
    if (!q.parentQuestionId) return true;
    const parentAnswer = answers.find(a => a.questionId === q.parentQuestionId);
    return parentAnswer?.answerText === q.showIfOption;
  });

  // If a qualification question already asked for the customer's name
  // (questionKey 'name'), reuse that answer instead of asking again on the
  // contact step — computed at render time, not synced via an effect.
  const nameQuestion = questions.find(q => q.questionKey === 'name');
  const nameFromAnswers = nameQuestion ? answers.find(a => a.questionId === nameQuestion.id)?.answerText : undefined;
  const displayName = contactData.name || nameFromAnswers || '';

  const chooseLanguage = (lang: WizardLanguage) => {
    setLanguage(lang);
    try {
      sessionStorage.setItem(sessionKey, lang);
    } catch {
      // ignore persistence failure — language still applies for this render
    }
    setPhase('wizard');
  };

  const handleAnswer = (questionId: string, questionText: string, answerText: string) => {
    // Save answer
    const existing = answers.find(a => a.questionId === questionId);
    if (existing) {
      setAnswers(answers.map(a => a.questionId === questionId ? { ...a, answerText } : a));
    } else {
      setAnswers([...answers, { questionId, questionText, answerText }]);
    }
    // Go to next step automatically for choices, or user clicks next for text
    setCurrentStep(prev => prev + 1);
  };

  const submitLead = async () => {
    if (!displayName || !contactData.phone) return;
    setLoading(true);

    const scoreResult = calculateLeadScore(answers, questions, campaign);
    setFinalScore({ score: scoreResult.score, category: scoreResult.category });

    try {
      await api.submitCampaignLead(
        campaign.id,
        { name: displayName, phone: contactData.phone },
        answers,
        scoreResult
      );
      await api.trackCampaignEvent(campaign.id, 'wizard_complete');
      await api.trackCampaignEvent(campaign.id, 'lead_created');
      await api.trackCampaignEvent(campaign.id, 'lead_converted');
      // Optional Pre-Application Form → WhatsApp Handoff, per the approved
      // customer workflow. If disabled (or no form configured), go straight
      // to WhatsApp — this step is never skipped, only ever the target.
      setCurrentStep(visibleQuestions.length + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackWhatsAppClick = () => {
    api.trackCampaignEvent(campaign.id, 'whatsapp_click').catch(console.error);
  };

  const respondToPreApplication = (agreed: boolean) => {
    api.trackCampaignEvent(campaign.id, agreed ? 'pre_application_accepted' : 'pre_application_declined').catch(console.error);
    if (agreed && formTemplate?.fileUrl) {
      window.open(formTemplate.fileUrl, '_blank', 'noopener,noreferrer');
      setFormOpened(true);
    }
    // Either way, the workflow continues to WhatsApp handoff next.
    setCurrentStep(prev => prev + 1);
  };

  const generateWhatsAppLink = () => {
    // Campaign-configured number always wins; the literal fallback only
    // applies when no campaign number is set.
    const phone = campaign.whatsappNumber || '08069375042';

    const findAnswer = (key: string) => {
      const q = questions.find(qq => qq.questionKey === key);
      return q ? answers.find(a => a.questionId === q.id)?.answerText : undefined;
    };

    const detailLines: string[] = [];
    const location = findAnswer('location');
    const plotSize = findAnswer('plot_size');
    const purpose = findAnswer('purpose');
    const paymentPreference = findAnswer('payment_preference');
    const timeline = findAnswer('timeline');
    const readiness = findAnswer('readiness');
    if (location) detailLines.push(`- Location: ${location}`);
    if (plotSize) detailLines.push(`- Plot Size: ${plotSize}`);
    if (purpose) detailLines.push(`- Purpose: ${purpose}`);
    if (paymentPreference) detailLines.push(`- Payment Preference: ${paymentPreference}`);
    if (timeline) detailLines.push(`- Purchase Timeline: ${timeline}`);
    if (readiness) detailLines.push(`- Purchase Readiness: ${readiness}`);
    detailLines.push(`- Preferred Language: ${language}`);

    // Any other answered questions (e.g. the installment follow-up, or
    // Admin-added custom questions) that aren't already covered above.
    const coveredKeys = new Set(['name', 'location', 'plot_size', 'purpose', 'payment_preference', 'timeline', 'readiness']);
    answers.forEach(a => {
      const q = questions.find(qq => qq.id === a.questionId);
      if (!q?.questionKey || !coveredKeys.has(q.questionKey)) {
        detailLines.push(`- ${a.questionText}: ${a.answerText}`);
      }
    });

    const msg = `Hello! I am ${displayName}.\nI just completed the qualification for the ${campaign.name} campaign.\n\nMy Details:\n${detailLines.join('\n')}\n\nPriority: ${finalScore.category} (${finalScore.score} pts)\nPhone: ${contactData.phone}\n\nI would like to proceed!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Language toggle — floats above the current bubble, chat-chip style */}
      {phase === 'wizard' && (
        <div className="flex justify-end px-1">
          <button
            onClick={() => setPhase('language')}
            title={t.changeLanguage}
            className="flex items-center gap-1 text-xs font-bold bg-white text-[var(--color-primary-dark)] border border-gray-200 px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> {language}
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* Formal Greeting Step (always shown in the campaign's default language) */}
        {phase === 'greeting' && (
          <motion.div key="greeting" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">{getFormalGreeting(campaign)}</p>
            </AssistantBubble>
            <button
              onClick={() => setPhase('language')}
              className="mt-3 ml-9 w-[calc(100%-2.25rem)] max-w-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Language Selection Step */}
        {phase === 'language' && (
          <motion.div key="language" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <p className="text-gray-800 text-[15px] font-medium">Can you continue with English or Hausa?</p>
            </AssistantBubble>
            <div className="grid grid-cols-2 gap-2.5 mt-3 ml-9">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => chooseLanguage(lang)}
                  className="py-3.5 rounded-full border-2 border-[var(--color-primary)] text-center text-[var(--color-primary-dark)] font-bold hover:bg-[var(--color-primary)] hover:text-white active:scale-[0.97] transition-all"
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Welcome Step */}
        {phase === 'wizard' && currentStep === -1 && (
          <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <h3 className="text-lg font-bold text-gray-800 mb-1.5">{t.welcomeHeading}</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">{t.welcomeSubtext}</p>
            </AssistantBubble>
            <button
              onClick={() => setCurrentStep(0)}
              className="mt-3 ml-9 w-[calc(100%-2.25rem)] max-w-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.98] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {t.startButton} <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Question Steps */}
        {phase === 'wizard' && currentStep >= 0 && currentStep < visibleQuestions.length && (
          <motion.div key={`q-${currentStep}`} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <span className="text-[var(--color-primary)] font-bold text-[11px] uppercase tracking-widest mb-1.5 block">
                {t.questionLabel(currentStep + 1, visibleQuestions.length)}
              </span>
              <h3 className="text-lg font-bold text-gray-800 leading-snug mb-4">
                {language === 'Hausa' && visibleQuestions[currentStep].questionTextHausa ? visibleQuestions[currentStep].questionTextHausa : visibleQuestions[currentStep].questionText}
              </h3>

              {(visibleQuestions[currentStep].type === 'Radio' || visibleQuestions[currentStep].type === 'Dropdown') ? (
                <div className="grid gap-2.5">
                  {(language === 'Hausa' && visibleQuestions[currentStep].optionsHausa ? visibleQuestions[currentStep].optionsHausa : visibleQuestions[currentStep].options)?.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(visibleQuestions[currentStep].id, visibleQuestions[currentStep].questionText, opt)}
                      className="py-3.5 px-4 rounded-full border-2 border-[var(--color-primary-light)] bg-[var(--color-primary-light)] text-left text-[var(--color-primary-dark)] font-semibold hover:border-[var(--color-primary)] hover:bg-white active:scale-[0.98] transition-all text-[15px] flex items-center justify-between"
                    >
                      {opt}
                      <ArrowRight className="w-4 h-4 flex-shrink-0 ml-2 opacity-60" />
                    </button>
                  ))}
                </div>
              ) : (
                <QuestionTextInput
                  question={visibleQuestions[currentStep]}
                  initialValue={answers.find(a => a.questionId === visibleQuestions[currentStep].id)?.answerText || ''}
                  onSubmit={text => handleAnswer(visibleQuestions[currentStep].id, visibleQuestions[currentStep].questionText, text)}
                  continueLabel={t.continueButton}
                />
              )}
            </AssistantBubble>

            <div className="flex justify-start mt-2 ml-9">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="text-gray-500 text-sm font-medium px-3 py-1.5 hover:bg-white/60 rounded-full transition-colors"
              >
                {t.backButton}
              </button>
            </div>
          </motion.div>
        )}

        {/* Contact Step */}
        {phase === 'wizard' && currentStep === visibleQuestions.length && (
          <motion.div key="contact" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <div className="flex items-center gap-2 mb-1.5">
                <User className="text-[var(--color-primary)] w-5 h-5" />
                <h3 className="text-lg font-bold text-gray-800">{t.yourDetailsHeading}</h3>
              </div>
              <p className="text-gray-600 text-[15px] mb-4">{t.yourDetailsSubtext}</p>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{t.fullNameLabel}</label>
                  <input type="text" value={displayName} onChange={e => setContactData({...contactData, name: e.target.value})} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-base" placeholder={t.fullNamePlaceholder} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{t.phoneLabel}</label>
                  <input type="tel" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-base" placeholder={t.phonePlaceholder} />
                </div>
              </div>

              <button
                onClick={submitLead}
                disabled={!displayName || !contactData.phone || loading}
                className="w-full bg-[var(--color-accent)] hover:bg-red-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? t.processingButton : t.completeButton}
              </button>
            </AssistantBubble>

            <div className="flex justify-start mt-2 ml-9">
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="text-gray-500 text-sm font-medium px-3 py-1.5 hover:bg-white/60 rounded-full transition-colors">{t.backButton}</button>
            </div>
          </motion.div>
        )}

        {/* Optional Pre-Application Form Step */}
        {phase === 'wizard' && showPreApplication && currentStep === visibleQuestions.length + 1 && (
          <motion.div key="pre-application" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <p className="text-gray-800 text-[15px] font-medium leading-relaxed">
                {campaign.preApplicationPrompt || t.defaultPreApplicationPrompt}
              </p>
            </AssistantBubble>
            <div className="grid grid-cols-2 gap-2.5 mt-3 ml-9">
              <button onClick={() => respondToPreApplication(true)} className="py-3.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] active:scale-[0.97] text-white font-bold transition-all">
                {t.yesButton}
              </button>
              <button onClick={() => respondToPreApplication(false)} className="py-3.5 rounded-full border-2 border-gray-200 text-gray-600 font-bold hover:bg-white active:scale-[0.97] transition-all">
                {t.noButton}
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Step (WhatsApp Handoff) */}
        {phase === 'wizard' && currentStep === visibleQuestions.length + (showPreApplication ? 2 : 1) && (
          <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <AssistantBubble>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0" />
                <h3 className="text-lg font-bold text-gray-800">{t.successHeading}</h3>
              </div>
              <p className="text-gray-600 text-[15px] mb-4">
                {t.successSubtext(displayName, finalScore.category)}
              </p>

              {formOpened && formTemplate?.fileUrl && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3.5 mb-4 text-sm text-blue-800">
                  {t.formOpenedNote}{' '}
                  <a href={formTemplate.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    {t.openFormButton}
                  </a>
                </div>
              )}

              <div className="bg-[var(--color-primary-light)] rounded-2xl p-4">
                <p className="font-bold text-[var(--color-primary-dark)] mb-1 text-sm">{t.nextStepLabel}</p>
                <p className="text-sm text-gray-600 mb-3">{t.nextStepBody}</p>

                <a
                  href={generateWhatsAppLink()}
                  onClick={trackWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-full shadow-md transition-all"
                >
                  <MessageCircle className="w-5 h-5" /> {t.continueWhatsApp}
                </a>
              </div>
            </AssistantBubble>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Progress Indicator */}
      {phase === 'wizard' && currentStep >= 0 && currentStep <= visibleQuestions.length && (
        <div className="flex items-center gap-1.5 px-1 pt-1">
          {Array.from({ length: visibleQuestions.length + 1 }).map((_, idx) => (
            <div key={idx} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${idx <= currentStep ? 'bg-[var(--color-primary)]' : 'bg-black/10'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
