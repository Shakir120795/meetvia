import { Metadata } from 'next';
import { ShieldCheck, BadgeCheck, Clock } from 'lucide-react';
import CompanionForm from '@/components/forms/CompanionForm';
import { ICity } from '@/types';

// ============================================================
// Page Metadata
// ============================================================

export const metadata: Metadata = {
  title: 'Become a Verified Companion | Meetvia',
  description:
    'Join Meetvia as a professional local companion and help visitors explore India. Apply now to become a verified companion.',
  openGraph: {
    title: 'Become a Verified Companion | Meetvia',
    description:
      'Join Meetvia as a professional local companion and help visitors explore India.',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Become a Meetvia Companion' }],
  },
};

// ============================================================
// Data Fetching
// ============================================================

async function getActiveCities(): Promise<ICity[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${baseUrl}/api/v1/public/cities`, {
      cache: 'no-store',
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

// ============================================================
// Benefit Cards Data
// ============================================================

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Safe & Professional',
    description:
      'All meetings happen in public places only. We maintain strict safety protocols and professional standards.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Platform',
    description:
      'Join a trusted platform where all companions go through identity verification and background screening.',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description:
      'Choose your own schedule. Work on your terms with structured 3–4 hour sessions that fit your lifestyle.',
  },
];

// ============================================================
// Requirements Data
// ============================================================

const requirements = [
  'Must be 21 years of age or older',
  'Must possess a valid government-issued ID',
  'Excellent communication and interpersonal skills',
  'Commitment to professional conduct at all times',
  'Willingness to pass background screening and verification',
];

// ============================================================
// Page Component
// ============================================================

export default async function BecomeCompanionPage() {
  const cities = await getActiveCities();

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Become a Verified Companion
          </h1>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            Join Meetvia as a professional local companion and help visitors
            explore India.
          </p>
        </div>

        {/* Why Join Meetvia Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-8 text-center">
            Why Join Meetvia?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="p-6 bg-white/5 border border-white/10 rounded-theme text-center"
                >
                  <Icon
                    className="w-12 h-12 text-accent mx-auto mb-4"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-primary/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
            Requirements
          </h2>
          <ul className="space-y-3 max-w-xl mx-auto">
            {requirements.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" aria-hidden="true" />
                <span className="text-primary/80">{req}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Application Form Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-8 text-center">
            Apply Now
          </h2>
          <div className="max-w-lg mx-auto">
            <CompanionForm cities={cities} />
          </div>
        </section>
      </div>
    </main>
  );
}
