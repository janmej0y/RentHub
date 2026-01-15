'use client';

import type { User, UserRole } from '@/types/user';
import { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  login: (role?: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const adminUser: User = {
  id: 'user-1',
  name: 'Sam Owner',
  email: 'sam.owner@example.com',
  role: 'admin',
};

const regularUser: User = {
  id: 'user-2',
  name: 'Alex Renter',
  email: 'alex.renter@example.com',
  role: 'user',
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status on mount
    const authStatus = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole') as UserRole;

    if (authStatus === 'true') {
      if (userRole === 'admin') {
        setUser(adminUser);
      } else {
        setUser(regularUser);
      }
    }
    setIsLoading(false);
  }, []);


  const login = (role: UserRole = 'admin') => {
    // In a real app, role would come from your backend
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    setUser(role === 'admin' ? adminUser : regularUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setUser(null);
    router.push('/login');
  };
  
  const isAuthenticated = !!user;

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  }

  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasRole,
  }), [user, isAuthenticated, isLoading]);


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
