import type { Metadata } from 'next';
import { ILegalPage } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SLUG = 'privacy-policy';

export const metadata: Metadata = {
  title: 'Privacy Policy | Meetvia',
  description:
    'Learn how Meetvia collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy | Meetvia',
    description:
      'Learn how Meetvia collects, uses, and protects your personal information.',
    type: 'website',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Meetvia Privacy Policy' }],
  },
};

async function getPage(): Promise<ILegalPage | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/pages/${SLUG}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const page = await getPage();

  if (!page) {
    return (
      <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-8 rounded-2xl text-center">
            <p className="text-primary/70 text-lg">
              This page is temporarily unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass p-8 sm:p-12 rounded-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-8">
            {page.title}
          </h1>
          <div
            className="prose prose-lg max-w-none text-primary/80 prose-headings:text-primary prose-a:text-accent prose-strong:text-primary"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  );
}
