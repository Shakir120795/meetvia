'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function SafetySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-accent" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold text-primary">
              Strict Verification for Your Safety
            </h2>
          </div>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">
            Every Meetvia companion completes a multi-step verification process
            before being approved for public sessions.
          </p>
        </motion.div>

        {/* Notice Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass p-6 mb-8 border-accent/20"
        >
          <h3 className="text-lg font-semibold text-accent mb-2">
            Important Notice
          </h3>
          <p className="text-primary/80 text-sm leading-relaxed">
            Meetvia is not a dating platform. All services are strictly
            professional, public-only companionship and city assistance
            experiences conducted in approved locations.
          </p>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-start gap-3 mb-10"
        >
          <CheckCircle className="w-5 h-5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
          <span className="text-primary/80">
            All meetings must take place in approved public locations.
          </span>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button href="/safety-policy" variant="outline" size="lg">
            View Safety Policy
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
