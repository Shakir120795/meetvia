'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { ICity } from '@/types';

interface CitiesSectionProps { cities: ICity[]; }

export default function CitiesSection({ cities }: CitiesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Currently Available In</h2>
        </motion.div>
        {cities.length === 0 ? (
          <div className="rounded-theme border border-primary/10 bg-primary/5 px-6 py-10 text-center"><p className="text-primary/60">City availability is currently being updated.</p></div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {cities.map((city, index) => (
              <motion.div key={city.id} initial={{ opacity: 0, scale: 0.9 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="flex items-center gap-2 px-5 py-3 glass rounded-full">
                <MapPin className="w-5 h-5 text-accent" aria-hidden="true" />
                <span className="text-primary font-medium">{city.cityName}, {city.state}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
