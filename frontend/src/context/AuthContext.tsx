'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { storeToken, getToken, clearToken, isTokenExpired } from '@/lib/auth';
import { publicPost } from '@/lib/api';

export interface AuthUser {
  email: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    expiresAt: string;
    user: { email: string; name: string };
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token on mount and set user state
  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired()) {
      // Token exists and is valid — user is authenticated
      // We don't have user info stored separately, so we just mark as authenticated
      setUser({ email: '' });
    } else if (token && isTokenExpired()) {
      // Token expired — clear it and redirect
      clearToken();
      setUser(null);
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/dashboard')) {
        window.location.href = '/admin/login';
      }
    }
    setIsLoading(false);
  }, []);

  // Periodic expiry check
  useEffect(() => {
    const interval = setInterval(() => {
      if (getToken() && isTokenExpired()) {
        clearToken();
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/dashboard')) {
          window.location.href = '/admin/login';
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await publicPost<LoginResponse>(
      '/api/v1/admin/auth/login',
      { email, password }
    );

    storeToken(response.data.token, response.data.expiresAt);
    setUser({ email });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
