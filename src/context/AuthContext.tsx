'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🔁 Restore session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) mapUser(sessionUser);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) mapUser(session.user);
        else setUser(null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const mapUser = (user: SupabaseUser) => {
    setUser({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || '',
      role: user.app_metadata?.role || 'user',
    });
  };

  // 🔐 LOGIN
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw error;
    router.push('/');
  };

  // 🆕 SIGNUP (THIS WAS MISSING LOGIC)
  const signup = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);
  
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:9002/login',
        data: {
          full_name: name,
          role: role,
        }
      },
    });
  
    setIsLoading(false);
  
    if (error) {
      throw error;
    }
  
    // 🚨 Email confirmation required
    if (!data.session) {
      alert('Account created! Please check your email to confirm your account.');
      router.push('/login');
      return;
    }
  
    // ✅ Auto-login (if email confirmation is disabled)
    router.push('/');
  };
  
  // 🚪 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
