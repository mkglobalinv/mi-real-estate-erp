"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ArrowRight, CheckCircle, MessageCircle, User, Globe } from 'lucide-react';
import { calculateLeadScore } from '@/lib/scoring';
import { Campaign, CampaignQuestion, ApplicationFormTemplate } from '@/lib/types';
import { getWizardStrings, getFormalGreeting, SUPPORTED_LANGUAGES, WizardLanguage } from '@/lib/campaignWizardStrings';

type Phase = 'greeting' | 'language' | 'wizard';

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
    <div className="mb-8">
      {question.type === 'Text Area' ? (
        <textarea
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-lg"
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
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-lg"
        />
      )}
      <button
        onClick={() => onSubmit(value.trim())}
        disabled={question.isRequired && !value.trim()}
        className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

    const scoreResult = calculateLeadScore(answers);
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
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col relative">
      <div className="bg-[var(--color-primary)] p-6 text-white text-center relative">
        <h2 className="text-2xl font-bold">{campaign.name} - Qualification</h2>
        <p className="text-green-100 text-sm mt-1">Let&apos;s find exactly what you need</p>
        {phase === 'wizard' && (
          <button
            onClick={() => setPhase('language')}
            title={t.changeLanguage}
            className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-full transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> {language}
          </button>
        )}
      </div>

      <div className="p-8 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* Formal Greeting Step (always shown in the campaign's default language) */}
          {phase === 'greeting' && (
            <motion.div key="greeting" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <p className="text-gray-800 mb-8 text-lg font-medium leading-relaxed">{getFormalGreeting(campaign)}</p>
              <button onClick={() => setPhase('language')} className="btn-primary w-full max-w-sm mx-auto text-lg py-4 flex items-center justify-center gap-2">
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Language Selection Step */}
          {phase === 'language' && (
            <motion.div key="language" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <p className="text-gray-800 mb-8 text-lg font-medium">Can you continue with English or Hausa?</p>
              <div className="grid gap-3 max-w-sm mx-auto">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => chooseLanguage(lang)}
                    className="p-4 rounded-xl border border-gray-200 text-center transition-colors text-gray-700 font-semibold hover:border-green-300 hover:bg-green-50 text-lg"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Welcome Step */}
          {phase === 'wizard' && currentStep === -1 && (
            <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.welcomeHeading}</h3>
              <p className="text-gray-600 mb-8 text-lg">{t.welcomeSubtext}</p>

              <button onClick={() => setCurrentStep(0)} className="btn-primary w-full max-w-sm mx-auto text-lg py-4 flex items-center justify-center gap-2">
                {t.startButton} <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Question Steps */}
          {phase === 'wizard' && currentStep >= 0 && currentStep < visibleQuestions.length && (
            <motion.div key={`q-${currentStep}`} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <span className="text-[var(--color-primary)] font-bold text-sm uppercase tracking-widest mb-2 block">
                  {t.questionLabel(currentStep + 1, visibleQuestions.length)}
                </span>
                <h3 className="text-2xl font-bold text-gray-800 leading-tight">
                  {visibleQuestions[currentStep].questionText}
                </h3>
              </div>

              {(visibleQuestions[currentStep].type === 'Radio' || visibleQuestions[currentStep].type === 'Dropdown') ? (
                <div className="grid gap-3 mb-8">
                  {visibleQuestions[currentStep].options?.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(visibleQuestions[currentStep].id, visibleQuestions[currentStep].questionText, opt)}
                      className="p-4 rounded-xl border border-gray-200 text-left transition-colors text-gray-700 hover:border-green-300 hover:bg-green-50 text-lg group flex items-center justify-between"
                    >
                      {opt}
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
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

              <div className="flex justify-between mt-auto pt-4">
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  {t.backButton}
                </button>
              </div>
            </motion.div>
          )}

          {/* Contact Step */}
          {phase === 'wizard' && currentStep === visibleQuestions.length && (
            <motion.div key="contact" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-[var(--color-primary)] w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-800">{t.yourDetailsHeading}</h3>
              </div>
              <p className="text-gray-600 mb-6">{t.yourDetailsSubtext}</p>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullNameLabel}</label>
                  <input type="text" value={displayName} onChange={e => setContactData({...contactData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder={t.fullNamePlaceholder} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneLabel}</label>
                  <input type="tel" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder={t.phonePlaceholder} />
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(prev => prev - 1)} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">{t.backButton}</button>
                <button
                  onClick={submitLead}
                  disabled={!displayName || !contactData.phone || loading}
                  className="btn-accent py-3 px-8 text-base flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.processingButton : t.completeButton}
                </button>
              </div>
            </motion.div>
          )}

          {/* Optional Pre-Application Form Step */}
          {phase === 'wizard' && showPreApplication && currentStep === visibleQuestions.length + 1 && (
            <motion.div key="pre-application" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <p className="text-gray-800 mb-8 text-lg font-medium leading-relaxed">
                {campaign.preApplicationPrompt || t.defaultPreApplicationPrompt}
              </p>
              <div className="grid gap-3 max-w-sm mx-auto">
                <button onClick={() => respondToPreApplication(true)} className="btn-primary py-4 text-lg">
                  {t.yesButton}
                </button>
                <button onClick={() => respondToPreApplication(false)} className="text-gray-500 font-medium px-4 py-3 hover:bg-gray-100 rounded-lg">
                  {t.noButton}
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Step (WhatsApp Handoff) */}
          {phase === 'wizard' && currentStep === visibleQuestions.length + (showPreApplication ? 2 : 1) && (
            <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.successHeading}</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {t.successSubtext(displayName, finalScore.category)}
              </p>

              {formOpened && formTemplate?.fileUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left text-sm text-blue-800">
                  {t.formOpenedNote}{' '}
                  <a href={formTemplate.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                    {t.openFormButton}
                  </a>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
                <p className="font-bold text-green-800 mb-2">{t.nextStepLabel}</p>
                <p className="text-sm text-green-700 mb-4">{t.nextStepBody}</p>

                <a
                  href={generateWhatsAppLink()}
                  onClick={trackWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <MessageCircle className="w-6 h-6" /> {t.continueWhatsApp}
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      {phase === 'wizard' && currentStep >= 0 && currentStep <= visibleQuestions.length && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center gap-2">
          {Array.from({ length: visibleQuestions.length + 1 }).map((_, idx) => (
            <div key={idx} className={`h-2 w-full max-w-[40px] rounded-full ${idx <= currentStep ? 'bg-[var(--color-primary)]' : 'bg-gray-200 transition-colors duration-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
