'use client';

import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { ITestimonial } from '@/types';

interface TestimonialsGridProps { testimonials: ITestimonial[]; }

export default function TestimonialsGrid({ testimonials }: TestimonialsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div key={testimonial.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.1 }}>
          <GlassCard className="p-6 h-full flex flex-col">
            <p className="text-primary/80 text-sm leading-relaxed mb-4 flex-1">&ldquo;{testimonial.reviewText}&rdquo;</p>
            <div className="flex items-center gap-2 mt-auto">
              <span className="text-primary font-medium text-sm">{testimonial.reviewerName}</span>
              <BadgeCheck className="w-4 h-4 text-accent" aria-label="Verified" />
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
