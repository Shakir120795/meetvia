'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';

export default function BecomeCompanion() {
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
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Become a Verified Companion
          </h2>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">
            Become a verified local companion with Meetvia.
          </p>
        </motion.div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <GlassCard className="p-6 h-full">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Verified &amp; Trusted
                  </h3>
                  <p className="text-primary/70 text-sm leading-relaxed">
                    Complete identity verification and background screening for
                    trust and credibility.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="p-6 h-full">
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Flexible &amp; Professional
                  </h3>
                  <p className="text-primary/70 text-sm leading-relaxed">
                    Public locations only, with structured 3–4 hour sessions
                    that fit your schedule.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-primary/60 text-sm mb-8"
        >
          This is a professional public companionship platform, not a dating
          service.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <Button href="/become-companion" variant="primary" size="lg">
            Become a Companion
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
