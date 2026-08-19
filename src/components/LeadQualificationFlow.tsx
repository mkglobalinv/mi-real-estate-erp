"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Home, Wallet, Calendar, User, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

// Fixed plot plans for the qualification funnel — must always match the
// numbers configured under Chairman -> Commission Rules and the plans used
// in Add Customer (src/features/customers/page.tsx). Never invent or
// derive these; they're the Chairman-approved terms.
const PLOT_PLANS: Record<'40x40' | '20x40', { price: number; deposit: number; monthly: number; months: number }> = {
  '40x40': { price: 2900000, deposit: 200000, monthly: 100000, months: 27 },
  '20x40': { price: 1450000, deposit: 100000, monthly: 50000, months: 27 },
};

type PlotChoice = '40x40' | '20x40' | 'unsure';
type Step = 1 | 2 | 3 | 4;

const WHATSAPP_NUMBER = '2348069375042'; // 08069375042, international format for wa.me

const fmt = (n: number) => `₦${n.toLocaleString()}`;

function planSummary(plan: '40x40' | '20x40') {
  const p = PLOT_PLANS[plan];
  return `Ajiya: ${fmt(p.deposit)}, Kowane wata: ${fmt(p.monthly)}, na tsawon watanni ${p.months}`;
}

// The actual 3-question-plus-contact qualification wizard. Deliberately
// carries no overlay/backdrop/close-button chrome of its own — those are
// the concern of whoever hosts it (LeadQualificationModal for the
// in-page popup, QualifierLandingPage for the dedicated ad-traffic page),
// so the same flow renders identically in both.
export default function LeadQualificationFlow({ onDone }: { onDone?: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [plotChoice, setPlotChoice] = useState<PlotChoice | ''>('');
  const [selectedPlan, setSelectedPlan] = useState<'40x40' | '20x40' | ''>('');
  const [timeline, setTimeline] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const choosePlot = (choice: PlotChoice) => {
    setPlotChoice(choice);
    if (choice !== 'unsure') setSelectedPlan(choice);
    setStep(2);
  };

  const choosePlan = (plan: '40x40' | '20x40' | '') => {
    setSelectedPlan(plan);
    setStep(3);
  };

  const chooseTimeline = (option: string) => {
    setTimeline(option);
    setStep(4);
  };

  const back = () => setStep(s => (s > 1 ? ((s - 1) as Step) : s));

  const isValidPhone = (val: string) => val.replace(/\D/g, '').length >= 10;

  const plotLabel = selectedPlan
    ? (selectedPlan === '40x40' ? '40 × 40' : '20 × 40')
    : "Ban tabbatar ba, ina son ƙarin bayani";
  const priceLabel = selectedPlan ? fmt(PLOT_PLANS[selectedPlan].price) : 'Ba a tantance ba tukuna';
  const planLabel = selectedPlan ? planSummary(selectedPlan) : 'Ina son ƙarin bayani';

  const buildMessage = () => {
    return `Assalamu alaikum. Sunana ${name}. Ina sha'awar mallakar fili a Sabuwar Abuja Estate, Langel Dididi, Kano.\n\n` +
      `Fili: ${plotLabel}\n` +
      `Farashi: ${priceLabel}\n` +
      `Tsarin biyan kuɗi: ${planLabel}\n` +
      `Lokacin da nake shirin saya: ${timeline}\n\n` +
      `Ina son ƙarin bayani da booking. Na gode.`;
  };

  const handleWhatsAppSubmit = async () => {
    if (!name.trim() || !isValidPhone(phone)) return;
    setSubmitting(true);

    // Best-effort: capture the qualified lead in the CRM using the
    // existing leads pipeline, but never let a backend hiccup block the
    // WhatsApp handoff — that's the actual conversion.
    try {
      await api.createLead({
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        source: 'Landing Page Qualification',
        interest: plotLabel,
        budget: priceLabel,
        location: 'Sabuwar Abuja Estate, Langel Dididi, Kano',
        notes: `Tsarin biyan kuɗi: ${planLabel}\nLokacin da nake shirin saya: ${timeline}`
      });
    } catch {
      // Non-blocking — proceed to WhatsApp regardless.
    }

    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
    window.open(waLink, '_blank', 'noopener,noreferrer');
    setSubmitting(false);
    setCompleted(true);
    onDone?.();
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const optionButtonClass = "w-full text-left px-5 py-4 rounded-2xl border-2 border-gray-200 hover:border-[var(--color-primary)] hover:bg-green-50 active:scale-[0.98] transition-all font-bold text-gray-900 text-base";

  if (completed) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 mb-2">An yi nasara!</h2>
        <p className="text-sm text-gray-500">An buɗe WhatsApp don ka ci gaba da tattaunawa da mu. Idan bai buɗe ba, duba ko mai bincikenka ya toshe taga sabuwa.</p>
      </div>
    );
  }

  return (
    <>
      {/* Progress */}
      {step <= 3 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tambaya {step} / 3</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--color-primary)] rounded-full"
              initial={false}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {step > 1 && (
        <button onClick={back} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[var(--color-primary)] mb-4 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Baya
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-extrabold text-gray-900">Wane irin fili kake sha&apos;awar saya?</h2>
            </div>
            <div className="space-y-3 mt-5">
              <button className={optionButtonClass} onClick={() => choosePlot('40x40')}>40 × 40 — ₦2,900,000</button>
              <button className={optionButtonClass} onClick={() => choosePlot('20x40')}>20 × 40 — ₦1,450,000</button>
              <button className={optionButtonClass} onClick={() => choosePlot('unsure')}>Ban tabbatar ba, ina son ƙarin bayani</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-extrabold text-gray-900">Wane tsarin biyan kuɗi ya fi maka sauƙi?</h2>
            </div>

            {plotChoice !== 'unsure' && selectedPlan && (
              <div className="mt-5 space-y-4">
                <div className="p-5 rounded-2xl border-2 border-[var(--color-primary)] bg-green-50">
                  <p className="font-extrabold text-gray-900 mb-3">{selectedPlan === '40x40' ? '40 × 40' : '20 × 40'} — {fmt(PLOT_PLANS[selectedPlan].price)}</p>
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <div className="flex justify-between"><span>Initial Deposit</span><span className="font-bold">{fmt(PLOT_PLANS[selectedPlan].deposit)}</span></div>
                    <div className="flex justify-between"><span>Monthly Payment</span><span className="font-bold">{fmt(PLOT_PLANS[selectedPlan].monthly)}</span></div>
                    <div className="flex justify-between"><span>Duration</span><span className="font-bold">{PLOT_PLANS[selectedPlan].months} months</span></div>
                  </div>
                </div>
                <button className="btn-primary w-full py-3.5" onClick={() => setStep(3)}>Ci gaba</button>
              </div>
            )}

            {plotChoice === 'unsure' && (
              <div className="mt-5 space-y-3">
                {(['40x40', '20x40'] as const).map(plan => (
                  <button key={plan} onClick={() => choosePlan(plan)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedPlan === plan ? 'border-[var(--color-primary)] bg-green-50' : 'border-gray-200 hover:border-[var(--color-primary)]'}`}>
                    <p className="font-extrabold text-gray-900 mb-2">{plan === '40x40' ? '40 × 40' : '20 × 40'} — {fmt(PLOT_PLANS[plan].price)}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Initial Deposit</span><span className="font-bold">{fmt(PLOT_PLANS[plan].deposit)}</span></div>
                      <div className="flex justify-between"><span>Monthly Payment</span><span className="font-bold">{fmt(PLOT_PLANS[plan].monthly)}</span></div>
                      <div className="flex justify-between"><span>Duration</span><span className="font-bold">{PLOT_PLANS[plan].months} months</span></div>
                    </div>
                  </button>
                ))}
                <button onClick={() => choosePlan('')} className="w-full text-center px-5 py-3.5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[var(--color-primary)] font-bold text-gray-600 hover:text-[var(--color-primary)] transition-all">
                  Ina son ƙarin bayani
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-extrabold text-gray-900">Yaushe kake shirin fara mallakar fili?</h2>
            </div>
            <div className="space-y-3 mt-5">
              {['Nan take', 'Cikin wannan watan', 'Cikin watanni 1–3', 'Ina son ƙarin bayani kafin na yanke shawara'].map(option => (
                <button key={option} className={optionButtonClass} onClick={() => chooseTimeline(option)}>{option}</button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-extrabold text-gray-900">Don kammala booking ɗinka, saka sunanka da lambar waya.</h2>
            </div>
            <div className="space-y-4 mt-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Suna</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Sunanka"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Lambar waya</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="080..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] transition-colors" />
              </div>
              <button
                onClick={handleWhatsAppSubmit}
                disabled={!name.trim() || !isValidPhone(phone) || submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.98] text-white font-extrabold py-4 px-6 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:hover:bg-[#25D366] disabled:active:scale-100 text-base mt-2"
              >
                {submitting ? 'Ana aikawa...' : '🟢 TUNTUBE MU A WHATSAPP'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
