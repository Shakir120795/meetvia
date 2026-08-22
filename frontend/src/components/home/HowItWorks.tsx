'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { IHowItWorksStep } from '@/types';

interface HowItWorksProps {
  steps: IHowItWorksStep[];
}

export default function HowItWorks({ steps }: HowItWorksProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            How Meetvia Works
          </h2>
          <p className="text-primary/70 text-lg max-w-2xl mx-auto">
            A simple, structured process designed for safe public experiences.
          </p>
        </motion.div>

        {steps.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-theme border border-primary/10 bg-primary/5 px-6 py-10 text-center">
            <p className="text-primary/60">How It Works information is currently being updated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step._id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <GlassCard className="p-8 h-full text-center">
                  <span className="text-5xl font-bold text-accent/30 block mb-4">
                    {String(step.stepNumber).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-primary/70 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
