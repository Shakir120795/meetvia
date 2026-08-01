'use client';

import React, { createContext, useEffect, useState } from 'react';
import { IThemeSettings } from '@/types';
import { publicGet } from '@/lib/api';
import { applyTheme, DEFAULT_THEME } from '@/lib/theme';

export interface ThemeContextValue {
  theme: IThemeSettings | null;
  isLoading: boolean;
  error: string | null;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeApiResponse {
  success: boolean;
  data: IThemeSettings;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<IThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const response = await publicGet<ThemeApiResponse>('/api/v1/public/theme');
        if (response.success && response.data) {
          setTheme(response.data);
          applyTheme(response.data);
        } else {
          // Apply default theme if response has no data
          applyTheme(DEFAULT_THEME);
        }
      } catch {
        // Requirement 3.6: If theme API is unavailable, apply default Futuristic Blue
        setError('Failed to load theme settings');
        applyTheme(DEFAULT_THEME);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTheme();
  }, []);

  const value: ThemeContextValue = {
    theme,
    isLoading,
    error,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
