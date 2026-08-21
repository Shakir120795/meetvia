export interface ContactPayload {
  fullName: string;
  email: string;
  mobile?: string;
  serviceType: string;
  preferredDate?: string | null;
  message: string;
  safetyConfirmed: true;
}

export async function submitContact(payload: ContactPayload) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const response = await fetch(`${baseUrl}/api/v1/public/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.success) {
    throw new Error(json?.error?.message || 'Unable to submit your inquiry. Please try again.');
  }

  return json.data;
}
