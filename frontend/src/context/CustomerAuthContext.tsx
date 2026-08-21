'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { customerGet, customerPost } from '@/lib/api';
import { clearCustomerSession, getCustomerSession, storeCustomerSession } from '@/lib/customerAuth';

export type CustomerUser = {
  id: string;
  email?: string | null;
  mobile?: string | null;
  status: string;
  profile?: { displayName?: string | null; avatarUrl?: string | null } | null;
};

type AuthContextValue = {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getCustomerSession()) { setUser(null); return; }
    try {
      const response = await customerGet<{ success: boolean; data: CustomerUser }>('/api/v1/public/me');
      setUser(response.data);
    } catch {
      clearCustomerSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    try { await customerPost('/api/v1/public/auth/logout'); } finally {
      clearCustomerSession(); setUser(null);
    }
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, refresh, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return context;
}

export function saveCustomerSession(token: string, expiresAt: string) {
  storeCustomerSession(token, expiresAt);
}
