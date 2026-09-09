"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Project, OfficeInfo } from '@/lib/types';
import {
  CheckCircle2, ArrowRight, MapPin, UserPlus, FolderOpen,
  Megaphone, UserCheck, Trophy, Users, Wallet, MessageCircle, ChevronDown,
  ShieldCheck, Play, Bell, BarChart3, Globe, Image as ImageIcon, Headphones,
  User, Phone as PhoneIcon, Landmark, Hash, Mail, Lock, Briefcase, FileText,
} from 'lucide-react';

const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

function IconInput({ icon: Icon, ...props }: { icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input {...props} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm" />
    </div>
  );
}

// Illustrative only — uses the real 40x40 plan numbers already configured
// elsewhere in the app (src/features/customers/page.tsx PLOT_PLANS), not a
// live commission-rule fetch. Actual commission per plot type is set by the
// Chairman in Commission Rules and can differ from this example.
const EXAMPLE_DEPOSIT = 200000;
const EXAMPLE_RATE = 0.6;
const EXAMPLE_COMMISSION = EXAMPLE_DEPOSIT * EXAMPLE_RATE;

const QUICK_HIGHLIGHTS = [
  { icon: Globe, label: 'Work From Anywhere' },
  { icon: FolderOpen, label: 'Access Active Projects' },
  { icon: ImageIcon, label: 'Share Project Photos' },
  { icon: Wallet, label: 'Track Your Earnings' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Agent Account',
    icon: UserPlus,
    body: 'Register with your name, phone number, address and bank details — takes a few minutes, no office visit required.',
  },
  {
    step: '02',
    title: 'Access Our Projects',
    icon: FolderOpen,
    body: 'See available M.I. Real Estate projects, pricing and payment plans right from your dashboard.',
  },
  {
    step: '03',
    title: 'Advertise',
    icon: Megaphone,
    body: 'Share your referral link and real project photos on WhatsApp, Facebook, TikTok, Instagram and more.',
  },
  {
    step: '04',
    title: 'Refer Your Customer',
    icon: UserCheck,
    body: 'When someone is interested, submit their details from your dashboard. We handle verification from there.',
  },
  {
    step: '05',
    title: 'Customer Pays → You Earn',
    icon: Trophy,
    body: 'Once your customer is verified, approved and successfully pays their initial deposit, your commission is confirmed and paid to your registered account.',
  },
];

const DASHBOARD_CARDS = [
  { icon: FolderOpen, title: 'My Projects', body: 'View available projects', color: 'bg-[var(--color-primary)]' },
  { icon: Users, title: 'My Customers', body: 'Track all referrals', color: 'bg-blue-500' },
  { icon: BarChart3, title: 'Referral Status', body: 'See progress', color: 'bg-amber-500' },
  { icon: Wallet, title: 'My Commission', body: 'Pending, approved & paid', color: 'bg-purple-500' },
];

const BENEFITS = [
  { icon: Trophy, title: `Earn ${EXAMPLE_RATE * 100}% Commission`, body: 'Earn commission on qualifying customer initial deposits.', bg: 'bg-amber-100 text-amber-600' },
  { icon: Globe, title: 'Work From Anywhere', body: 'No requirement to physically visit our office.', bg: 'bg-blue-100 text-blue-600' },
  { icon: FolderOpen, title: 'Access Active Projects', body: 'Always see M.I. Real Estate’s latest developments.', bg: 'bg-orange-100 text-orange-600' },
  { icon: ImageIcon, title: 'Real Project Photos', body: 'Share real photos from our live project listings.', bg: 'bg-teal-100 text-teal-600' },
  { icon: BarChart3, title: 'Track Your Customers', body: 'Know exactly where every referral stands.', bg: 'bg-green-100 text-green-600' },
  { icon: Wallet, title: 'Track Your Earnings', body: 'See pending, approved and paid commission.', bg: 'bg-orange-100 text-orange-600' },
  { icon: Headphones, title: 'Direct Support', body: 'Reach M.I. Real Estate on WhatsApp anytime.', bg: 'bg-purple-100 text-purple-600' },
];

const FAQS = [
  { q: 'Do I need to visit your office?', a: 'No. You can register online and operate as an agent from wherever you are.' },
  { q: 'Who can become an agent?', a: 'Individuals, marketers, property consultants, businesses and other eligible people can apply.' },
  { q: 'How much is the commission?', a: `Commission is a percentage of the qualifying customer's initial deposit, set per plot type by the Chairman — for example, on a plan with a ₦${EXAMPLE_DEPOSIT.toLocaleString()} deposit, ${EXAMPLE_RATE * 100}% works out to ₦${EXAMPLE_COMMISSION.toLocaleString()}.` },
  { q: 'When do I receive my commission?', a: 'After your customer is verified and approved, successfully pays their initial deposit, and the commission is approved by the Chairman.' },
  { q: 'Can I promote your projects online?', a: 'Yes. Share your referral link or any live project listing on WhatsApp, Facebook, TikTok, Instagram or anywhere else.' },
  { q: 'Can I see my customers?', a: 'Yes. Every customer you refer and their status is visible in your agent dashboard.' },
  { q: 'Can I contact M.I. Real Estate?', a: 'Yes. Your dashboard and every project page include a direct WhatsApp option.' },
  { q: 'Is there a registration fee?', a: 'No. Registration is completely free.' },
];

