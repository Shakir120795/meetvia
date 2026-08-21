const TOKEN_KEY = 'gowith_customer_session';
const EXPIRY_KEY = 'gowith_customer_session_expiry';

export function storeCustomerSession(token: string, expiresAt: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRY_KEY, expiresAt);
}

export function getCustomerSession() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRY_KEY);
  if (!token || !expiresAt) return null;
  if (new Date(expiresAt).getTime() <= Date.now()) {
    clearCustomerSession();
    return null;
  }
  return { token, expiresAt };
}

export function clearCustomerSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}
