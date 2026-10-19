'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { UserProfile } from './types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  isCloudConnected: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
}

const LOCAL_KEY_AUTH_USER = 'aqua_auth_user_v2';

const DEMO_USER: UserProfile = {
  id: 'demo-farmer-central-asia',
  email: 'farmer@aquaai.kz',
  fullName: 'Нурлан Сериков (КХ «Береке»)',
  phone: '+7 (701) 555-01-23',
  role: 'demo',
  preferredLanguage: 'ru',
  createdAt: '2026-01-15T08:00:00Z',
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_USER,
  isAuthenticated: true,
  isDemo: true,
  isCloudConnected: false,
  isLoading: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  enterDemoMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const cloudConnected = isSupabaseConfigured();

  // Restore user session
  useEffect(() => {
    async function restore() {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      if (supabase && cloudConnected) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email || 'user@aquaai.kz',
              fullName: profile?.full_name || session.user.user_metadata?.full_name || 'Фермер',
              phone: profile?.phone,
              role: profile?.role || 'farmer',
              preferredLanguage: profile?.preferred_language || 'ru',
              createdAt: session.user.created_at,
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session restore error:', e);
        }
      }

      // Local storage restore
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(LOCAL_KEY_AUTH_USER);
          if (raw) {
            setUser(JSON.parse(raw));
            setIsLoading(false);
            return;
          }
        } catch {
          // ignore
        }
      }

      // Default: demo mode
      setUser(DEMO_USER);
      setIsLoading(false);
    }

    restore();
  }, [cloudConnected]);

  const signIn = useCallback(async (email: string, pass: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (supabase && cloudConnected) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          role: 'farmer',
          preferredLanguage: 'ru',
          createdAt: data.user.created_at,
        };
        setUser(u);
        localStorage.setItem(LOCAL_KEY_AUTH_USER, JSON.stringify(u));
        setIsLoading(false);
        return {};
      }
    }

    // Local simulated auth
    const u: UserProfile = {
      id: `local-user-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
      email,
      fullName: email.split('@')[0],
      role: 'farmer',
      preferredLanguage: 'ru',
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    localStorage.setItem(LOCAL_KEY_AUTH_USER, JSON.stringify(u));
    setIsLoading(false);
    return {};
  }, [cloudConnected]);

  const signUp = useCallback(async (email: string, pass: string, fullName: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    if (supabase && cloudConnected) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          role: 'farmer',
          preferredLanguage: 'ru',
          createdAt: data.user.created_at,
        };
        setUser(u);
        localStorage.setItem(LOCAL_KEY_AUTH_USER, JSON.stringify(u));
        setIsLoading(false);
        return {};
      }
    }

    // Local simulated auth
    const u: UserProfile = {
      id: `local-user-${Date.now().toString(36)}`,
      email,
      fullName,
      role: 'farmer',
      preferredLanguage: 'ru',
      createdAt: new Date().toISOString(),
    };
    setUser(u);
    localStorage.setItem(LOCAL_KEY_AUTH_USER, JSON.stringify(u));
    setIsLoading(false);
    return {};
  }, [cloudConnected]);

  const signOut = useCallback(async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase && cloudConnected) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_KEY_AUTH_USER);
    setUser(DEMO_USER);
  }, [cloudConnected]);

  const enterDemoMode = useCallback(() => {
    localStorage.removeItem(LOCAL_KEY_AUTH_USER);
    setUser(DEMO_USER);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isDemo: user?.role === 'demo' || user?.id === DEMO_USER.id,
        isCloudConnected: cloudConnected,
        isLoading,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
