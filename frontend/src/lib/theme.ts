import { IThemeSettings } from '@/types';

/**
 * Default Futuristic Blue theme values — used as fallback when
 * the theme API is unavailable or returns an error.
 */
export const DEFAULT_THEME: Omit<IThemeSettings, '_id' | 'createdAt' | 'updatedAt'> = {
  activePreset: 'futuristic-blue',
  primaryColor: '#FFFFFF',
  secondaryColor: '#0A1628',
  accentColor: '#00D4FF',
  backgroundColor: '#0A1628',
  textColor: '#FFFFFF',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 12,
  glassmorphismIntensity: 50,
};

/**
 * Apply theme values as CSS custom properties on the document root element.
 */
export function applyTheme(theme: Pick<IThemeSettings, 'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' | 'textColor' | 'fontFamily' | 'borderRadius' | 'glassmorphismIntensity'>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--font-family', theme.fontFamily);
  root.style.setProperty('--border-radius', `${theme.borderRadius}px`);
  root.style.setProperty('--glass-intensity', `${theme.glassmorphismIntensity}`);
}
