"use client";

import React, { useState, useEffect } from 'react';
import PropertySubmissionForm from '@/components/forms/PropertySubmissionForm';
import PropertyCard from '@/components/PropertyCard';
import { Building2, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { PropertyListing } from '@/lib/types';
import { Suspense } from 'react';

function ListPropertyContent() {
  const [featuredProps, setFeaturedProps] = useState<PropertyListing[]>([]);

  useEffect(() => {
    api.getProperties().then(data => {
      setFeaturedProps(data.filter(p => p.featured).slice(0, 3));
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">List Your Property</h1>
          <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Reach verified buyers and tap into our extensive real estate network.</p>
        </div>

        {/* Featured Properties Section */}
        {featuredProps.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-800 border-b pb-2">
              <Star className="text-amber-500 fill-amber-500 w-6 h-6" /> Recently Listed Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProps.map(prop => (
                <div key={prop.id} className="h-full">
                  <PropertyCard property={prop} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PropertySubmissionForm source="List Property Page" />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default function ListPropertyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading form...</div>}>
      <ListPropertyContent />
    </Suspense>
  );
}
