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
  avatarUrl?: string;
  avatarPath?: string;
  phone?: string;
  city?: string;
  bio?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AppUser, 'name' | 'avatarUrl' | 'avatarPath' | 'phone' | 'city' | 'bio'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const MOCK_AUTH_STORAGE_KEY = 'renthub-mock-auth-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        setUser(parsedUser);
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) mapUser(sessionUser);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) mapUser(session.user);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const mapUser = (supabaseUser: SupabaseUser) => {
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || '',
      role: supabaseUser.app_metadata?.role || 'user',
      avatarUrl: supabaseUser.user_metadata?.avatar_url || '',
      avatarPath: supabaseUser.user_metadata?.avatar_path || '',
      phone: supabaseUser.user_metadata?.phone || '',
      city: supabaseUser.user_metadata?.city || '',
      bio: supabaseUser.user_metadata?.bio || '',
    });
  };

  // Mock login for local/demo use.
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    if (!password) {
      setIsLoading(false);
      throw new Error('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const role: AppUser['role'] = normalizedEmail.includes('admin') ? 'admin' : 'user';

    const mockUser: AppUser = {
      id: role === 'admin' ? 'mock-admin-1' : 'mock-user-1',
      email: normalizedEmail,
      name: role === 'admin' ? 'Demo Admin' : 'Demo User',
      role,
      phone: '',
      city: '',
      bio: '',
      avatarUrl: '',
      avatarPath: '',
    };

    setUser(mockUser);
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setIsLoading(false);
    router.push('/');
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'user' | 'admin' = 'user') => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:9002/login',
        data: {
          full_name: name,
          role,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      throw error;
    }

    if (!data.session) {
      alert('Account created! Please check your email to confirm your account.');
      router.push('/login');
      return;
    }

    router.push('/');
  };

  const logout = async () => {
    localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (
    updates: Partial<Pick<AppUser, 'name' | 'avatarUrl' | 'avatarPath' | 'phone' | 'city' | 'bio'>>
  ) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const nextUser: AppUser = { ...user, ...updates };
    setUser(nextUser);

    const hasMockSession =
      user.id.startsWith('mock-') || Boolean(localStorage.getItem(MOCK_AUTH_STORAGE_KEY));
    if (hasMockSession) {
      localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: nextUser.name,
        avatar_url: nextUser.avatarUrl || '',
        avatar_path: nextUser.avatarPath || '',
        phone: nextUser.phone || '',
        city: nextUser.city || '',
        bio: nextUser.bio || '',
      },
    });

    if (error) {
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginWithGoogle,
      signup,
      logout,
      updateProfile,
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
