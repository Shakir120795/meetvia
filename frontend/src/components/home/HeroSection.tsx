'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Compass, MapPin, Users, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const heading = headingRef.current;
    const subtitle = subtitleRef.current;
    const includes = includesRef.current;
    const cta = ctaRef.current;
    if (!section || !heading || !subtitle || !includes || !cta) return;

    const elements = [heading, subtitle, includes, cta];
    gsap.set(elements, { opacity: 0.9, y: 5 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top top', end: '+=50%', pin: true, scrub: 0.5 },
    });
    tl.to(heading, { opacity: 1, y: 0, duration: 0.25 })
      .to(subtitle, { opacity: 1, y: 0, duration: 0.25 })
      .to(includes, { opacity: 1, y: 0, duration: 0.25 })
      .to(cta, { opacity: 1, y: 0, duration: 0.25 });
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) trigger.kill();
      });
    };
  }, [prefersReducedMotion, currentIndex]);

  if (!slides.length) return null;

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-[#06111f]" aria-label="GoWith travel companion hero">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide._id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          {currentSlide.backgroundVideo ? (
            <div className="absolute inset-0 opacity-45">
              <video src={currentSlide.backgroundVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" aria-hidden="true" />
            </div>
          ) : currentSlide.backgroundImage ? (
            <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${currentSlide.backgroundImage})` }} role="img" aria-label={currentSlide.heading} />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(14,165,233,0.24),transparent_34%),linear-gradient(115deg,#06111f_12%,rgba(6,17,31,0.9)_48%,rgba(7,35,55,0.78)_100%)]" />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute right-[-10%] top-[8%] hidden h-[78vh] w-[58vw] lg:block" aria-hidden="true">
        <motion.div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/20 bg-[radial-gradient(circle_at_32%_28%,#7dd3fc_0%,#0e7490_18%,#075985_46%,#082f49_72%,#06111f_100%)] shadow-[0_0_120px_rgba(34,211,238,0.2)]" animate={prefersReducedMotion ? undefined : { y: [-8, 8, -8], rotate: [0, 2, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-[12%] rounded-full border border-white/10" />
          <div className="absolute left-[18%] top-[22%] h-16 w-24 rotate-[-18deg] rounded-[50%] border border-emerald-200/20 bg-emerald-300/10" />
          <div className="absolute bottom-[18%] right-[16%] h-12 w-20 rotate-[18deg] rounded-[50%] border border-emerald-200/20 bg-emerald-300/10" />
          <div className="absolute left-1/2 top-1/2 h-[125%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20 rotate-[62deg]" />
        </motion.div>

        <motion.div className="absolute left-[8%] top-[17%] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl" animate={prefersReducedMotion ? undefined : { y: [-7, 7, -7], rotate: [-2, 1, -2] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-300/15 p-2 text-cyan-200"><MapPin size={18} /></span><div><p className="text-xs text-white/55">Explore</p><p className="text-sm font-semibold text-white">New Delhi</p></div></div>
        </motion.div>

        <motion.div className="absolute bottom-[19%] right-[7%] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-xl" animate={prefersReducedMotion ? undefined : { y: [8, -8, 8], rotate: [2, -1, 2] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-300/15 p-2 text-violet-200"><Users size={18} /></span><div><p className="text-xs text-white/55">Travel with</p><p className="text-sm font-semibold text-white">Trusted locals</p></div></div>
        </motion.div>

        <motion.div className="absolute right-[25%] top-[8%] rounded-full border border-white/10 bg-white/10 p-3 text-cyan-200 backdrop-blur-xl" animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}><Compass size={22} /></motion.div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-28 md:px-12 lg:px-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-cyan-100 backdrop-blur-md"><Sparkles size={14} /><span>TRAVEL • PEOPLE • EXPERIENCES</span></div>
          <h1 ref={headingRef} className="mb-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-6xl lg:text-7xl">{currentSlide.heading || 'Find someone to go with.'}</h1>
          <p ref={subtitleRef} className="mb-7 max-w-2xl text-base leading-7 text-slate-200/80 md:text-xl">{currentSlide.subtitle || 'Discover trusted locals, travel companions and experiences wherever your journey takes you.'}</p>

          {currentSlide.includesList?.length > 0 && (
            <ul ref={includesRef} className="mb-8 flex max-w-2xl flex-wrap gap-2.5">
              {currentSlide.includesList.map((item, idx) => <li key={idx} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100/85 backdrop-blur-md">{item}</li>)}
            </ul>
          )}

          <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
            {currentSlide.ctaText && <Button href={currentSlide.ctaLink || '/browse'} variant="primary" size="lg">{currentSlide.ctaText}</Button>}
            <a href="/companions" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10">Meet companions</a>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-xs text-slate-300/65"><span>✓ Verified companions</span><span>✓ Public experiences</span><span>✓ Travel-first discovery</span></div>
        </div>
      </div>

      {hasMultipleSlides && (
        <>
          <button onClick={goToPrev} className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-2 text-white backdrop-blur-md transition hover:bg-white/10 md:left-6" aria-label="Previous slide"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={goToNext} className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 p-2 text-white backdrop-blur-md transition hover:bg-white/10 md:right-6" aria-label="Next slide"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-8 bg-cyan-300' : 'w-2 bg-white/30'}`} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === currentIndex ? 'true' : undefined} />)}</div>
        </>
      )}
    </section>
  );
}
