import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import HowItWorks from '@/components/home/HowItWorks';
import SafetySection from '@/components/home/SafetySection';
import ServicesPreview from '@/components/home/ServicesPreview';
import BecomeCompanion from '@/components/home/BecomeCompanion';
import CitiesSection from '@/components/home/CitiesSection';
import FAQPreview from '@/components/home/FAQPreview';
import TestimonialsPreview from '@/components/home/TestimonialsPreview';
import ContactSection from '@/components/home/ContactSection';
import AboutSection from '@/components/home/AboutSection';
import { IHeroSlide, IHowItWorksStep, IService, ICity, IFAQ, ITestimonial, ISiteSettings } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
interface ApiSuccessResponse<T> { success: boolean; data: T; }
interface IAboutPage { title: string; content: string; }
async function fetchData<T>(path: string): Promise<T | null> {
  try { const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' }); if (!res.ok) return null; const json: ApiSuccessResponse<T> = await res.json(); return json.success ? json.data : null; }
  catch { return null; }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings = await fetchData<ISiteSettings>('/api/v1/public/site-settings');
  return {
    title: siteSettings?.metaTitle || 'MeetVia — Find someone to go with.',
    description: siteSettings?.metaDescription || 'Find trusted local companions for travel, city exploration and experiences.',
  };
}

export default async function Home() {
  const [slides, steps, services, cities, faqs, testimonials, siteSettings, aboutPage] = await Promise.all([
    fetchData<IHeroSlide[]>('/api/v1/public/hero-slides'),
    fetchData<IHowItWorksStep[]>('/api/v1/public/how-it-works'),
    fetchData<IService[]>('/api/v1/public/services/featured'),
    fetchData<ICity[]>('/api/v1/public/cities'),
    fetchData<IFAQ[]>('/api/v1/public/faq/preview'),
    fetchData<ITestimonial[]>('/api/v1/public/testimonials/preview'),
    fetchData<ISiteSettings>('/api/v1/public/site-settings'),
    fetchData<IAboutPage>('/api/v1/public/pages/about'),
  ]);
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Organization', name: 'MeetVia', description: 'Travel companions and local experiences.' };
  return (
    <main className="flex flex-col min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection slides={slides || []} />
      <HowItWorks steps={steps || []} /><SafetySection /><ServicesPreview services={services || []} />
      <BecomeCompanion /><AboutSection title={aboutPage?.title} content={aboutPage?.content} />
      <CitiesSection cities={cities || []} /><FAQPreview faqs={faqs || []} />
      <TestimonialsPreview testimonials={testimonials || []} />
      <ContactSection siteSettings={siteSettings || { _id: '', siteName: 'MeetVia', metaTitle: 'MeetVia', createdAt: '', updatedAt: '' }} />
    </main>
  );
}
