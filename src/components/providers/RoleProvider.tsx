"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const currentUserIdRef = useRef<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      currentUserIdRef.current = user?.id ?? null;
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
      if (event === 'SIGNED_OUT') {
        refreshProfile();
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Supabase can re-emit SIGNED_IN when the tab regains focus and
        // silently refreshes the session in the background - e.g. right
        // after a native file/photo picker closes - which is not a real
        // sign-in. Refetching the profile on every one of those drops
        // `loading` back to true, which unmounts the whole dashboard
        // behind a full-screen spinner mid-interaction. Only refetch if
        // the signed-in user actually changed.
        if (session?.user?.id !== currentUserIdRef.current) {
          refreshProfile();
        }
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
