import type { Metadata } from 'next';
import { IFAQ } from '@/types';
import FAQContent from './FAQContent';

export const metadata: Metadata = {
  title: 'FAQ | Meetvia',
  description:
    'Frequently asked questions about Meetvia professional public companionship and visitor assistance services.',
  openGraph: {
    title: 'FAQ | Meetvia',
    description:
      'Frequently asked questions about Meetvia professional public companionship and visitor assistance services.',
    type: 'website',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Meetvia FAQ' }],
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
}

async function fetchData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json: ApiSuccessResponse<T> = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export default async function FAQPage() {
  const faqs = await fetchData<IFAQ[]>('/api/v1/public/faq');

  const sortedFaqs = faqs
    ? [...faqs].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">
            Find answers to common questions about our services.
          </p>
        </div>

        {/* FAQ Accordion */}
        {sortedFaqs.length > 0 ? (
          <FAQContent faqs={sortedFaqs} />
        ) : (
          <div className="glass p-8 text-center rounded-2xl">
            <p className="text-primary/70 text-lg">
              No FAQs are available at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
