'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { ITestimonial } from '@/types';

interface TestimonialsPreviewProps { testimonials: ITestimonial[]; }

export default function TestimonialsPreview({ testimonials }: TestimonialsPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  if (testimonials.length === 0) {
    return <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8" aria-label="Visitor Stories"><div className="max-w-2xl mx-auto rounded-theme border border-primary/10 bg-primary/5 px-6 py-10 text-center"><p className="text-primary/60">Visitor stories are currently being updated.</p></div></section>;
  }
  const previewTestimonials = testimonials.slice(0, 3);
  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }}><h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Visitor Stories</h2></motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {previewTestimonials.map((testimonial, index) => (
            <motion.div key={testimonial.id} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.5, delay: index * 0.15 }}>
              <GlassCard className="p-6 h-full flex flex-col">
                <p className="text-primary/80 text-sm leading-relaxed mb-4 flex-1">&ldquo;{testimonial.reviewText}&rdquo;</p>
                <div className="flex items-center gap-2 mt-auto"><span className="text-primary font-medium text-sm">{testimonial.reviewerName}</span>{testimonial.isVerified && <BadgeCheck className="w-4 h-4 text-accent" aria-label="Verified" />}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-center mt-12"><Button href="/testimonials" variant="outline" size="lg">View All Testimonials</Button></motion.div>
      </div>
    </section>
  );
}
