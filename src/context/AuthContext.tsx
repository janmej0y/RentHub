'use client';

import type { User } from '@/types/user';
import { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const mockUser: User = {
  id: 'user-1',
  name: 'Sam Owner',
  email: 'sam.owner@example.com',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status on mount
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setUser(mockUser);
    }
    setIsLoading(false);
  }, []);


  const login = () => {
    // In a real app, this would involve token exchange and fetching user data
    localStorage.setItem('isAuthenticated', 'true');
    setUser(mockUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    router.push('/login');
  };
  
  const isAuthenticated = !!user;

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
  }), [user, isAuthenticated, isLoading]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