export default function BecomeAnAgentPage() {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', password: '', address: '',
    companyName: '', additionalInfo: '',
    bankName: '', accountNumber: '', accountName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentSerial, setAgentSerial] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [office, setOffice] = useState<OfficeInfo | null>(null);

  useEffect(() => {
    api.getProjects().then(data => setProjects(data.filter(p => p.active)));
    api.getOfficeInfo().then(setOffice);
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
      <section className="bg-white">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 pb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-4 tracking-tight">
            Become an <span className="text-[var(--color-primary)]">M.I. Real Estate</span> Agent
          </h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-lg mx-auto mb-7">
            Promote our properties from anywhere and earn <strong className="text-gray-900">{EXAMPLE_RATE * 100}% commission</strong> when your referred customer successfully starts a plot payment.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-2 text-left">
            {QUICK_HIGHLIGHTS.map(h => (
              <div key={h.label} className="flex items-center gap-2">
                <h.icon className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                <span className="text-xs font-semibold text-gray-600">{h.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative w-full max-w-2xl mx-auto aspect-[4/5] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/become-agent-hero.jpg"
              alt="M.I. Real Estate Agent"
              fill
              priority
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary-dark)]/80 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={scrollToForm} className="flex-1 bg-white text-[var(--color-primary-dark)] font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2">
                  Become an Agent <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={scrollToHowItWorks} className="flex-1 bg-white/10 backdrop-blur-sm text-white font-bold py-3.5 px-6 rounded-xl border border-white/40 hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> How It Works
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: ShieldCheck, label: 'Trusted Real Estate Company' },
              { icon: FolderOpen, label: 'Real Projects' },
              { icon: Users, label: 'Better Communities' },
            ].map(t => (
              <div key={t.label} className="flex flex-col items-center gap-1.5">
                <t.icon className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. COMMISSION */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Earn {EXAMPLE_RATE * 100}% Commission</h2>
          <div className="w-16 h-1.5 bg-[var(--color-gold)] rounded-full mb-6" />
          <p className="text-gray-500 mb-8">When you refer a customer who is verified, approved and successfully pays the initial deposit to start their plot payment.</p>

          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 sm:p-8 mb-4">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-4">Example</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-600">Customer Initial Deposit</span>
              <span className="text-xl sm:text-2xl font-extrabold text-gray-900">₦{EXAMPLE_DEPOSIT.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600">Agent Commission ({EXAMPLE_RATE * 100}%)</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[var(--color-primary)]">₦{EXAMPLE_COMMISSION.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">Example only, based on one of our current plot plans. Actual commission is set per plot type and is subject to customer verification, Chairman approval and confirmation of the customer&apos;s successful initial payment.</p>

          <div className="bg-amber-100/60 rounded-2xl px-5 py-4 flex items-start gap-3 mb-8">
            <span className="text-lg leading-none">💡</span>
            <p className="text-sm font-bold text-amber-800">The more people you connect to land, the more you earn!</p>
          </div>

          <button onClick={scrollToForm} className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 mb-8">
            Become an Agent <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center border-t border-gray-100 pt-8">
            <p className="text-gray-500 italic max-w-sm mx-auto">&ldquo;Together we build people, communities and better futures.&rdquo;</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-2">M.I. Real Estate</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gray-50 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">How It Works</h2>
          <p className="text-gray-500 mb-10">Simple steps to start earning.</p>

          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" aria-hidden="true" />
            <div className="space-y-8">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="relative flex gap-5">
                  <div className="relative z-10 shrink-0 w-11 h-11 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <span className="text-xs font-bold text-[var(--color-primary)] tracking-widest">{item.step}</span>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={scrollToForm} className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 mt-10">
            Become an Agent <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* OUR PROJECTS — live carousel */}
      {projects.length > 0 && (
        <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">Our Projects</h2>
            <p className="text-gray-500 mb-1">Access active M.I. Real Estate projects.</p>
            {office && (
              <p className="text-xs text-gray-400 mb-8">M.I. Real Estate &amp; General Enterprises Ltd. (RC No. 1771366)</p>
            )}

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
              {projects.map(p => (
                <div key={p.id} className="snap-start shrink-0 w-[82%] sm:w-auto sm:shrink bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                  <div className="relative h-44">
                    {p.coverImage ? (
                      <Image src={p.coverImage} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                      Active Project
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-900 mb-1">{p.name}</h3>
                    {p.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-4"><MapPin className="w-3.5 h-3.5" /> {p.location}</p>
                    )}
                    <div className="space-y-2 mb-5 text-sm">
                      {p.startingPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Starting Price</span>
                          <span className="font-bold text-gray-900">₦{p.startingPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Availability</span>
                        <span className="font-bold text-gray-900">{p.availableUnits} unit{p.availableUnits === 1 ? '' : 's'}</span>
                      </div>
                      {p.easyBuyStatus && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Payment Plan</span>
                          <span className="font-bold text-[var(--color-primary)]">Easy Buy Available</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/properties?project=${encodeURIComponent(p.name)}`}
                      className="btn-primary w-full text-center inline-flex items-center justify-center gap-2 py-2.5 text-sm"
                    >
                      View Project Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AGENT DASHBOARD PREVIEW */}
      <section className="bg-gray-950 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-lg">
          <div className="text-center mb-8">
            <span className="inline-block bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 mb-4">
              Dashboard Preview
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-2">Your Agent Dashboard</h2>
            <p className="text-gray-400">Everything you need to succeed, in one place.</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">Welcome, Agent</p>
                  <p className="text-[11px] text-gray-400">Your dashboard, once approved</p>
                </div>
              </div>
              <Bell className="w-5 h-5 text-gray-300" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {DASHBOARD_CARDS.map(card => (
                <div key={card.title} className={`${card.color} rounded-2xl p-4 text-white`}>
                  <card.icon className="w-5 h-5 mb-6 opacity-90" />
                  <p className="font-extrabold text-sm">{card.title}</p>
                  <p className="text-[11px] opacity-80">{card.body}</p>
                </div>
              ))}
            </div>

            {office?.whatsapp && (
              <a
                href={`https://wa.me/${office.whatsapp}?text=Hi, I'd like to know more about becoming an M.I. Real Estate Agent.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">Contact M.I. Real Estate</p>
                  <p className="text-[11px] text-gray-500">Get support on WhatsApp</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 13. REGISTRATION FORM */}
      <section id="agent-register-form" className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md mx-auto sm:max-w-lg">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Your Agent Account</h2>
            <p className="text-gray-500">It&apos;s free and easy to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <IconInput icon={User} required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <IconInput icon={PhoneIcon} required type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Address *</label>
              <IconInput icon={MapPin} required type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <IconInput icon={Mail} required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <IconInput icon={Lock} required type="password" minLength={8} placeholder="At least 8 characters" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Bank Name *</label>
              <IconInput icon={Landmark} required type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Account Number *</label>
              <IconInput icon={Hash} required type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Account Name *</label>
              <IconInput icon={User} required type="text" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Company / Business Name (Optional)</label>
              <IconInput icon={Briefcase} type="text" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Additional Information (Optional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea rows={3} value={formData.additionalInfo} onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm resize-none" />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 py-2.5 rounded-lg border border-red-100">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Create My Agent Account'}
            </button>
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Your information is safe with us.</p>
            <p className="text-xs text-gray-400 text-center">Already registered? <Link href="/login" className="text-[var(--color-primary)] font-medium">Sign in</Link></p>
          </form>
        </div>
      </section>

      {/* WHY BECOME AN AGENT */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Why Become Our Agent?</h2>
          <div className="space-y-6 mb-10">
            {BENEFITS.map(b => (
              <div key={b.title} className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${b.bg} flex items-center justify-center shrink-0`}>
                  <b.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 mb-0.5">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={scrollToForm} className="btn-primary w-full py-3.5">Become an Agent</button>
            {office?.whatsapp && (
              <a
                href={`https://wa.me/${office.whatsapp}?text=Hi, I'd like to know more about becoming an M.I. Real Estate Agent.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 border border-[#25D366] text-[#1a9c4c] font-bold py-3.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Chat With Us on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Frequently Asked Questions</h2>
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
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl">
          <div className="relative rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="M.I. Real Estate estate development"
              width={900}
              height={500}
              className="w-full h-56 sm:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-[var(--color-primary-dark)]/85" />
            <div className="relative z-10 p-8 sm:p-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Ready to Become an M.I. Real Estate Agent?</h2>
              <p className="text-white/85 max-w-md mx-auto mb-7 text-sm sm:text-base">Create your account online and start connecting customers to quality real estate opportunities.</p>
              <button onClick={scrollToForm} className="bg-white text-[var(--color-primary-dark)] font-bold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Become an Agent
              </button>
              <p className="text-white/70 text-sm mt-4">
                Already an Agent? <Link href="/login" className="text-white font-bold underline">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
