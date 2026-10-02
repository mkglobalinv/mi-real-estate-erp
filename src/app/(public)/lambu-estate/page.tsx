"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2, ArrowRight, MapPin, Phone, MessageCircle, ShieldCheck,
  Wallet, Calendar, FileCheck, ClipboardList, Building2, Landmark,
  Sparkles, Hammer,
} from 'lucide-react';

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm";
const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";

const COMPANY_PHONE = '+234 806 937 5042';
const COMPANY_PHONE_TEL = '+2348069375042';
const COMPANY_WHATSAPP = '2348069375042';
const COMPANY_ADDRESS = 'Shop No. 1 and 2 Downstairs, Adjacent to Next Door Park Stadium, Along Rimin Auzunawa Road, Tudun Yola Gate 5, Gwale Local Government Area, Kano State.';

interface PlotPlan {
  id: string;
  label: string;
  size: string;
  total: number;
  deposit: number;
  monthly: number;
  months: number;
}

const PLOT_PLANS: PlotPlan[] = [
  { id: '50x50', label: '50 × 50 ft Plot', size: '50 × 50 ft', total: 3900000, deposit: 300000, monthly: 150000, months: 24 },
  { id: '25x50', label: '25 × 50 ft Plot', size: '25 × 50 ft', total: 1950000, deposit: 150000, monthly: 75000, months: 24 },
];

const TRUST_INDICATORS = [
  { icon: Wallet, label: 'Flexible Installments' },
  { icon: Calendar, label: '24-Month Payment Plan' },
  { icon: ShieldCheck, label: 'Professional Real Estate Services' },
];

