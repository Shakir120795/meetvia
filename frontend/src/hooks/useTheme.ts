'use client';

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '@/context/ThemeContext';

/**
 * Hook to access theme state.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
