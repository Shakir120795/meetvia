import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin, UserRound } from 'lucide-react';
import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Companion = {
  id: string;
  profile?: { displayName?: string | null; firstName?: string | null; lastName?: string | null; avatarUrl?: string | null; bio?: string | null } | null;
  experiences?: Array<{ id: string; title: string; description: string; category: string; durationMinutes: number; priceMinor: number; currency: string; city?: { cityName?: string | null; state?: string | null } | null }>;
  availability?: Array<{ id: string; weekday: number; startMinute: number; endMinute: number; timezone: string }>;
};

async function getCompanion(id: string): Promise<Companion | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/companions/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch { return null; }
}

function displayName(companion: Companion) {
  return companion.profile?.displayName || [companion.profile?.firstName, companion.profile?.lastName].filter(Boolean).join(' ') || 'MeetVia Companion';
}

function money(minor: number, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(minor / 100);
}

function minutes(value: number) {
  const hour = Math.floor(value / 60).toString().padStart(2, '0');
  const minute = (value % 60).toString().padStart(2, '0');
  return `${hour}:${minute}`;
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const companion = await getCompanion(id);
  return { title: companion ? `${displayName(companion)} | MeetVia` : 'Companion | MeetVia' };
}

export default async function CompanionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companion = await getCompanion(id);
  if (!companion) notFound();

  const name = displayName(companion);
  const city = companion.experiences?.find((item) => item.city?.cityName)?.city;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/companions" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"><ArrowLeft className="h-4 w-4" />Back to companions</Link>
        <section className="overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.03] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[320px_1fr]">
            <div className="flex min-h-[320px] items-center justify-center bg-gradient-to-br from-accent/10 via-foreground/[0.03] to-cyan-400/10">
              {companion.profile?.avatarUrl ? <img src={companion.profile.avatarUrl} alt="" className="h-full min-h-[320px] w-full object-cover" /> : <UserRound className="h-24 w-24 text-foreground/20" />}
            </div>
            <div className="p-7 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Local companion</p>
              <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{name}</h1>
              {city?.cityName && <p className="mt-3 flex items-center gap-2 text-foreground/60"><MapPin className="h-4 w-4" />{city.cityName}{city.state ? `, ${city.state}` : ''}</p>}
              <p className="mt-6 whitespace-pre-line leading-7 text-foreground/70">{companion.profile?.bio || 'This companion has not added a bio yet.'}</p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section>
            <h2 className="text-2xl font-bold text-foreground">Published experiences</h2>
            <div className="mt-5 space-y-4">
              {(companion.experiences || []).length === 0 && <div className="rounded-2xl border border-foreground/10 p-6 text-sm text-foreground/55">No published experiences yet.</div>}
              {(companion.experiences || []).map((experience) => <article key={experience.id} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-semibold text-foreground">{experience.title}</h3><p className="mt-1 text-xs uppercase tracking-wide text-accent">{experience.category}</p></div><span className="font-semibold text-foreground">{money(experience.priceMinor, experience.currency)}</span></div><p className="mt-4 leading-6 text-foreground/65">{experience.description}</p><div className="mt-4 flex flex-wrap gap-4 text-sm text-foreground/55"><span>{experience.durationMinutes} min</span>{experience.city?.cityName && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{experience.city.cityName}</span>}</div></article>)}
            </div>
          </section>

          <aside className="h-fit rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6">
            <h2 className="text-lg font-semibold text-foreground">Availability</h2>
            <div className="mt-4 space-y-3">
              {(companion.availability || []).length === 0 && <p className="text-sm text-foreground/55">Availability has not been published yet.</p>}
              {(companion.availability || []).map((slot) => <div key={slot.id} className="rounded-xl bg-foreground/[0.04] p-3"><p className="flex items-center gap-2 text-sm font-medium text-foreground"><CalendarDays className="h-4 w-4 text-accent" />{weekdays[slot.weekday] || 'Day'}</p><p className="mt-1 text-xs text-foreground/55">{minutes(slot.startMinute)} – {minutes(slot.endMinute)} · {slot.timezone}</p></div>)}
            </div>
            <Link href="/contact?service=companion" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">Ask about this companion</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
