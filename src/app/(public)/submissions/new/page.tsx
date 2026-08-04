"use client";
import React from 'react';
import PropertySubmissionForm from '@/components/forms/PropertySubmissionForm';

export default function NewPropertySubmissionPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">List Your Property</h1>
          <p className="text-lg text-gray-600">Partner with M.I. Real Estate to market your property to our extensive network of verified buyers.</p>
        </div>
        
        <PropertySubmissionForm />
      </div>
    </div>
  );
}
