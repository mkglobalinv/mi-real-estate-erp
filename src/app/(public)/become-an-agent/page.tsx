"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Project, OfficeInfo, Testimonial } from '@/lib/types';
import {
  CheckCircle2, ArrowRight, MapPin, Smartphone, UserPlus, FolderOpen,
  Share2, Users, Wallet, MessageCircle, ChevronDown, Building2, ShieldCheck
} from 'lucide-react';

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

// Illustrative only — uses the real 40x40 plan numbers already configured
// elsewhere in the app (src/features/customers/page.tsx PLOT_PLANS), not a
// live commission-rule fetch. Actual commission per plot type is set by the
// Chairman in Commission Rules and can differ from this example.
const EXAMPLE_DEPOSIT = 200000;
const EXAMPLE_RATE = 0.6;
const EXAMPLE_COMMISSION = EXAMPLE_DEPOSIT * EXAMPLE_RATE;

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Agent Account',
    icon: UserPlus,
    body: 'Register online with your name, phone number and bank details — takes a few minutes, no office visit required.',
  },
  {
    step: '02',
    title: 'Get Your Referral Link',
    icon: Share2,
    body: 'Your agent dashboard gives you a personal referral link and access to submit customers directly.',
  },
  {
    step: '03',
    title: 'Share With Your Network',
    icon: Smartphone,
    body: 'Share your link or our live property listings on WhatsApp, Facebook, TikTok, Instagram or anywhere your audience is.',
  },
  {
    step: '04',
    title: 'Refer Your Customer',
    icon: Users,
    body: 'When someone is interested, submit their details from your dashboard. We handle verification from there.',
  },
  {
    step: '05',
    title: 'Customer Pays → You Earn',
    icon: Wallet,
    body: 'Once the customer is verified, approved and successfully pays their initial deposit, your commission is confirmed and paid to your registered account.',
  },
];

const BENEFITS = [
  { icon: Wallet, title: 'Earn Commission', body: 'Earn commission on qualifying customer initial deposits.' },
  { icon: Smartphone, title: 'Work From Anywhere', body: 'No requirement to physically visit our office — register and operate online.' },
  { icon: FolderOpen, title: 'Access Active Projects', body: 'See available M.I. Real Estate projects and their pricing at any time.' },
  { icon: Users, title: 'Track Your Customers', body: 'Know exactly where every referral stands, from submission to approval.' },
  { icon: Wallet, title: 'Track Your Earnings', body: 'See pending, eligible and paid commission in one place.' },
  { icon: MessageCircle, title: 'Direct Support', body: 'Reach M.I. Real Estate on WhatsApp whenever you need project information.' },
];

const FAQS = [
  { q: 'Do I need to visit your office?', a: 'No. You can register online and operate as an agent from wherever you are.' },
  { q: 'Who can become an agent?', a: 'Individuals, marketers, property consultants, businesses and other eligible people can apply.' },
  { q: 'How much is the commission?', a: `Commission is a percentage of the qualifying customer's initial deposit, set per plot type by the Chairman — for example, on a plan with a ₦${EXAMPLE_DEPOSIT.toLocaleString()} deposit, ${EXAMPLE_RATE * 100}% works out to ₦${EXAMPLE_COMMISSION.toLocaleString()}.` },
  { q: 'When do I receive my commission?', a: 'After your customer is verified and approved, successfully pays their initial deposit, and the commission is approved by the Chairman.' },
  { q: 'Can I promote your projects online?', a: 'Yes. Share your referral link or any live property listing on WhatsApp, Facebook, TikTok, Instagram or anywhere else.' },
  { q: 'Can I see my customers?', a: "Yes. Every customer you refer and their status is visible in your agent dashboard." },
  { q: 'Can I contact M.I. Real Estate?', a: 'Yes. Your dashboard and every project page include a direct WhatsApp option.' },
];

