"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Wallet, LayoutGrid, HelpCircle, Building2 } from 'lucide-react';
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECE5DD]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-[#ECE5DD] px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Campaign Not Found</h2>
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
    <div className="min-h-screen bg-[#ECE5DD] sm:py-6">
      {/* Phone-width chat panel — mobile-first; on larger screens it stays
          narrow like a chat window instead of stretching into a website layout. */}
      <div className="max-w-md mx-auto min-h-screen sm:min-h-0 flex flex-col bg-[#ECE5DD] sm:rounded-2xl sm:shadow-xl overflow-hidden">

        {/* WhatsApp-style top bar */}
        <header className="bg-[var(--color-primary-dark)] text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {heroImage ? (
              <Image src={heroImage} alt="" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">M.I. Real Estate</p>
            <p className="text-[11px] text-green-100/90">Property Consultant</p>
          </div>
        </header>

        {/* Chat body */}
        <div className="flex-1 flex flex-col gap-3 px-3 py-4">

          {/* Campaign / property introduction, presented as the first chat message */}
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center flex-shrink-0 mb-1">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm overflow-hidden max-w-[calc(100%-2.25rem)] w-full">
              {heroImage && (
                <div className="relative w-full h-44">
                  <Image
                    src={heroImage}
                    alt={campaign.name}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="px-4 py-4">
                <div className="inline-block bg-[var(--color-accent)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                  Exclusive Offer
                </div>
                <h1 className="text-lg font-bold text-gray-800 leading-snug mb-1.5">
                  {campaign.name}
                </h1>
                {(campaign.description || project?.description) && (
                  <p className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-line mb-3">
                    {campaign.description || project?.description || ''}
                  </p>
                )}
                {propertyDetails.length > 0 && (
                  <ul className="space-y-2 pt-1 border-t border-gray-100">
                    {propertyDetails.map(({ icon: Icon, label, value }) => (
                      <li key={label} className="flex items-center gap-2 text-sm pt-2">
                        <Icon className="text-[var(--color-primary)] w-4 h-4 flex-shrink-0" />
                        <span className="text-gray-500">{label}:</span> <strong className="text-gray-800">{value}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Media Gallery — driven by campaign_media, admin-configured */}
          {media.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="w-7 flex-shrink-0" />
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm p-3 max-w-[calc(100%-2.25rem)] w-full">
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {media.map(m => (
                    <div key={m.id} className="relative h-28 w-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image src={m.fileUrl} alt={m.title || campaign.name} fill sizes="112px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Packages */}
          {packages.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="w-7 flex-shrink-0" />
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-4 max-w-[calc(100%-2.25rem)] w-full">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-gray-800">
                  <Wallet className="w-4 h-4 text-[var(--color-primary)]" /> Packages & Pricing
                </h3>
                <div className="space-y-3">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                      <p className="font-bold text-[15px] mb-1.5 text-gray-800">{pkg.name}</p>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-1.5">
                        <div><span className="text-gray-400">Outright:</span> ₦{pkg.outrightPrice.toLocaleString()}</div>
                        <div><span className="text-gray-400">Deposit:</span> ₦{pkg.initialDeposit.toLocaleString()}</div>
                        {pkg.durationMonths > 0 && (
                          <>
                            <div><span className="text-gray-400">Monthly:</span> ₦{pkg.monthlyInstallment.toLocaleString()}</div>
                            <div><span className="text-gray-400">Duration:</span> {pkg.durationMonths} Months</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQs — driven by campaign_faqs, admin-approved */}
          {faqs.length > 0 && (
            <div className="flex items-end gap-2">
              <div className="w-7 flex-shrink-0" />
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-4 max-w-[calc(100%-2.25rem)] w-full">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-gray-800">
                  <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" /> Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {faqs.map(f => (
                    <div key={f.id} className="border-t border-gray-100 pt-3 first:border-0 first:pt-0">
                      <p className="font-bold text-[15px] mb-1 text-gray-800">{f.question}</p>
                      <p className="text-sm text-gray-600">{f.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {campaign.termsAndConditions && (
            <div className="flex items-end gap-2">
              <div className="w-7 flex-shrink-0" />
              <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm px-4 py-4 max-w-[calc(100%-2.25rem)] w-full text-sm text-gray-600">
                <p className="text-sm font-bold mb-2 text-gray-800">Terms &amp; Conditions</p>
                <div className="whitespace-pre-wrap">{campaign.termsAndConditions}</div>
              </div>
            </div>
          )}

          {/* Qualification wizard — one question at a time, unchanged logic */}
          <CampaignWizard campaign={campaign} questions={questions} />
        </div>
      </div>
    </div>
  );
}
