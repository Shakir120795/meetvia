import type { Metadata } from 'next';
import { ITestimonial } from '@/types';
import TestimonialsGrid from './TestimonialsGrid';

export const metadata: Metadata = {
  title: 'Testimonials | Meetvia',
  description:
    'Read stories and reviews from visitors who experienced Meetvia professional public companionship and city assistance services.',
  openGraph: {
    title: 'Testimonials | Meetvia',
    description:
      'Read stories and reviews from visitors who experienced Meetvia services.',
    type: 'website',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Meetvia Testimonials' }],
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

export default async function TestimonialsPage() {
  const testimonials = await fetchData<ITestimonial[]>(
    '/api/v1/public/testimonials'
  );

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Visitor Stories
          </h1>
          <p className="text-primary/70 text-lg max-w-3xl mx-auto">
            Hear from people who experienced our services firsthand.
          </p>
        </div>

        {/* Testimonials Grid or Empty State */}
        {testimonials && testimonials.length > 0 ? (
          <TestimonialsGrid testimonials={testimonials} />
        ) : (
          <div className="glass p-8 text-center rounded-2xl">
            <p className="text-primary/70 text-lg">
              No visitor stories are available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
