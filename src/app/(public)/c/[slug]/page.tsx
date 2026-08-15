"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Wallet, LayoutGrid, HelpCircle } from 'lucide-react';
import CampaignWizard from '@/components/CampaignWizard';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Campaign, CampaignQuestion, Project, CampaignMedia, CampaignFaq, Location, CampaignPackage } from '@/lib/types';
import { buildFallbackQuestions } from '@/lib/defaultCampaignQuestions';

export default function CampaignLandingPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [questions, setQuestions] = useState<CampaignQuestion[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<CampaignMedia[]>([]);
  const [faqs, setFaqs] = useState<CampaignFaq[]>([]);
  const [packages, setPackages] = useState<CampaignPackage[]>([]);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof slug === 'string') {
      const loadData = async () => {
        try {
          const camp = await api.getCampaignBySlug(slug);
          if (camp) {
            setCampaign(camp);

            // New campaigns are seeded with the default qualification
            // questions on creation (see CampaignForm); this fallback only
            // covers campaigns created before that existed.
            let qs = await api.getCampaignQuestions(camp.id);
            if (qs.length === 0) {
              qs = buildFallbackQuestions(camp.id);
            }
            setQuestions(qs);

            // Property presentation data — all driven by the campaign's own
            // configuration, never hard-coded per-campaign copy.
            const [proj, mediaItems, faqItems, pkgItems] = await Promise.all([
              camp.projectId ? api.getProjectById(camp.projectId) : Promise.resolve(null),
              api.getCampaignMedia(camp.id),
              api.getCampaignFaqs(camp.id),
              api.getCampaignPackages(camp.id)
            ]);
            setProject(proj);
            setMedia(mediaItems);
            setFaqs(faqItems);
            setPackages(pkgItems);

            if (proj?.locationId) {
              const locations = await api.getLocations();
              const match = locations.find((l: Location) => l.id === proj.locationId);
              if (match) setLocationName(match.name);
            }

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

  const heroImage = campaign.featuredImage || project?.coverImage;
  const propertyDetails = [
    locationName && { icon: MapPin, label: 'Location', value: locationName },
    project && project.startingPrice > 0 && packages.length === 0 && { icon: Wallet, label: 'Starting Price', value: `₦${project.startingPrice.toLocaleString()}` },
    project && project.availableUnits > 0 && { icon: LayoutGrid, label: 'Available Units', value: String(project.availableUnits) },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

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
            <p className="text-lg text-gray-200 mb-8 leading-relaxed whitespace-pre-line">
              {campaign.description || project?.description || ''}
            </p>
            {propertyDetails.length > 0 && (
              <ul className="space-y-4 mb-8">
                {propertyDetails.map(({ icon: Icon, label, value }) => (
                  <li key={label} className="flex items-center gap-3">
                    <Icon className="text-green-400 w-5 h-5 flex-shrink-0" />
                    <span><span className="text-gray-300">{label}:</span> <strong>{value}</strong></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {heroImage && (
            <div className="md:w-1/2 w-full relative h-[400px]">
              <Image
                src={heroImage}
                alt={campaign.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
                className="rounded-3xl shadow-2xl object-cover"
              />
            </div>
          )}
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

            <div className="space-y-8">
              {/* Media Gallery — driven by campaign_media, admin-configured */}
              {media.length > 0 && (
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-6">Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {media.map(m => (
                      <div key={m.id} className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                        <Image src={m.fileUrl} alt={m.title || campaign.name} fill sizes="200px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs — driven by campaign_faqs, admin-approved */}
              {faqs.length > 0 && (
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-[var(--color-primary)]" /> Frequently Asked Questions
                  </h3>
                  <div className="space-y-6">
                    {faqs.map(f => (
                      <div key={f.id}>
                        <h4 className="font-bold text-lg mb-2 text-[var(--color-primary)]">{f.question}</h4>
                        <p className="text-gray-600">{f.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Packages */}
              {packages.length > 0 && (
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-[var(--color-primary)]" /> Packages & Pricing
                  </h3>
                  <div className="space-y-6">
                    {packages.map(pkg => (
                      <div key={pkg.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h4 className="font-bold text-lg mb-2">{pkg.name}</h4>
                        <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                          <div><strong>Outright:</strong> ₦{pkg.outrightPrice.toLocaleString()}</div>
                          <div><strong>Deposit:</strong> ₦{pkg.initialDeposit.toLocaleString()}</div>
                          {pkg.durationMonths > 0 && (
                            <>
                              <div><strong>Monthly:</strong> ₦{pkg.monthlyInstallment.toLocaleString()}</div>
                              <div><strong>Duration:</strong> {pkg.durationMonths} Months</div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              {campaign.termsAndConditions && (
                <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 text-sm text-gray-600">
                  <h3 className="text-lg font-bold mb-4 text-gray-800">Terms & Conditions</h3>
                  <div className="whitespace-pre-wrap">{campaign.termsAndConditions}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
