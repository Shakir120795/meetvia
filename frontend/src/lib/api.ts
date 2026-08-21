'use client';

import { getToken } from './auth';
import { getCustomerSession } from './customerAuth';

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message); this.name = 'ApiError'; this.status = status; this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as { error?: { message?: string } })?.error?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }
  return data as T;
}

export async function publicGet<T>(path: string): Promise<T> {
  return handleResponse<T>(await fetch(path, { method: 'GET', headers: { 'Content-Type': 'application/json' } }));
}
export async function publicPost<T>(path: string, body: unknown): Promise<T> {
  return handleResponse<T>(await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}

function getAuthHeaders(): HeadersInit {
  const token = getToken(); const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`; return headers;
}
export async function adminGet<T>(path: string): Promise<T> { return handleResponse<T>(await fetch(path, { headers: getAuthHeaders() })); }
export async function adminPost<T>(path: string, body: unknown): Promise<T> { return handleResponse<T>(await fetch(path, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(body) })); }
export async function adminPut<T>(path: string, body: unknown): Promise<T> { return handleResponse<T>(await fetch(path, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body) })); }
export async function adminPatch<T>(path: string, body: unknown): Promise<T> { return handleResponse<T>(await fetch(path, { method: 'PATCH', headers: getAuthHeaders(), body: JSON.stringify(body) })); }
export async function adminDelete<T>(path: string): Promise<T> { return handleResponse<T>(await fetch(path, { method: 'DELETE', headers: getAuthHeaders() })); }

function getCustomerHeaders(): HeadersInit {
  const session = getCustomerSession(); const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (session) headers['Authorization'] = `Bearer ${session.token}`; return headers;
}
export async function customerGet<T>(path: string): Promise<T> { return handleResponse<T>(await fetch(path, { headers: getCustomerHeaders() })); }
export async function customerPost<T>(path: string, body?: unknown): Promise<T> {
  return handleResponse<T>(await fetch(path, { method: 'POST', headers: getCustomerHeaders(), body: body === undefined ? undefined : JSON.stringify(body) }));
}

export { ApiError };
