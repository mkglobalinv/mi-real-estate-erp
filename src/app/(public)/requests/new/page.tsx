"use client";
import React from 'react';
import PropertyRequestForm from '@/components/forms/PropertyRequestForm';

export default function NewPropertyRequestPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Property Request</h1>
          <p className="text-lg text-gray-600">Tell us what you're looking for, and our experts will find the perfect match.</p>
        </div>
        
        <PropertyRequestForm />
      </div>
    </div>
  );
}
