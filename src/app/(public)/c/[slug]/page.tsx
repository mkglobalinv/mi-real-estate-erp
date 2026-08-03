"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import CampaignWizard from '@/components/CampaignWizard';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Campaign, CampaignQuestion } from '@/lib/types';

export default function CampaignLandingPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [questions, setQuestions] = useState<CampaignQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof slug === 'string') {
      const loadData = async () => {
        try {
          const camp = await api.getCampaignBySlug(slug);
          if (camp) {
            setCampaign(camp);
            // Default questions if none exist
            let qs = await api.getCampaignQuestions(camp.id);
            if (qs.length === 0) {
              qs = [
                { id: 'q1', campaignId: camp.id, type: 'Radio', questionText: 'Are you ready to start payment immediately?', options: ['Yes, Immediate', 'In 30 Days', 'Not yet'], orderIndex: 1, isRequired: true, createdAt: '' },
                { id: 'q2', campaignId: camp.id, type: 'Radio', questionText: 'What is your timeline for acquisition?', options: ['Immediate', 'Within 30 Days', 'Within 90 Days', 'Just researching'], orderIndex: 2, isRequired: true, createdAt: '' },
                { id: 'q3', campaignId: camp.id, type: 'Radio', questionText: 'Can you pay the initial form fee today?', options: ['Yes I can', 'Maybe later', 'No'], orderIndex: 3, isRequired: true, createdAt: '' },
              ];
            }
            setQuestions(qs);
            api.trackCampaignEvent(camp.id, 'page_view').catch(console.error);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div></div>;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold">Campaign Not Found</h2>
        <button onClick={() => router.push('/')} className="btn-primary">Return Home</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Campaign Hero */}
      <section className="bg-[var(--color-primary-dark)] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <div className="inline-block bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6">
              Exclusive Offer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {campaign.name}
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              {campaign.description || "Don't miss out on our limited-time premium property offers tailored specifically for you. Secure your investment today with flexible payment plans."}
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400 w-5 h-5" /> <span>Prime Location with High ROI</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400 w-5 h-5" /> <span>Verified Documents & Titles</span></li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-400 w-5 h-5" /> <span>Flexible Installment Options</span></li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full relative h-[400px]">
            <Image 
              src={campaign.featuredImage || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
              alt={campaign.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="lazy"
              className="rounded-3xl shadow-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Property Information & Advisor */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Interested in {campaign.name}?</h2>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Use our Qualification Wizard to get tailored recommendations and speak with our consultants.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="sticky top-24">
              <CampaignWizard campaign={campaign} questions={questions} />
            </div>
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6">Why Invest Now?</h3>
              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-lg mb-2 text-[var(--color-primary)]">Strategic Location</h4>
                  <p className="text-gray-600">Situated in rapid development zones ensuring capital appreciation within the first 12 months.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-[var(--color-primary)]">Secure Investment</h4>
                  <p className="text-gray-600">All properties come with verified C of O and are free from all government encumbrances.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 text-[var(--color-primary)]">Easy Entry</h4>
                  <p className="text-gray-600">Start with as little as 20% down payment and spread the balance comfortably.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
