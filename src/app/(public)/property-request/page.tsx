"use client";

import React, { Suspense } from 'react';
import PropertyRequestForm from '@/components/forms/PropertyRequestForm';

function PropertyRequestContent() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Property Request</h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Tell us what you're looking for, and we will find the perfect match.</p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PropertyRequestForm source="Dedicated Request Page" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading form...</div>}>
      <PropertyRequestContent />
    </Suspense>
  );
}
