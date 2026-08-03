'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRole } from '@/components/providers/RoleProvider';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { userName, role, loading } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      // Force a full window reload to clear all React state, Apollo caches, 
      // and RoleProvider state, redirecting to login.
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-full border border-gray-200"></div>
    );
  }

  const initials = userName 
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initials}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
            <p className="text-sm font-semibold text-gray-900 truncate">{userName || 'User'}</p>
            <p className="text-xs text-[var(--color-primary)] font-medium mt-0.5 uppercase tracking-wider">{role || 'No Role'}</p>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                // Can add profile navigation here if needed in the future
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] flex items-center transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              My Profile
            </button>
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
