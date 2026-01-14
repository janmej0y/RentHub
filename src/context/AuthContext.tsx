'use client';

import type { User } from '@/types/user';
import { createContext, useState, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean | undefined;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const mockUser: User = {
  id: 'user-1',
  name: 'Sam Owner',
  email: 'sam.owner@example.com',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const router = useRouter();

  const login = () => {
    // In a real app, this would involve token exchange and fetching user data
    setUser(mockUser);
    setIsAuthenticated(true);
    router.push('/');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };
  
  // This memoizes the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
  }), [user, isAuthenticated]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
