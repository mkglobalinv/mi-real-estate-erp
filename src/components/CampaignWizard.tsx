"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ArrowRight, CheckCircle, MessageCircle, User } from 'lucide-react';
import { calculateLeadScore } from '@/lib/scoring';
import { Campaign, CampaignQuestion } from '@/lib/types';

export default function CampaignWizard({ campaign, questions }: { campaign: Campaign, questions: CampaignQuestion[] }) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Welcome, 0 to n is questions, n+1 is Contact, n+2 is Success
  const [answers, setAnswers] = useState<{ questionId: string; questionText: string; answerText: string }[]>([]);
  const [contactData, setContactData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState<{score: number; category: string}>({ score: 0, category: 'Cold' });

  useEffect(() => {
    // Track Wizard Start
    if (currentStep === 0) {
      api.trackCampaignEvent(campaign.id, 'wizard_start').catch(console.error);
    }
  }, [currentStep, campaign.id]);

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
    if (!contactData.name || !contactData.phone) return;
    setLoading(true);

    const scoreResult = calculateLeadScore(answers);
    setFinalScore({ score: scoreResult.score, category: scoreResult.category });

    try {
      await api.submitCampaignLead(
        campaign.id,
        { name: contactData.name, phone: contactData.phone },
        answers,
        scoreResult
      );
      await api.trackCampaignEvent(campaign.id, 'wizard_complete');
      await api.trackCampaignEvent(campaign.id, 'lead_created');
      await api.trackCampaignEvent(campaign.id, 'lead_converted');
      setCurrentStep(questions.length + 1); // Go to success
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trackWhatsAppClick = () => {
    api.trackCampaignEvent(campaign.id, 'whatsapp_click').catch(console.error);
  };

  const generateWhatsAppLink = () => {
    const phone = campaign.whatsappNumber || '08069375042';
    const answersSummary = answers.map(a => `${a.questionText}: ${a.answerText}`).join('\n');
    const msg = `Hello! I am ${contactData.name}.\nI just completed the qualification for the ${campaign.name} campaign.\n\nMy Details:\n${answersSummary}\n\nPriority: ${finalScore.category} (${finalScore.score} pts)\nPhone: ${contactData.phone}\n\nI would like to proceed!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col relative">
      <div className="bg-[var(--color-primary)] p-6 text-white text-center">
        <h2 className="text-2xl font-bold">{campaign.name} - Qualification</h2>
        <p className="text-green-100 text-sm mt-1">Let's find exactly what you need</p>
      </div>

      <div className="p-8 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* Welcome Step */}
          {currentStep === -1 && (
            <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome! ðŸ‘‹</h3>
              <p className="text-gray-600 mb-8 text-lg">Answer a few quick questions to see if you qualify for our exclusive offers.</p>
              
              <button onClick={() => setCurrentStep(0)} className="btn-primary w-full max-w-sm mx-auto text-lg py-4 flex items-center justify-center gap-2">
                Start Qualification <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* Question Steps */}
          {currentStep >= 0 && currentStep < questions.length && (
            <motion.div key={`q-${currentStep}`} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8">
                <span className="text-[var(--color-primary)] font-bold text-sm uppercase tracking-widest mb-2 block">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <h3 className="text-2xl font-bold text-gray-800 leading-tight">
                  {questions[currentStep].questionText}
                </h3>
              </div>
              
              <div className="grid gap-3 mb-8">
                {questions[currentStep].options?.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => handleAnswer(questions[currentStep].id, questions[currentStep].questionText, opt)}
                    className="p-4 rounded-xl border border-gray-200 text-left transition-colors text-gray-700 hover:border-green-300 hover:bg-green-50 text-lg group flex items-center justify-between"
                  >
                    {opt}
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between mt-auto pt-4">
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)} 
                  className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Contact Step */}
          {currentStep === questions.length && (
            <motion.div key="contact" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-[var(--color-primary)] w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-800">Your Details</h3>
              </div>
              <p className="text-gray-600 mb-6">Great! Where should we send your tailored recommendations?</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={contactData.name} onChange={e => setContactData({...contactData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={contactData.phone} onChange={e => setContactData({...contactData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="08012345678" />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button onClick={() => setCurrentStep(prev => prev - 1)} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Back</button>
                <button 
                  onClick={submitLead} 
                  disabled={!contactData.name || !contactData.phone || loading} 
                  className="btn-accent py-3 px-8 text-base flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete Qualification'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Step (WhatsApp Handoff) */}
          {currentStep === questions.length + 1 && (
            <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">You're Qualified!</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Thank you, {contactData.name}. Based on your answers, you are a <strong>{finalScore.category} Match</strong> for this offer.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
                <p className="font-bold text-green-800 mb-2">Next Step:</p>
                <p className="text-sm text-green-700 mb-4">Click below to connect with our Campaign Specialist directly on WhatsApp to finalize your slot.</p>
                
                <a 
                  href={generateWhatsAppLink()}
                  onClick={trackWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <MessageCircle className="w-6 h-6" /> Continue to WhatsApp
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      
      {/* Progress Indicator */}
      {currentStep >= 0 && currentStep <= questions.length && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center gap-2">
          {Array.from({ length: questions.length + 1 }).map((_, idx) => (
            <div key={idx} className={`h-2 w-full max-w-[40px] rounded-full ${idx <= currentStep ? 'bg-[var(--color-primary)]' : 'bg-gray-200 transition-colors duration-300'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
