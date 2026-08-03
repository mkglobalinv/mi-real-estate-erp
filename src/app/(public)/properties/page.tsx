"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PropertyListing } from '@/lib/types';
import PropertyCard from '@/components/PropertyCard';
import { Filter, Home, MapPin, X } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyListing[]>([]);
  
  const [filters, setFilters] = useState({
    purpose: searchParams.get('purpose') || '',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    budget: searchParams.get('budget') || '',
    project: searchParams.get('project') || '',
    easyBuy: searchParams.get('easyBuy') === 'true'
  });

  const [locations, setLocations] = useState<{name: string, status: string}[]>([]);

  useEffect(() => {
    api.getProperties().then(data => {
      setProperties(data);
    });
    api.getLocations().then(data => {
      setLocations(data.filter(l => l.status === 'Active'));
    });
  }, []);

  useEffect(() => {
    let result = properties;
    if (filters.purpose) {
      result = result.filter(p => p.purpose === filters.purpose);
    }
    if (filters.type) {
      result = result.filter(p => p.type === filters.type);
    }
    if (filters.location) {
      result = result.filter(p => p.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.project) {
      result = result.filter(p => p.project?.toLowerCase() === filters.project.toLowerCase());
    }
    if (filters.easyBuy) {
      result = result.filter(p => p.easyBuyEligible);
    }
    if (filters.budget) {
      result = result.filter(p => {
        const price = p.price;
        if (filters.budget === 'Under 5M') return price < 5000000;
        if (filters.budget === '5M - 20M') return price >= 5000000 && price <= 20000000;
        if (filters.budget === '20M - 50M') return price > 20000000 && price <= 50000000;
        if (filters.budget === 'Above 50M') return price > 50000000;
        return true;
      });
    }
    setFilteredProperties(result);
  }, [filters, properties]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <section className="bg-[var(--color-primary-dark)] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Properties</h1>
          <p className="text-xl text-gray-300 font-light">
            Find your perfect home or investment property from our exclusive listings.
          </p>
        </div>
      </section>

      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-gray-700 border-b border-gray-200 pb-4">
            <Filter className="w-5 h-5 text-[var(--color-primary)]" /> Advanced Filters
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <select name="purpose" value={filters.purpose} onChange={handleFilterChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
              <option value="">Any Purpose</option>
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
            
            <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
              <option value="">Any Type</option>
              <option value="House">House</option>
              <option value="Land">Land</option>
              <option value="Commercial">Commercial</option>
            </select>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <select name="location" value={filters.location} onChange={handleFilterChange} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all appearance-none">
                <option value="">Any Location</option>
                {locations.map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>

            <select name="budget" value={filters.budget} onChange={handleFilterChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
              <option value="">Any Budget</option>
              <option value="Under 5M">Under â‚¦5M</option>
              <option value="5M - 20M">â‚¦5M - â‚¦20M</option>
              <option value="20M - 50M">â‚¦20M - â‚¦50M</option>
              <option value="Above 50M">Above â‚¦50M</option>
            </select>

            <select name="project" value={filters.project} onChange={handleFilterChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all">
              <option value="">Any Project</option>
              <option value="Yarimawa">Yarimawa</option>
              <option value="Janguza">Janguza</option>
              <option value="NHP">NHP</option>
            </select>

            <div className="flex items-center gap-3 px-2 py-3">
              <input type="checkbox" id="easyBuy" name="easyBuy" checked={filters.easyBuy as boolean} onChange={handleFilterChange} className="w-5 h-5 accent-[var(--color-primary)] rounded" />
              <label htmlFor="easyBuy" className="font-bold text-gray-700 cursor-pointer">Easy Buy Eligible Only</label>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Available Listings</h2>
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">{filteredProperties.length} Found</span>
            {(filters.purpose || filters.type || filters.location || filters.budget || filters.project || filters.easyBuy) && (
              <button onClick={() => setFilters({ purpose: '', type: '', location: '', budget: '', project: '', easyBuy: false })} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors">
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Applied Filters Display */}
        {(filters.purpose || filters.type || filters.location || filters.budget || filters.project || filters.easyBuy) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Applied Filters:</span>
            {filters.purpose && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">Purpose: {filters.purpose}</span>}
            {filters.type && <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-1 rounded border border-purple-100">Type: {filters.type}</span>}
            {filters.location && <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded border border-orange-100">Location: {filters.location}</span>}
            {filters.budget && <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-100">Budget: {filters.budget}</span>}
            {filters.project && <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded border border-yellow-100">Project: {filters.project}</span>}
            {filters.easyBuy && <span className="bg-[var(--color-gold)]/20 text-yellow-800 text-xs font-bold px-2 py-1 rounded border border-[var(--color-gold)]/30">Easy Buy Only</span>}
          </div>
        )}

        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-500 mb-2">No properties found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more results.</p>
            <button onClick={() => setFilters({ purpose: '', type: '', location: '', budget: '', project: '', easyBuy: false })} className="mt-6 text-[var(--color-primary)] hover:underline font-medium">Clear Filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
