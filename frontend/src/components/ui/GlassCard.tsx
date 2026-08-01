'use client';

import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}: GlassCardProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const shouldAnimate = hoverEffect && !prefersReducedMotion;

  return (
    <motion.div
      className={`glass ${className}`}
      onClick={onClick}
      whileHover={
        shouldAnimate
          ? {
              transform:
                'perspective(1000px) rotateY(2deg) rotateX(2deg) translateZ(10px)',
              transition: { duration: 0.3 },
            }
          : undefined
      }
      transition={{ duration: 0.3 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </motion.div>
  );
}
