'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { IService } from '@/types';

interface ServicesPreviewProps {
  services: IService[];
}

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8" id="services">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Our Professional Services Overview</h2>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">Structured public experiences designed for domestic and international visitors seeking city assistance and companionship services.</p>
        </motion.div>

        {services.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-theme border border-primary/10 bg-primary/5 px-6 py-10 text-center">
            <p className="text-primary/60">Our services are currently being updated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div key={service._id} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <GlassCard className="p-6 h-full flex flex-col">
                  <h3 className="text-xl font-semibold text-primary mb-3">{service.title}</h3>
                  <p className="text-primary/70 text-sm leading-relaxed mb-4 flex-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-auto">
                    {service.duration && <span className="flex items-center gap-1.5 text-xs text-primary/60"><Clock className="w-4 h-4" aria-hidden="true" />{service.duration}</span>}
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent"><MapPin className="w-3.5 h-3.5" aria-hidden="true" />{service.locationType}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center mt-12">
          <Button href="/services" variant="outline" size="lg">View All Services</Button>
        </motion.div>
      </div>
    </section>
  );
}
