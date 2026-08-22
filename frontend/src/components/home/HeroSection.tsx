'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Users, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Button from '@/components/ui/Button';
import { IHeroSlide } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps { slides: IHeroSlide[]; }

export default function HeroSection({ slides }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const currentSlide = slides[currentIndex];
  const hasMultipleSlides = slides.length > 1;

  const goToNext = useCallback(() => setCurrentIndex((p) => (p + 1) % slides.length), [slides.length]);
  const goToPrev = useCallback(() => setCurrentIndex((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;
    const section = sectionRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-hero-copy]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
      gsap.to('[data-hero-orbit]', { rotate: 360, duration: 28, repeat: -1, ease: 'none' });
      gsap.to('[data-hero-float]', { y: -12, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      const trigger = ScrollTrigger.create({ trigger: section, start: 'top top', end: '+=35%', pin: true, scrub: 0.5 });
      return () => trigger.kill();
    }, section);
    return () => ctx.revert();
  }, [prefersReducedMotion, currentIndex]);

  if (!slides.length) return null;

  return (
    <section ref={sectionRef} className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden gowith-gradient bg-[#050914]" aria-label="MeetVia hero">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(139,92,246,.16),transparent_28%),radial-gradient(circle_at_15%_30%,rgba(34,211,238,.09),transparent_25%)]" />
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          {currentSlide.backgroundVideo && <video src={currentSlide.backgroundVideo} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-20" aria-hidden="true" />}
          {currentSlide.backgroundImage && !currentSlide.backgroundVideo && <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${currentSlide.backgroundImage})` }} aria-hidden="true" />}
          <div className="absolute inset-0 bg-[#050914]/75" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:px-10">
        <div className="max-w-2xl">
          <div data-hero-copy className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur-xl"><Sparkles className="h-4 w-4 text-violet-300" /> Travel with someone local</div>
          <h1 data-hero-copy className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white md:text-7xl">Find someone<br /><span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">to go with.</span></h1>
          <p data-hero-copy className="mt-6 max-w-xl text-lg leading-8 text-white/65 md:text-xl">{currentSlide.subtitle || 'Meet trusted companions for city days, travel plans and experiences worth sharing.'}</p>
          <div data-hero-copy className="mt-8 flex flex-wrap gap-3">
            <Button href={currentSlide.ctaLink || '/companions'} variant="primary" size="lg">{currentSlide.ctaText || 'Explore companions'}</Button>
            <a href="#cities" className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/10">Explore destinations</a>
          </div>
          <div data-hero-copy className="mt-8 flex flex-wrap gap-5 text-sm text-white/50"><span className="flex items-center gap-2"><Users className="h-4 w-4" /> Trusted people</span><span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Local experiences</span></div>
        </div>
        <div className="relative mx-auto h-[420px] w-full max-w-[520px]" aria-hidden="true">
          <div data-hero-float className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-gradient-to-br from-violet-500/25 via-slate-900 to-cyan-400/10 shadow-[0_0_100px_rgba(139,92,246,.2)] [transform-style:preserve-3d]" style={{ boxShadow: 'inset -30px -20px 70px rgba(0,0,0,.65), inset 20px 10px 50px rgba(255,255,255,.08)' }}><div className="absolute inset-4 rounded-full border border-white/10" /><div className="absolute inset-10 rounded-full border border-dashed border-violet-300/20" /><div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(103,232,249,.8)]" /></div>
          <div data-hero-orbit className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15" />
          <div data-hero-float className="absolute left-4 top-12 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-2xl"><div className="text-xs text-white/45">Next stop</div><div className="mt-1 text-sm font-medium text-white">Agra · Taj Mahal</div></div>
          <div data-hero-float className="absolute bottom-12 right-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-2xl" style={{ animationDelay: '600ms' }}><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /><span className="text-xs text-white/45">People nearby</span></div><div className="mt-1 text-sm font-medium text-white">Find your companion</div></div>
        </div>
      </div>
      {hasMultipleSlides && <><button onClick={goToPrev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl hover:bg-white/10" aria-label="Previous slide"><ChevronLeft className="h-5 w-5" /></button><button onClick={goToNext} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-3 text-white backdrop-blur-xl hover:bg-white/10" aria-label="Next slide"><ChevronRight className="h-5 w-5" /></button><div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((_, i) => <button key={i} onClick={() => setCurrentIndex(i)} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-violet-300' : 'w-2 bg-white/30'}`} aria-label={`Go to slide ${i + 1}`} />)}</div></>}
    </section>
  );
}
