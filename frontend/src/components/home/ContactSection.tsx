'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import Button from '@/components/ui/Button';
import { ISiteSettings, IService } from '@/types';

interface ContactSectionProps {
  siteSettings: ISiteSettings;
  services: IService[];
}

export default function ContactSection({ siteSettings, services }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const whatsappLink = siteSettings.whatsappNumber
    ? `https://wa.me/${siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}${siteSettings.whatsappMessage ? `?text=${encodeURIComponent(siteSettings.whatsappMessage)}` : ''}`
    : '#';

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8" id="contact">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Contact MeetVia</h2>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">Have a question about finding a companion or joining MeetVia? Send us your details and we&apos;ll get back to you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-8">
          <ContactForm siteSettings={siteSettings} services={services} />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }} transition={{ duration: 0.5, delay: 0.3 }} className="glass p-6 rounded-theme flex flex-col items-center justify-center text-center">
            <MessageCircle className="w-12 h-12 text-green-500 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-primary mb-2">Quick Assistance</h3>
            <p className="text-primary/70 text-sm mb-6">Prefer a direct conversation? Message us on WhatsApp.</p>
            {siteSettings.whatsappNumber ? (
              <Button href={whatsappLink} variant="primary" size="md" className="bg-green-600 hover:bg-green-700">Message on WhatsApp</Button>
            ) : (
              <p className="text-xs text-primary/50">WhatsApp assistance is temporarily unavailable.</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
