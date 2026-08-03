"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ArrowRight, CheckCircle, Home, MapPin, Wallet, User, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'welcome' | 'interest' | 'location' | 'budget' | 'contact' | 'success';

export default function SmartAdvisor() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    interest: '',
    location: '',
    budget: '',
    name: '',
    phone: '',
    whatsapp: '',
  });

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const submitLead = async () => {
    setLoading(true);
    await api.createLead({
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone,
      source: 'Smart Advisor',
      interest: formData.interest,
      budget: formData.budget,
      location: formData.location,
    });
    setLoading(false);
    setStep('success');
  };

  const nextStep = (next: Step) => setStep(next);

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 min-h-[500px] flex flex-col relative">
      <div className="bg-[var(--color-primary)] p-6 text-white text-center">
        <h2 className="text-2xl font-bold">Smart Property Advisor</h2>
        <p className="text-green-100 text-sm mt-1">Let's find exactly what you need</p>
      </div>

      <div className="p-8 flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <motion.div key="welcome" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Assalamu Alaikum 👋</h3>
              <p className="text-gray-600 mb-8 text-lg">Welcome to M.I. Real Estate. What are you looking for today?</p>
              
              <div className="grid gap-3">
                <button onClick={() => { updateForm('interest', 'Buy Land'); nextStep('location'); }} className="btn-secondary text-left w-full justify-between flex items-center group">
                  Buy Land <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                </button>
                <button onClick={() => { updateForm('interest', 'Buy House'); nextStep('location'); }} className="btn-secondary text-left w-full justify-between flex items-center group">
                  Buy House <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                </button>
                <button onClick={() => { updateForm('interest', 'Rent Property'); nextStep('location'); }} className="btn-secondary text-left w-full justify-between flex items-center group">
                  Rent Property <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                </button>
                <button onClick={() => { updateForm('interest', 'Easy Buy Scheme'); nextStep('location'); }} className="btn-secondary text-left w-full justify-between flex items-center group">
                  Easy Buy Scheme <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--color-primary)]" />
                </button>
                <button onClick={() => { updateForm('interest', 'Sell Property'); nextStep('location'); }} className="text-[var(--color-primary)] font-medium p-4 hover:bg-green-50 rounded-xl transition-colors mt-2 border border-green-200 text-center flex items-center justify-center gap-2">
                  I want to Sell a Property <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Location Step */}
          {step === 'location' && (
            <motion.div key="location" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-[var(--color-primary)] w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-800">Preferred Location</h3>
              </div>
              <p className="text-gray-600 mb-6">Which area are you interested in?</p>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Kano', 'Janguza', 'Yarimawa', 'Abuja', 'Lagos', 'Any Location'].map(loc => (
                  <button 
                    key={loc}
                    onClick={() => updateForm('location', loc)}
                    className={`p-4 rounded-xl border text-center transition-colors ${formData.location === loc ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => nextStep('welcome')} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Back</button>
                <button onClick={() => nextStep('budget')} disabled={!formData.location} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* Budget Step */}
          {step === 'budget' && (
            <motion.div key="budget" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="text-[var(--color-primary)] w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-800">Your Budget</h3>
              </div>
              <p className="text-gray-600 mb-6">What is your estimated budget?</p>
              
              <div className="grid gap-3 mb-8">
                {['Under ₦5M', '₦5M - ₦20M', '₦20M - ₦50M', 'Above ₦50M'].map(budget => (
                  <button 
                    key={budget}
                    onClick={() => updateForm('budget', budget)}
                    className={`p-4 rounded-xl border text-left transition-colors ${formData.budget === budget ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'}`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => nextStep('location')} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Back</button>
                <button onClick={() => nextStep('contact')} disabled={!formData.budget} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Next Step</button>
              </div>
            </motion.div>
          )}

          {/* Contact Step */}
          {step === 'contact' && (
            <motion.div key="contact" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-[var(--color-primary)] w-6 h-6" />
                <h3 className="text-xl font-bold text-gray-800">Your Details</h3>
              </div>
              <p className="text-gray-600 mb-6">Almost done! Where should we send your tailored recommendations?</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="08012345678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="tel" value={formData.whatsapp} onChange={e => updateForm('whatsapp', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" placeholder="Same as phone if left blank" />
                </div>
              </div>
              
              <div className="flex justify-between">
                <button onClick={() => nextStep('budget')} className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg">Back</button>
                <button 
                  onClick={submitLead} 
                  disabled={!formData.name || !formData.phone || loading} 
                  className="btn-accent py-3 px-8 text-base flex items-center justify-center min-w-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Complete & Send'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Request Received!</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Thank you, {formData.name}. Our property consultant will contact you shortly via WhatsApp or Phone to discuss the best options for your needs.
              </p>
              <button onClick={() => router.push('/properties')} className="btn-primary">
                Browse All Properties Manually
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress Indicator */}
      {step !== 'success' && (
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-center gap-2">
          {['welcome', 'location', 'budget', 'contact'].map((s, idx) => {
            const steps = ['welcome', 'location', 'budget', 'contact'];
            const currentIndex = steps.indexOf(step);
            const isActive = idx <= currentIndex;
            return (
              <div key={s} className={`h-2 w-12 rounded-full ${isActive ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            );
          })}
        </div>
      )}
    </div>
  );
}
