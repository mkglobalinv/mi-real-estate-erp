"use client";

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Search, User, MapPin, FileText, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{ type: string; id: string; title: string; subtitle: string; icon: any; link: string }[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = async (searchTerm: string) => {
    const q = searchTerm.toLowerCase();
    const searchResults: { type: string; id: string; title: string; subtitle: string; icon: any; link: string }[] = [];

    // Search Customers (Name, Phone, Ref)
    const customers = await api.getCustomers();
    const matchedCustomers = customers.filter(c => 
      c.fullName.toLowerCase().includes(q) || 
      c.phone.includes(q) || 
      c.ref.toLowerCase().includes(q)
    );
    matchedCustomers.forEach(c => searchResults.push({
      type: 'Customer',
      id: c.id,
      title: c.fullName,
      subtitle: `${c.ref} • ${c.phone}`,
      icon: User,
      link: `/admin/operations/customers/${c.id}`
    }));

    // Search Properties (Ref, Title)
    const properties = await api.getProperties();
    const matchedProps = properties.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.ref.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q)
    );
    matchedProps.forEach(p => searchResults.push({
      type: 'Property',
      id: p.id,
      title: p.title,
      subtitle: `${p.ref} • ₦${p.price.toLocaleString()}`,
      icon: MapPin,
      link: `/properties/${p.id}`
    }));

    // Search EasyBuy Accounts (Ref)
    const accounts = await api.getEasyBuyAccounts();
    const matchedAccs = accounts.filter(a => a.ref.toLowerCase().includes(q));
    matchedAccs.forEach(a => searchResults.push({
      type: 'EasyBuy',
      id: a.id,
      title: `Account: ${a.ref}`,
      subtitle: `Balance: ₦${a.outstandingBalance.toLocaleString()}`,
      icon: FileText,
      link: `/admin/operations/easy-buy` // Could be a specific route later
    }));

    // Search Allocations (Block, Plot)
    const allocs = await api.getAllocations();
    const matchedAllocs = allocs.filter(a => 
      a.blockNumber.toLowerCase().includes(q) || 
      a.plotNumber.toLowerCase().includes(q)
    );
    matchedAllocs.forEach(a => searchResults.push({
      type: 'Allocation',
      id: a.id,
      title: `Plot ${a.plotNumber}, Block ${a.blockNumber}`,
      subtitle: `Status: ${a.status}`,
      icon: MapPin,
      link: `/admin/operations/allocations`
    }));

    setResults(searchResults.slice(0, 8)); // Limit to 8 results
    setIsOpen(true);
  };

  const handleResultClick = (link: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(link);
  };

  return (
    <div className="relative z-50 flex-1 max-w-xl" ref={wrapperRef}>
      <div className={`flex items-center bg-gray-100 rounded-full px-4 py-2 w-full border border-transparent transition-all ${isOpen ? 'bg-white border-[var(--color-primary)] ring-4 ring-green-50' : 'focus-within:border-[var(--color-primary)] focus-within:bg-white'}`}>
        <Search className={`w-4 h-4 mr-2 ${isOpen ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 2) setIsOpen(true);
          }}
          onFocus={() => { if (query.length > 2) setIsOpen(true) }}
          placeholder="Global Search: Name, Phone, Plot, ID..." 
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto p-2">
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}-${idx}`}
                  onClick={() => handleResultClick(result.link)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-xl transition-colors text-left group"
                >
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:text-[var(--color-primary)] text-gray-400 transition-colors">
                    <result.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{result.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] uppercase font-bold text-[var(--color-primary)] bg-green-50 px-1.5 py-0.5 rounded">{result.type}</span>
                      <span className="text-xs text-gray-500 truncate">{result.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--color-primary)]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching by phone number or reference ID.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
