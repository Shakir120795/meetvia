import type { Metadata } from 'next';
import { IService } from '@/types';
import ServicesGrid from './ServicesGrid';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Our Services | Meetvia',
  description:
    'Professional public companionship services designed for safe, structured experiences. Browse city exploration, virtual tours, and more.',
  openGraph: {
    title: 'Our Services | Meetvia',
    description:
      'Professional public companionship services designed for safe, structured experiences.',
    type: 'website',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Meetvia Services' }],
  },
};

async function getServices(): Promise<IService[]> {
  try {
    const res = await fetch('http://localhost:5000/api/v1/public/services', {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch {
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Our Services
          </h1>
          <p className="text-primary/70 text-lg max-w-3xl mx-auto">
            Professional public companionship services designed for safe,
            structured experiences.
          </p>
        </div>

        {/* Services Grid */}
        <ServicesGrid services={services} />

        {/* Bottom CTA */}
        <section className="mt-20 text-center">
          <div className="glass p-10 sm:p-14 rounded-2xl max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Ready to Book Your Experience?
            </h2>
            <p className="text-primary/70 mb-8 max-w-xl mx-auto">
              Get in touch with us to schedule your personalized city assistance
              or companionship service.
            </p>
            <Button href="/contact" variant="primary" size="lg">
              Contact Us Now
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
