'use client';

import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export interface CompanionPreviewItem {
  id: string;
  profile?: { displayName?: string | null; firstName?: string | null; lastName?: string | null; avatarUrl?: string | null; bio?: string | null } | null;
  experiences?: Array<{ city?: { cityName?: string | null } | null }>;
}

interface CompanionPreviewProps { companions: CompanionPreviewItem[]; }
function displayName(companion: CompanionPreviewItem) { return companion.profile?.displayName || [companion.profile?.firstName, companion.profile?.lastName].filter(Boolean).join(' ') || 'MeetVia Companion'; }
function cityName(companion: CompanionPreviewItem) { return companion.experiences?.find((experience) => experience.city?.cityName)?.city?.cityName || 'Local companion'; }

export default function CompanionPreview({ companions }: CompanionPreviewProps) {
  return (
    <section id="companions" className="px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="companions-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Browse Companions</p><h2 id="companions-title" className="text-3xl font-bold text-foreground sm:text-4xl">Find someone to go with.</h2><p className="mt-3 max-w-2xl text-foreground/65">Explore local companions and discover who fits your next plan.</p></div><Link href="/companions" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">Browse all <ArrowRight className="h-4 w-4" /></Link></div>
        {companions.length === 0 ? <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-8 text-center text-sm text-foreground/55">No companion profiles are available yet. Check back soon.</div> : <div className="grid gap-5 md:grid-cols-3">{companions.slice(0, 3).map((companion, index) => <motion.article key={companion.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}><Link href={`/companions/${companion.id}`} className="group block h-full overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/30"><div className="flex h-44 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent/10 via-foreground/[0.03] to-cyan-400/10">{companion.profile?.avatarUrl ? <img src={companion.profile.avatarUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <span className="text-xs text-foreground/40">Companion profile</span>}</div><div className="pt-5"><h3 className="font-semibold text-foreground">{displayName(companion)}</h3><p className="mt-1 flex items-center gap-1 text-sm text-foreground/55"><MapPin className="h-3.5 w-3.5" />{cityName(companion)}</p><p className="mt-3 line-clamp-2 text-sm text-foreground/65">{companion.profile?.bio || 'Discover a local companion for your next plan.'}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">View profile <ArrowRight className="h-4 w-4" /></span></div></Link></motion.article>)}</div>}
      </div>
    </section>
  );
}
