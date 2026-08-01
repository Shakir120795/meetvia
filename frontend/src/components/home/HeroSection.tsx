'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Button from '@/components/ui/Button';
import { IHeroSlide } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  slides: IHeroSlide[];
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const includesRef = useRef<HTMLUListElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const hasMultipleSlides = slides.length > 1;
  const currentSlide = slides[currentIndex];

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // GSAP ScrollTrigger animation setup
  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const heading = headingRef.current;
    const subtitle = subtitleRef.current;
    const includes = includesRef.current;
    const cta = ctaRef.current;

    if (!section || !heading || !subtitle || !includes || !cta) return;

    const elements = [heading, subtitle, includes, cta];

    // Set initial state - slightly faded, with subtle reveal on scroll
    gsap.set(elements, { opacity: 0.9, y: 5 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=50%',
        pin: true,
        scrub: 0.5,
      },
    });

    // Staggered full reveal: heading → subtitle → includes → CTA
    tl.to(heading, { opacity: 1, y: 0, duration: 0.25 })
      .to(subtitle, { opacity: 1, y: 0, duration: 0.25 })
      .to(includes, { opacity: 1, y: 0, duration: 0.25 })
      .to(cta, { opacity: 1, y: 0, duration: 0.25 });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [prefersReducedMotion, currentIndex]);

  if (!slides.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background slides with framer-motion transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide._id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background image or video */}
          {currentSlide.backgroundVideo ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* 3D-styled card frame for video */}
              <div
                className="relative w-full h-full md:w-[85%] md:h-[85%] md:rounded-2xl md:overflow-hidden"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="w-full h-full md:shadow-2xl md:border md:border-white/10 md:rounded-2xl overflow-hidden"
                  style={{
                    transform: 'rotateX(2deg) rotateY(-1deg)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <video
                    src={currentSlide.backgroundVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          ) : currentSlide.backgroundImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentSlide.backgroundImage})`,
              }}
              role="img"
              aria-label={currentSlide.heading}
            />
          ) : (
            <div className="absolute inset-0 bg-secondary" />
          )}

          {/* Dark overlay with configurable opacity */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: currentSlide.overlayOpacity / 100 }}
            aria-hidden="true"
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero text content */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl text-center">
          <h1
            ref={headingRef}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight"
            style={prefersReducedMotion ? {} : undefined}
          >
            {currentSlide.heading}
          </h1>

          <p
            ref={subtitleRef}
            className="text-base md:text-xl lg:text-2xl text-primary/80 mb-6 max-w-2xl mx-auto"
            style={prefersReducedMotion ? {} : undefined}
          >
            {currentSlide.subtitle}
          </p>

          {currentSlide.includesList && currentSlide.includesList.length > 0 && (
            <ul
              ref={includesRef}
              className="flex flex-wrap justify-center gap-3 mb-8"
              style={prefersReducedMotion ? {} : undefined}
            >
              {currentSlide.includesList.map((item, idx) => (
                <li
                  key={idx}
                  className="px-4 py-2 glass text-sm text-primary/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          {currentSlide.ctaText && (
            <div
              ref={ctaRef}
              style={prefersReducedMotion ? {} : undefined}
            >
              <Button
                href={currentSlide.ctaLink || '#'}
                variant="primary"
                size="lg"
              >
                {currentSlide.ctaText}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows — hidden if only one slide */}
      {hasMultipleSlides && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full glass text-primary hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full glass text-primary hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                  idx === currentIndex
                    ? 'bg-accent'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
