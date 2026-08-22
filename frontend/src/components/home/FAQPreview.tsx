'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Accordion from '@/components/ui/Accordion';
import Button from '@/components/ui/Button';
import { IFAQ } from '@/types';

interface FAQPreviewProps { faqs: IFAQ[]; }

export default function FAQPreview({ faqs }: FAQPreviewProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const previewFaqs = faqs.slice(0, 6);
  const accordionItems = previewFaqs.map((faq) => ({ id: faq.id, title: faq.question, content: faq.answer }));

  return (
    <section ref={sectionRef} className="py-20 px-4 sm:px-6 lg:px-8" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.2 }}>
          {previewFaqs.length > 0 ? <Accordion items={accordionItems} /> : <div className="rounded-theme border border-primary/10 bg-primary/5 px-6 py-10 text-center"><p className="text-primary/60">FAQs are currently being updated.</p></div>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.5, delay: 0.4 }} className="text-center mt-10">
          <Button href="/faq" variant="outline" size="lg">View All FAQs</Button>
        </motion.div>
      </div>
    </section>
  );
}
