"use client";

import React from 'react';
import LeadQualificationFlow from './LeadQualificationFlow';

// Dedicated, distraction-free landing page for ad traffic (e.g. Facebook)
// — mirealestat.com/?qualify=true renders this instead of the homepage,
// decided server-side in page.tsx so there's no flash of homepage content
// first. Same LeadQualificationFlow as the in-page popup, just hosted as
// a full page instead of a modal.
export default function QualifierLandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            M.I. REAL ESTATE <span className="text-[var(--color-gold)]">&amp; GENERAL ENTERPRISES LTD.</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sabuwar Abuja Estate, Langel Dididi, Kano</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          <LeadQualificationFlow />
        </div>
      </div>
    </div>
  );
}
