"use client";

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className }: { className?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${className || 'text-red-400 hover:text-red-300'}`}
      title="Sign Out"
    >
      <LogOut className="w-4 h-4" />
      {isLoggingOut ? 'Logging out...' : 'Sign Out'}
    </button>
  );
}
