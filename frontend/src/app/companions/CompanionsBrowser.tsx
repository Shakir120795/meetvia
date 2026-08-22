'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Search, SlidersHorizontal, UserRound, X } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Companion = {
  id: string;
  profile?: { displayName?: string | null; firstName?: string | null; lastName?: string | null; avatarUrl?: string | null; bio?: string | null } | null;
  experiences?: Array<{ title?: string; city?: { cityName?: string | null } | null; category?: string | null }>;
};
type City = { id: string; cityName: string; state: string };
type ApiResult = { success: boolean; data: Companion[]; pagination?: { page: number; limit: number; total: number; totalPages: number } };

function nameOf(companion: Companion) { return companion.profile?.displayName || [companion.profile?.firstName, companion.profile?.lastName].filter(Boolean).join(' ') || 'MeetVia Companion'; }
function cityOf(companion: Companion) { return companion.experiences?.find((item) => item.city?.cityName)?.city?.cityName || 'Local companion'; }

export default function CompanionsBrowser() {
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [experience, setExperience] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  const loadCompanions = useCallback(async (search: string, selectedCity: string, selectedExperience: string, selectedDate: string, selectedTime: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '24' });
      if (search.trim()) params.set('q', search.trim());
      if (selectedCity) params.set('city', selectedCity);
      if (selectedExperience) params.set('experience', selectedExperience);
      if (selectedDate) params.set('date', selectedDate);
      if (selectedTime) params.set('time', selectedTime);
      const res = await fetch(`${API_BASE}/api/v1/public/companions?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Unable to load companions.');
      const json: ApiResult = await res.json();
      if (!json.success) throw new Error('Unable to load companions.');
      setCompanions(json.data || []);
      setTotal(json.pagination?.total || json.data?.length || 0);
    } catch (loadError) {
      setCompanions([]); setTotal(0); setError(loadError instanceof Error ? loadError.message : 'Unable to load companions.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCity(params.get('city') || '');
    setExperience(params.get('experience') || '');
    setDate(params.get('date') || '');
    setTime(params.get('time') || '');
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/v1/public/cities`, { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => { if (active) setCities(json?.data || []); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadCompanions(q, city, experience, date, time), 250);
    return () => window.clearTimeout(timer);
  }, [q, city, experience, date, time, loadCompanions]);

  const clearFilters = () => { setQ(''); setCity(''); setExperience(''); setDate(''); setTime(''); };

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center"><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Companion Marketplace</p><h1 className="text-4xl font-bold text-foreground sm:text-5xl">Find someone to go with.</h1><p className="mx-auto mt-4 max-w-2xl text-foreground/65">Search local companions by name, city, experience and availability.</p></header>

        <section className="mb-10 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 backdrop-blur-xl" aria-label="Companion filters">
          <div className="flex items-center gap-2 pb-3 text-sm font-semibold text-foreground/70"><SlidersHorizontal className="h-4 w-4" /> Find your match</div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_180px_180px_150px_130px_auto]">
            <label className="relative block"><span className="sr-only">Search companions</span><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name, interests or experience…" className="w-full rounded-xl border border-foreground/10 bg-background px-11 py-3 text-sm text-foreground outline-none focus:border-accent/50" /></label>
            <label><span className="sr-only">Filter by city</span><select value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50"><option value="">All cities</option>{cities.map((item) => <option key={item.id} value={item.cityName}>{item.cityName}</option>)}</select></label>
            <label><span className="sr-only">Filter by experience</span><input value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="Experience" className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50" /></label>
            <label><span className="sr-only">Filter by date</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50" /></label>
            <label><span className="sr-only">Filter by time</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent/50" /></label>
            {(q || city || experience || date || time) && <button type="button" onClick={clearFilters} className="inline-flex items-center justify-center gap-2 rounded-xl border border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground hover:bg-foreground/5"><X className="h-4 w-4" />Clear</button>}
          </div>
        </section>

        <div className="mb-5 flex items-center justify-between text-sm text-foreground/55"><span>{loading ? 'Searching…' : `${total} companion${total === 1 ? '' : 's'} found`}</span>{city && <span>City: {city}</span>}</div>
        {error && <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-sm text-red-600">{error}</div>}
        {!error && loading && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><div className="h-80 animate-pulse rounded-2xl bg-foreground/5" /><div className="h-80 animate-pulse rounded-2xl bg-foreground/5" /><div className="h-80 animate-pulse rounded-2xl bg-foreground/5" /></div>}
        {!error && !loading && companions.length === 0 && <div className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-12 text-center"><UserRound className="mx-auto mb-4 h-10 w-10 text-foreground/30" /><h2 className="text-xl font-semibold text-foreground">No companions found</h2><p className="mt-2 text-sm text-foreground/55">Try another city, experience, date or search term.</p></div>}
        {!error && !loading && companions.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{companions.map((companion) => <Link key={companion.id} href={`/companions/${companion.id}`} className="group overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-accent/30"><div className="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-accent/10 via-foreground/[0.03] to-cyan-400/10">{companion.profile?.avatarUrl ? <img src={companion.profile.avatarUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <UserRound className="h-16 w-16 text-foreground/20" />}</div><div className="pt-5"><h2 className="text-lg font-semibold text-foreground">{nameOf(companion)}</h2><p className="mt-1 flex items-center gap-1 text-sm text-foreground/55"><MapPin className="h-3.5 w-3.5" />{cityOf(companion)}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground/65">{companion.profile?.bio || 'Discover a local companion for your next plan.'}</p><div className="mt-4 flex flex-wrap gap-2">{(companion.experiences || []).slice(0, 2).map((item) => <span key={item.title} className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">{item.title || 'Experience'}</span>)}</div></div></Link>)}</div>}
      </div>
    </main>
  );
}
