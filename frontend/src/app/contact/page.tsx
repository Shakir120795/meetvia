import { Metadata } from 'next';
import { ISiteSettings, IService } from '@/types';
import ContactForm from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us | Meetvia',
  description: 'Get in touch with Meetvia for city assistance and companionship services. Send us a message or reach out on WhatsApp.',
  openGraph: {
    title: 'Contact Us | Meetvia',
    description: 'Get in touch with Meetvia for city assistance and companionship services.',
    images: [{ url: 'https://meetvia.com/og-image.png', width: 1200, height: 630, alt: 'Contact Meetvia' }],
  },
};

async function getSiteSettings(): Promise<ISiteSettings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/public/site-settings`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

async function getServices(): Promise<IService[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/public/services`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const [siteSettings, services] = await Promise.all([
    getSiteSettings(),
    getServices(),
  ]);

  const defaultSettings: ISiteSettings = {
    _id: '',
    siteName: 'Meetvia',
    metaTitle: 'Meetvia',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    whatsappMessage: '',
    safetyCheckboxText: '',
    createdAt: '',
    updatedAt: '',
  };

  const settings = siteSettings || defaultSettings;

  const whatsappLink = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}${settings.whatsappMessage ? `?text=${encodeURIComponent(settings.whatsappMessage)}` : ''}`
    : '#';

  return (
    <section className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Get in Touch
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Have a question or want to book a service? Reach out to us through the form below or connect directly via WhatsApp.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Side - Contact Info */}
          <div className="space-y-6">
            {/* Contact Details Card */}
            <div className="glass p-6 md:p-8 space-y-6">
              <h2 className="text-xl font-bold text-foreground">Contact Information</h2>
              <p className="text-foreground/60 text-sm">
                We&apos;re here to help. Reach out to us through any of the channels below.
              </p>

              <div className="space-y-4">
                {settings.contactEmail && (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Email</p>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="text-foreground hover:text-accent transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {settings.contactPhone && (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground/60">Phone</p>
                      <a
                        href={`tel:${settings.contactPhone}`}
                        className="text-foreground hover:text-accent transition-colors"
                      >
                        {settings.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground/60">Location</p>
                    <p className="text-foreground">Agra, Uttar Pradesh, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Quick Assistance Box */}
            <div className="glass p-6 md:p-8 border border-green-500/20 bg-green-500/5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    Quick Assistance via WhatsApp
                  </h3>
                  <p className="text-sm text-foreground/60">
                    Get instant help by messaging us directly on WhatsApp. We typically respond within minutes during business hours.
                  </p>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-theme transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <ContactForm siteSettings={settings} services={services} />
          </div>
        </div>
      </div>
    </section>
  );
}
