'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Clock, MapPin, Play, CheckCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { IService } from '@/types';

interface ServicesGridProps {
  services: IService[];
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, margin: '-50px' });

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-primary/60 text-lg">
          No services are available at the moment. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {services.map((service, index) => (
        <motion.div
          key={service._id}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <GlassCard className="p-6 h-full flex flex-col">
            {/* Video Thumbnail with Play Overlay */}
            {service.video && (
              <div className="relative mb-4 rounded-lg overflow-hidden aspect-video bg-secondary/20">
                {service.thumbnail ? (
                  <img
                    src={service.thumbnail}
                    alt={`${service.title} preview`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                    <span className="text-primary/40 text-sm">Video</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-14 h-14 rounded-full bg-accent/90 flex items-center justify-center">
                    <Play
                      className="w-6 h-6 text-white ml-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-semibold text-primary mb-3">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-primary/70 text-sm leading-relaxed mb-4">
              {service.description}
            </p>

            {/* Duration & Location */}
            <div className="flex items-center gap-4 mb-4">
              {service.duration && (
                <span className="flex items-center gap-1.5 text-sm text-primary/60">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  {service.duration}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {service.locationType}
              </span>
            </div>

            {/* What's Included */}
            {service.whatsIncluded && service.whatsIncluded.length > 0 && (
              <div className="mb-6 flex-1">
                <p className="text-xs font-medium text-primary/50 uppercase tracking-wider mb-2">
                  What&apos;s Included
                </p>
                <ul className="space-y-1.5">
                  {service.whatsIncluded.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-primary/70"
                    >
                      <CheckCircle
                        className="w-4 h-4 text-accent shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Book Button */}
            <div className="mt-auto pt-4">
              <Button
                href={service.buttonLink || '/contact'}
                variant="primary"
                size="md"
                className="w-full"
              >
                {service.buttonText || 'Book This Service'}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
