'use client';

import { motion } from 'framer-motion';

interface AboutSectionProps {
  title?: string;
  content?: string;
}

export default function AboutSection({ title, content }: AboutSectionProps) {
  const heading = title || 'About GoWith';
  const body = content || 'GoWith helps people find trusted companions for travel, city exploration and shared experiences. Our goal is to make going somewhere feel more connected, comfortable and enjoyable.';

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="glass rounded-theme p-8 sm:p-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-[0.2em] mb-3">About</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">{heading}</h2>
          <div className="text-primary/70 text-base sm:text-lg leading-8 whitespace-pre-line">{body}</div>
        </motion.div>
      </div>
    </section>
  );
}