const BENEFITS = [
  { icon: Wallet, title: 'Flexible Payment Plans', body: 'Spread your payment over 24 months at a pace that works for you.' },
  { icon: Landmark, title: 'Affordable Initial Deposit', body: 'Secure your plot today with a manageable initial deposit.' },
  { icon: FileCheck, title: 'Clear Documentation', body: 'Every plot comes with an Occupancy Permit from the Kano State Ministry of Land and Physical Planning.' },
  { icon: Sparkles, title: 'Strategic Property Acquisition', body: 'Lambu Government Layout is positioned for long-term value.' },
  { icon: Building2, title: 'Professional Real Estate Services', body: 'From land to houses, plazas and facility management — handled by one trusted company.' },
  { icon: ClipboardList, title: 'Convenient Application Process', body: 'Apply online in minutes — no office visit required to get started.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose Your Plot', icon: MapPin, body: 'Pick the plot size at Lambu Government Layout that fits your plan.' },
  { step: '02', title: 'Submit Your Application', icon: ClipboardList, body: 'Fill out the application form with your details and preferences.' },
  { step: '03', title: 'Pay Initial Deposit', icon: Wallet, body: 'Secure your plot with the required initial deposit.' },
  { step: '04', title: 'Complete Your 24-Month Installments', icon: Calendar, body: 'Pay the remaining balance in convenient monthly installments.' },
];

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function LambuEstatePage() {
  // --- Calculator state ---
  const [selectedPlanId, setSelectedPlanId] = useState(PLOT_PLANS[0].id);
  const [monthsPaid, setMonthsPaid] = useState(0);
  const plan = useMemo(() => PLOT_PLANS.find(p => p.id === selectedPlanId) || PLOT_PLANS[0], [selectedPlanId]);
  const amountPaidSoFar = plan.deposit + plan.monthly * monthsPaid;
  const remainingBalance = Math.max(plan.total - amountPaidSoFar, 0);

  // --- Application form state ---
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', plotSize: '', preferredProperty: 'Lambu Government Layout',
    paymentPlan: '24-Month Installment Plan', address: '', message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.fullName.trim()) next.fullName = 'Full name is required.';
    if (!formData.phone.trim()) next.phone = 'Phone number is required.';
    if (!formData.email.trim()) next.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) next.email = 'Enter a valid email address.';
    if (!formData.plotSize) next.plotSize = 'Please select a preferred plot size.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // No backend yet — the application is delivered via a pre-filled
    // WhatsApp message to the company's line for this project, so every
    // submission reliably reaches someone today. A database insert can be
    // added later alongside this without changing the form itself.
    const lines = [
      'New Lambu Estate Application',
      `Name: ${formData.fullName}`,
      `Phone: ${formData.phone}`,
      `Email: ${formData.email}`,
      `Preferred Plot Size: ${formData.plotSize}`,
      `Preferred Property: ${formData.preferredProperty}`,
      `Payment Plan: ${formData.paymentPlan}`,
      `Address: ${formData.address || '—'}`,
      '',
      'Message:',
      formData.message || '—',
    ];
    window.location.href = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Slim in-page sticky nav — the site already has a global header
          (logo, Home/About/Properties/Easy Buy/Contact); this adds only
          what that header doesn't: quick jumps to this page's sections and
          a prominent Apply Now CTA, rather than duplicating the whole nav. */}
      <div className="sticky top-14 md:top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-5 text-xs sm:text-sm font-bold text-gray-500 whitespace-nowrap">
            <button onClick={() => scrollTo('available-land')} className="hover:text-[var(--color-primary)] transition-colors">Available Land</button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[var(--color-primary)] transition-colors">How It Works</button>
            <button onClick={() => scrollTo('documentation')} className="hidden sm:inline hover:text-[var(--color-primary)] transition-colors">Documentation</button>
            <button onClick={() => scrollTo('contact')} className="hidden sm:inline hover:text-[var(--color-primary)] transition-colors">Contact</button>
          </div>
          <button onClick={() => scrollTo('apply')} className="shrink-0 bg-[var(--color-primary)] text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
            Apply Now
          </button>
        </div>
      </div>

      {/* HERO */}
      <section id="hero" className="relative">
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] max-h-[600px]">
          <Image
            src="/images/lambu-estate-aerial.jpg"
            alt="Aerial view of an estate development"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)]/90 via-black/40 to-black/10" />
          <div className="absolute inset-0 flex items-end sm:items-center">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-0 w-full">
              <div className="max-w-xl">
                <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/25 mb-5">
                  Lambu Government Layout, Kano
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.1] mb-4 tracking-tight">
                  Own Your Land in Kano With Flexible Installment Plans
                </h1>
                <p className="text-white/90 text-base sm:text-lg mb-7 max-w-lg">
                  Secure your plot at Lambu Government Layout with an affordable initial deposit and convenient monthly payments.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button onClick={() => scrollTo('apply')} className="bg-white text-[var(--color-primary-dark)] font-bold py-3.5 px-7 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
                    Apply for Land <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => scrollTo('available-land')} className="bg-white/10 backdrop-blur-sm text-white font-bold py-3.5 px-7 rounded-xl border border-white/40 hover:bg-white/20 transition-all">
                    View Available Plots
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {TRUST_INDICATORS.map(t => (
                    <div key={t.label} className="flex items-center gap-2 text-white/90">
                      <t.icon className="w-4 h-4 text-[var(--color-gold)]" />
                      <span className="text-xs sm:text-sm font-semibold">{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTATION / TRUST */}
      <section id="documentation" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Property With Clear Documentation</h2>
            <div className="w-16 h-1.5 bg-[var(--color-gold)] rounded-full mb-6" />
            <p className="text-gray-600 text-lg mb-6">
              Title documentation: Occupancy Permit issued by Kano State Ministry of Land and Physical Planning.
            </p>
            <div className="flex items-start gap-3 bg-[var(--color-primary-light)] rounded-2xl p-5">
              <ShieldCheck className="w-6 h-6 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                Every plot at Lambu Government Layout is issued with this Occupancy Permit, giving you documented title to your land.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <Image
              src="/images/lambu-ministry-of-land.jpg"
              alt="Kano State Ministry of Land and Physical Planning"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* AVAILABLE LAND */}
      <section id="available-land" className="bg-gray-50 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Available Land</h2>
            <p className="text-gray-500">Lambu Government Layout, Kano</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {PLOT_PLANS.map(p => (
              <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-[var(--color-primary-dark)] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Lambu Government Layout</p>
                  <h3 className="text-2xl font-extrabold">{p.size} Plot</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-3 mb-6 text-sm flex-1">
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-gray-500">Total Price</span>
                      <span className="font-extrabold text-gray-900 text-lg">{formatNaira(p.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Initial Deposit</span>
                      <span className="font-bold text-gray-900">{formatNaira(p.deposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monthly Installment</span>
                      <span className="font-bold text-gray-900">{formatNaira(p.monthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-bold text-gray-900">{p.months} Months</span>
                    </div>
                    <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 mt-2">
                      <FileCheck className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-600">Title: Occupancy Permit issued by Kano State Ministry of Land and Physical Planning.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFormData(f => ({ ...f, plotSize: p.size })); setSelectedPlanId(p.id); scrollTo('apply'); }}
                    className="btn-primary w-full inline-flex items-center justify-center gap-2"
                  >
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALLMENT CALCULATOR */}
      <section id="calculator" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Installment Calculator</h2>
            <p className="text-gray-500">See exactly what you&apos;ll pay, and what&apos;s left, at a glance.</p>
          </div>

          <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Plot Size</p>
              <div className="grid grid-cols-2 gap-3">
                {PLOT_PLANS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPlanId(p.id); setMonthsPaid(0); }}
                    className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                      selectedPlanId === p.id
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {p.size}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Total Price</p>
                <p className="text-lg font-extrabold text-white">{formatNaira(plan.total)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Initial Deposit</p>
                <p className="text-lg font-extrabold text-white">{formatNaira(plan.deposit)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Monthly Payment</p>
                <p className="text-lg font-extrabold text-white">{formatNaira(plan.monthly)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-lg font-extrabold text-white">{plan.months} Months</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-wide mb-1">Remaining Balance</p>
                <p className="text-lg font-extrabold text-[var(--color-gold)]">{formatNaira(remainingBalance)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Months Already Paid</p>
                <span className="text-xs font-bold text-white">{monthsPaid} / {plan.months}</span>
              </div>
              <input
                type="range"
                min={0}
                max={plan.months}
                value={monthsPaid}
                onChange={e => setMonthsPaid(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
                aria-label="Months already paid"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Example: {formatNaira(plan.deposit)} deposit + {formatNaira(plan.monthly)} × {plan.months} months = {formatNaira(plan.total)}.
          </p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-gray-50 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">Why Buy With M.I. Real Estate</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[var(--color-primary)] hover:-translate-y-1 transition-all shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-1.5">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[var(--color-primary)] tracking-widest">{item.step}</span>
                <h3 className="font-extrabold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT COMPANY */}
      <section id="about" className="bg-[var(--color-primary-dark)] py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Hammer className="w-10 h-10 text-[var(--color-gold)] mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">About M.I. Real Estate</h2>
          <p className="text-white/85 text-lg leading-relaxed">
            M.I. Real Estate and General Enterprises Ltd. is a trusted real estate company offering plots of land, houses, plazas, property management, building construction, and general contracting services at affordable prices.
          </p>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Sent</h2>
              <p className="text-gray-600 mb-6">
                Your details should have opened in WhatsApp — send that message and our team will reach out to you shortly.
                If it didn&apos;t open, call us on {COMPANY_PHONE}.
              </p>
              <button onClick={() => { setSubmitted(false); setFormData({ fullName: '', phone: '', email: '', plotSize: '', preferredProperty: 'Lambu Government Layout', paymentPlan: '24-Month Installment Plan', address: '', message: '' }); }} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
                Submit Another Application
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Apply for Your Plot</h2>
                <p className="text-gray-500">Fill in your details and we&apos;ll contact you to complete your application.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass} />
                    {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Preferred Plot Size *</label>
                    <select value={formData.plotSize} onChange={e => setFormData({ ...formData, plotSize: e.target.value })} className={inputClass}>
                      <option value="">Select plot size</option>
                      {PLOT_PLANS.map(p => <option key={p.id} value={p.size}>{p.size}</option>)}
                      <option value="Not sure yet">Not sure yet</option>
                    </select>
                    {errors.plotSize && <p className="text-xs text-red-600 mt-1">{errors.plotSize}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Property</label>
                    <select value={formData.preferredProperty} onChange={e => setFormData({ ...formData, preferredProperty: e.target.value })} className={inputClass}>
                      <option value="Lambu Government Layout">Lambu Government Layout</option>
                      <option value="Not decided yet">Not decided yet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Payment Plan</label>
                  <select value={formData.paymentPlan} onChange={e => setFormData({ ...formData, paymentPlan: e.target.value })} className={inputClass}>
                    <option value="24-Month Installment Plan">24-Month Installment Plan</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Your Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea rows={4} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className={`${inputClass} resize-none`} placeholder="Tell us anything else we should know..." />
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                  Submit Application <ArrowRight className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={`https://wa.me/${COMPANY_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#1a9c4c] font-bold py-3 rounded-xl hover:bg-green-50 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </a>
                  <a
                    href={`tel:${COMPANY_PHONE_TEL}`}
                    className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Phone className="w-4 h-4" /> Call Us
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm text-gray-700">{COMPANY_ADDRESS}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Phone</p>
              <a href={`tel:${COMPANY_PHONE_TEL}`} className="text-sm text-gray-700 hover:text-[var(--color-primary)] font-semibold">{COMPANY_PHONE}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