export default function BecomeAnAgentPage() {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '',
    bankName: '', accountNumber: '', accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentSerial, setAgentSerial] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    api.getProjects().then(data => setProjects(data.filter(p => p.active).slice(0, 3)));
    api.getOfficeInfo().then(setOffice);
    api.getTestimonials().then(data => setTestimonials(data.filter(t => t.isActive).slice(0, 3)));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setAgentSerial(data.agent.agentSerial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('agent-register-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (agentSerial) {
    return (
      <div className="bg-gray-50 min-h-screen pb-24 pt-10 flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-9 h-9 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
            <p className="text-gray-600 mb-1">Your Agent ID:</p>
            <p className="text-2xl font-extrabold text-[var(--color-primary)] mb-6">{agentSerial}</p>
            <p className="text-gray-600 mb-8">Your application is pending Chairman approval. You&apos;ll be able to sign in and start submitting customer referrals once approved.</p>
            <Link href="/login" className="btn-primary inline-block px-8 py-3">Go to Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20 mb-5">
              M.I. Real Estate Agent Program
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-extrabold text-white leading-[1.08] mb-5 tracking-tight">
              Become an M.I. Real Estate Agent
            </h1>
            <p className="text-lg text-white/85 mb-8 max-w-md mx-auto md:mx-0">
              Promote our properties from anywhere and earn <strong className="text-[var(--color-gold)]">{EXAMPLE_RATE * 100}% commission</strong> when your referred customer successfully starts a plot payment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button onClick={scrollToForm} className="bg-white text-[var(--color-primary-dark)] font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
                Become an Agent <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={scrollToHowItWorks} className="bg-white/10 backdrop-blur-sm text-white font-bold py-3.5 px-8 rounded-xl border border-white/30 hover:bg-white/20 transition-all">
                How It Works
              </button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
                alt="Agent promoting real estate on a smartphone"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Example Commission</p>
                <p className="text-lg font-extrabold text-gray-900">₦{EXAMPLE_COMMISSION.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMISSION */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Earn {EXAMPLE_RATE * 100}% Commission</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">When you successfully refer a customer who is submitted through your agent account, verified and approved, selects an available plot, and pays their initial deposit to start their plot payment plan.</p>
        </div>

        <div className="max-w-md mx-auto bg-gray-900 rounded-3xl p-8 shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer Initial Deposit</span>
              <span className="text-xl font-extrabold text-white">₦{EXAMPLE_DEPOSIT.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Agent Commission ({EXAMPLE_RATE * 100}%)</span>
              <span className="text-xl font-extrabold text-[var(--color-gold)]">₦{EXAMPLE_COMMISSION.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center max-w-lg mx-auto mb-3">Example only, based on one of our current plot plans. Actual commission is set per plot type.</p>
        <p className="text-sm text-gray-500 text-center max-w-xl mx-auto bg-amber-50 border border-amber-100 rounded-xl px-5 py-3">
          Commission is subject to customer verification, Chairman approval and confirmation of the customer&apos;s successful initial payment/start of the plot payment plan.
        </p>
      </section>

      {/* 3. NO OFFICE VISIT REQUIRED */}
      <section className="bg-[var(--color-primary-light)]/40 py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <MapPin className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">No Office Visit Required</h2>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            You don&apos;t need to live near our office to become an M.I. Real Estate Agent. Whether you&apos;re in Kano, Abuja, Lagos, another Nigerian state or outside Nigeria — a marketer, a community leader, a business, or working independently — you can create your agent account online.
          </p>
          <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2 px-8 py-3.5">
            Create My Agent Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-2">How It Works</h2>
        <p className="text-gray-500 text-center mb-12">Five simple steps, all from your phone.</p>
        <div className="space-y-4">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="flex gap-4 sm:gap-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--color-primary)] tracking-widest">{item.step}</span>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. DASHBOARD PREVIEW */}
      <section className="bg-gray-950 py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">What You Get After Registering</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Once approved, your Agent Dashboard is your control center.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Share2, title: 'My Referral Link', body: 'A personal link you can share anywhere — customers can submit their own details directly.' },
            { icon: UserPlus, title: 'Add Customer', body: 'Submit a customer referral in minutes, straight from your dashboard.' },
            { icon: Users, title: 'My Referrals', body: 'Track every referral: Submitted, Under Review, Accepted, Commission Pending, Paid.' },
            { icon: Wallet, title: 'My Earnings', body: 'See pending, eligible and paid commission at a glance.' },
          ].map(card => (
            <div key={card.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left backdrop-blur-sm">
              <card.icon className="w-6 h-6 text-[var(--color-gold)] mb-3" />
              <h3 className="font-extrabold text-white mb-1">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHY BECOME AN AGENT */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">Why Become an M.I. Real Estate Agent?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(b => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[var(--color-primary)] hover:-translate-y-1 transition-all">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-gray-900 mb-1.5">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. TRUST SECTION */}
      <section className="bg-gray-50 py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <ShieldCheck className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">A Company You Can Trust</h2>
            <p className="text-gray-500">M.I. Real Estate &amp; General Enterprises Ltd. (RC No. 1771366)</p>
          </div>

          {projects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="relative h-40 bg-gray-100">
                    {p.coverImage && (
                      <Image src={p.coverImage} alt={p.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-extrabold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-600 mb-3">&ldquo;{t.review}&rdquo;</p>
                  <p className="text-xs font-extrabold text-gray-900">{t.customerName}</p>
                </div>
              ))}
            </div>
          )}

          {office && (office.address || office.phone1 || office.whatsapp) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[var(--color-primary)] shrink-0" />
                <div>
                  {office.address && <p className="text-sm font-bold text-gray-900">{office.address}</p>}
                  {office.businessHours && <p className="text-xs text-gray-500">{office.businessHours}</p>}
                </div>
              </div>
              {office.whatsapp && (
                <a
                  href={`https://wa.me/${office.whatsapp}?text=Hi, I'd like to know more about becoming an M.I. Real Estate Agent.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-5 py-2.5 rounded-xl shrink-0"
                >
                  <MessageCircle className="w-4 h-4" /> Chat With Us
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={f.q} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
              >
                <span className="font-bold text-gray-900 text-sm sm:text-base">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="px-5 pb-4 text-sm text-gray-500">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 12. REGISTRATION CTA */}
      <section className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] py-16 md:py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Ready to Become an M.I. Real Estate Agent?</h2>
        <p className="text-white/85 max-w-xl mx-auto mb-8">Create your account online and start connecting customers to quality real estate opportunities.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={scrollToForm} className="bg-white text-[var(--color-primary-dark)] font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Become an Agent
          </button>
          <Link href="/login" className="bg-white/10 backdrop-blur-sm text-white font-bold py-3.5 px-8 rounded-xl border border-white/30 hover:bg-white/20 transition-all">
            Already an Agent? Login
          </Link>
        </div>
      </section>

      {/* 13. REGISTRATION FORM */}
      <section id="agent-register-form" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Your Agent Account</h2>
            <p className="text-gray-500">Registration takes a few minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password *</label>
                <input required type="password" minLength={8} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="At least 8 characters" />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 pt-4">Bank Details — for commission payments</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Bank Name *</label>
                  <input required type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Account Number *</label>
                  <input required type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Account Name *</label>
                  <input required type="text" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 rounded-lg border border-red-100">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Register as Agent'}
            </button>
            <p className="text-xs text-gray-400 text-center">Already registered? <Link href="/login" className="text-[var(--color-primary)] font-medium">Sign in</Link></p>
          </form>
        </div>
      </section>
    </div>
  );
}
