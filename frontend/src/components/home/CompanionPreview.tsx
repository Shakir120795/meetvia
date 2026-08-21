'use client';

import { MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CompanionPreview { id: string; name: string; city: string; image?: string; bio?: string; verified?: boolean; }

const PREVIEW_COMPANIONS: CompanionPreview[] = [
  { id: 'preview-1', name: 'Verified Companion', city: 'Agra', bio: 'Local city companion', verified: true },
  { id: 'preview-2', name: 'Verified Companion', city: 'Delhi', bio: 'Travel & city exploration', verified: true },
  { id: 'preview-3', name: 'Verified Companion', city: 'Jaipur', bio: 'Local experiences', verified: true },
];

export default function CompanionPreview() {
  return (
    <section id="companions" className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="companions-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Browse Companions</p><h2 id="companions-title" className="text-3xl font-bold text-foreground sm:text-4xl">Find someone to go with.</h2><p className="mt-3 max-w-2xl text-foreground/65">Explore verified local companions and discover who fits your next plan.</p></div>
          <Link href="/companions" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">Browse all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {PREVIEW_COMPANIONS.map((companion, index) => <motion.article key={companion.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-xl">
            <div className="flex h-44 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 via-foreground/[0.03] to-cyan-400/10"><span className="text-xs text-foreground/40">Companion profile</span></div>
            <div className="pt-5"><div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">{companion.name}</h3>{companion.verified && <ShieldCheck className="h-4 w-4 text-accent" aria-label="Verified" />}</div><p className="mt-1 flex items-center gap-1 text-sm text-foreground/55"><MapPin className="h-3.5 w-3.5" />{companion.city}</p><p className="mt-3 text-sm text-foreground/65">{companion.bio}</p></div>
          </motion.article>)}
        </div>
      </div>
    </section>
  );
}
