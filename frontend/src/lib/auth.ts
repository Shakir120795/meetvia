/**
 * JWT localStorage helpers for admin authentication.
 */

const TOKEN_KEY = 'meetvia_admin_token';
const EXPIRES_KEY = 'meetvia_admin_expires';

/**
 * Store JWT token and its expiration time in localStorage.
 */
export function storeToken(token: string, expiresAt: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, expiresAt);
}

/**
 * Retrieve the stored JWT token.
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieve the stored expiration timestamp.
 */
export function getExpiresAt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EXPIRES_KEY);
}

/**
 * Remove token and expiration from localStorage.
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

/**
 * Check if the stored token has expired.
 * Returns true if expired or no expiration is stored.
 */
export function isTokenExpired(): boolean {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;

  const expirationDate = new Date(expiresAt);
  return expirationDate.getTime() <= Date.now();
}
