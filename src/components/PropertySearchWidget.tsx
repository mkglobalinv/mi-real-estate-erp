"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, Wallet, CreditCard, Loader2, Building } from 'lucide-react';
import { api } from '@/lib/api';
import { Location } from '@/lib/types';

type SearchTab = 'Buy Land' | 'Buy House' | 'Rent Property' | 'Easy Buy' | 'Sell Property';

export default function PropertySearchWidget() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>('Buy House');
  const [filters, setFilters] = useState({
    project: '',
    location: '',
    type: '',
    budget: '',
    payment: 'Full Payment',
    deposit: '',
    monthly: ''
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    api.getLocations().then(setLocations);
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);
    
    if (activeTab === 'Sell Property') {
      router.push('/list-property');
      setIsSearching(false);
      return;
    }

    // Build query params
    const params = new URLSearchParams();
    if (activeTab === 'Buy Land') params.append('type', 'Land');
    if (activeTab === 'Buy House') params.append('type', 'House');
    if (activeTab === 'Rent Property') params.append('purpose', 'Rent');
    if (activeTab === 'Easy Buy') params.append('easyBuy', 'true');
    
    if (filters.project) {
      params.append('project', filters.project);
      await api.trackSearch(filters.project, 'search');
    }
    if (filters.location) {
      params.append('location', filters.location);
      await api.trackSearch(filters.location, 'search');
    }
    if (filters.type && activeTab !== 'Buy Land' && activeTab !== 'Buy House') {
      params.append('type', filters.type);
      await api.trackSearch(filters.type, 'search');
    }
    if (filters.budget) {
      params.append('budget', filters.budget);
      await api.trackSearch(filters.budget, 'search');
    }
    
    if (filters.payment === 'Easy Buy' || activeTab === 'Easy Buy') {
      params.append('easyBuy', 'true');
      if (filters.deposit) params.append('deposit', filters.deposit);
      if (filters.monthly) params.append('monthly', filters.monthly);
      await api.trackSearch('Easy Buy Filter', 'search');
    }

    router.push(`/properties?${params.toString()}`);
    setIsSearching(false);
  };

  const tabs: SearchTab[] = ['Buy Land', 'Buy House', 'Rent Property', 'Easy Buy', 'Sell Property'];
  const showEasyBuyOptions = activeTab === 'Easy Buy' || filters.payment === 'Easy Buy';

  return (
    <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden max-w-6xl mx-auto -mt-24 relative z-20 border border-gray-100">
      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto hide-scrollbar bg-gray-50 border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Easy Buy') setFilters({ ...filters, payment: 'Easy Buy' });
              else if (filters.payment === 'Easy Buy') setFilters({ ...filters, payment: 'Full Payment' });
            }}
            className={`px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-bold whitespace-nowrap transition-colors flex-1 ${
              activeTab === tab 
                ? 'bg-white text-[var(--color-primary)] border-t-4 border-t-[var(--color-gold)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-t-4 border-t-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Area */}
      <div className="p-4 md:p-6 lg:p-8">
        {activeTab === 'Sell Property' ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Want to sell your property?</h3>
              <p className="text-gray-600">Partner with M.I. Real Estate. List your property on our premium marketplace and reach thousands of verified buyers.</p>
            </div>
            <button onClick={handleSearch} disabled={isSearching} className="btn-primary bg-green-600 hover:bg-green-700 text-white px-10 py-4 whitespace-nowrap flex items-center gap-2 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all">
              {isSearching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Building className="w-6 h-6" />}
              {isSearching ? 'Processing...' : 'List Your Property'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 items-end">
            {/* Project */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building className="w-3 h-3" /> Project
              </label>
              <select 
                value={filters.project} 
                onChange={e => setFilters({...filters, project: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
              >
                <option value="">Any Project</option>
                <option value="Yarimawa">Yarimawa Easy Buy</option>
                <option value="Janguza">Janguza Langel</option>
                <option value="NHP">National Housing</option>
              </select>
            </div>

            {/* Location */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> State / Location
              </label>
              <select 
                value={filters.location} 
                onChange={e => setFilters({...filters, location: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
              >
                <option value="">Any Location</option>
                {locations.filter(l => l.status === 'Active').map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Property Type (Hide if explicitly buying Land/House) */}
            {activeTab !== 'Buy Land' && activeTab !== 'Buy House' ? (
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Home className="w-3 h-3" /> Property Type
                </label>
                <select 
                  value={filters.type} 
                  onChange={e => setFilters({...filters, type: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
                >
                  <option value="">All Types</option>
                  <option value="House">House</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            ) : (
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Budget Range
                </label>
                <select 
                  value={filters.budget} 
                  onChange={e => setFilters({...filters, budget: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
                >
                  <option value="">Any Budget</option>
                  <option value="Under 5M">Under â‚¦5M</option>
                  <option value="5M - 20M">â‚¦5M - â‚¦20M</option>
                  <option value="20M - 50M">â‚¦20M - â‚¦50M</option>
                  <option value="Above 50M">Above â‚¦50M</option>
                </select>
              </div>
            )}

            {/* Payment Type */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Payment Type
              </label>
              <select 
                value={activeTab === 'Easy Buy' ? 'Easy Buy' : filters.payment} 
                onChange={e => setFilters({...filters, payment: e.target.value})}
                disabled={activeTab === 'Easy Buy'}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base disabled:opacity-50"
              >
                <option value="Full Payment">Full Payment</option>
                <option value="Easy Buy">Easy Buy Scheme</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <button onClick={handleSearch} disabled={isSearching} className="w-full py-3 md:py-3.5 px-4 bg-green-600 hover:bg-green-700 text-white text-base md:text-lg font-bold rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg hover:shadow-xl h-[46px] md:h-[52px]">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isSearching ? 'Searching...' : 'FIND PROPERTY'}
              </button>
            </div>

            {/* Conditional Easy Buy Fields */}
            {showEasyBuyOptions && (
              <>
                <div className="lg:col-span-2 mt-4 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Deposit Range
                  </label>
                  <select 
                    value={filters.deposit} 
                    onChange={e => setFilters({...filters, deposit: e.target.value})}
                    className="w-full bg-green-50/50 border border-green-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
                  >
                    <option value="">Any Deposit</option>
                    <option value="Under 500k">Under â‚¦500,000</option>
                    <option value="500k - 1M">â‚¦500,000 - â‚¦1M</option>
                    <option value="1M - 5M">â‚¦1M - â‚¦5M</option>
                  </select>
                </div>
                <div className="lg:col-span-2 mt-4 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Monthly Budget
                  </label>
                  <select 
                    value={filters.monthly} 
                    onChange={e => setFilters({...filters, monthly: e.target.value})}
                    className="w-full bg-green-50/50 border border-green-200 text-gray-800 rounded-xl px-3 py-2.5 md:px-4 md:py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none font-medium text-sm md:text-base"
                  >
                    <option value="">Any Amount</option>
                    <option value="Under 100k">Under â‚¦100k / month</option>
                    <option value="100k - 500k">â‚¦100k - â‚¦500k / month</option>
                    <option value="500k+">â‚¦500k+ / month</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
