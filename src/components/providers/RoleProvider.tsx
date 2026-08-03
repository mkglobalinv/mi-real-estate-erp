"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface RoleContextProps {
  role: string | null;
  userName: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const RoleContext = createContext<RoleContextProps>({
  role: null,
  userName: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useRole = () => useContext(RoleContext);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setRole(data.role);
          setUserName(data.full_name);
        } else {
          setRole(null);
          setUserName(null);
        }
      } else {
        setRole(null);
        setUserName(null);
      }
    } catch (error) {
      console.error('Error fetching role profile:', error);
      setRole(null);
      setUserName(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
    
    // Set up auth state listener to refresh profile on login/logout
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        refreshProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  return (
    <RoleContext.Provider value={{ role, userName, loading, refreshProfile }}>
      {children}
    </RoleContext.Provider>
  );
}
