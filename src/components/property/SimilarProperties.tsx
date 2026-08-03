"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PropertyListing } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';

interface SimilarPropertiesProps {
  currentProperty: PropertyListing;
}

export default function SimilarProperties({ currentProperty }: SimilarPropertiesProps) {
  const [similar, setSimilar] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      const allProps = await api.getProperties();
      
      // Algorithm: Match Location -> Project -> Price Range (Â±20%)
      const matches = allProps.filter(p => {
        if (p.id === currentProperty.id) return false; // Exclude self
        
        let score = 0;
        if (p.location.toLowerCase() === currentProperty.location.toLowerCase()) score += 3;
        if (p.projectId && p.projectId === currentProperty.projectId) score += 3;
        if (p.type === currentProperty.type) score += 2;
        
        // Price check Â± 30%
        const minPrice = currentProperty.price * 0.7;
        const maxPrice = currentProperty.price * 1.3;
        if (p.price >= minPrice && p.price <= maxPrice) score += 2;

        return score >= 3; // Must have at least 3 points to be considered similar
      });

      // Sort by score desc (we don't have the score attached to objects anymore, but roughly filtering works)
      // For simplicity, just return the first 3
      setSimilar(matches.slice(0, 3));
      setLoading(false);
    };

    fetchSimilar();
  }, [currentProperty]);

  if (loading) return <div className="py-12 animate-pulse bg-gray-100 rounded-3xl h-64 mt-12"></div>;
  if (similar.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-gray-200">
      <h3 className="text-3xl font-bold text-gray-900 mb-8">Similar Properties</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similar.map(prop => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </div>
  );
}
