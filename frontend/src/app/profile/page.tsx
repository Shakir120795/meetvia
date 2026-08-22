'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { customerPatch } from '@/lib/api';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

type ProfileForm = { firstName: string; lastName: string; displayName: string; avatarUrl: string; bio: string; countryCode: string; preferredLanguage: string; preferredCurrency: string };
const emptyForm: ProfileForm = { firstName: '', lastName: '', displayName: '', avatarUrl: '', bio: '', countryCode: '', preferredLanguage: '', preferredCurrency: 'INR' };

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout, refresh } = useCustomerAuth();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.profile) setForm((current) => ({ ...current, displayName: user.profile?.displayName || '', avatarUrl: user.profile?.avatarUrl || '' }));
  }, [user]);

  if (isLoading) return <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Loading profile…</section>;
  if (!isAuthenticated) return <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4"><div className="glass rounded-2xl p-8 text-center max-w-md w-full"><h1 className="text-2xl font-bold">Your MeetVia profile</h1><p className="mt-2 text-foreground/60">Sign in to view and manage your profile.</p><Link href="/login" className="inline-block mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-white">Sign in</Link></div></section>;

  const update = (key: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    try { await customerPatch('/api/v1/public/me', form); await refresh(); setMessage('Profile saved successfully.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to save profile.'); }
    finally { setSaving(false); }
  };

  return <section className="min-h-[calc(100vh-4rem)] px-4 py-16"><div className="mx-auto max-w-3xl space-y-6">
    <div className="glass rounded-2xl p-6 sm:p-8"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="text-accent text-sm font-semibold uppercase tracking-[0.18em]">Profile</p><h1 className="mt-2 text-3xl font-bold">{user?.profile?.displayName || 'Your MeetVia profile'}</h1><p className="mt-2 text-foreground/60">Manage your identity and travel profile.</p></div><button onClick={() => void logout()} className="rounded-xl border border-foreground/10 px-4 py-2 text-sm hover:border-accent hover:text-accent">Sign out</button></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Email</span><p className="mt-1 font-medium">{user?.email || 'Not provided'}</p></div><div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Mobile</span><p className="mt-1 font-medium">{user?.mobile || 'Not provided'}</p></div><div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Account status</span><p className="mt-1 font-medium">{user?.status}</p></div><div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Verification</span><p className="mt-1 font-medium">Verified session</p></div></div>
    </div>

    <form onSubmit={save} className="glass rounded-2xl p-6 sm:p-8 space-y-5"><div><h2 className="text-xl font-semibold">Edit profile</h2><p className="mt-1 text-sm text-foreground/60">Update the information shown on your MeetVia profile.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">{(['firstName', 'lastName', 'displayName', 'countryCode', 'preferredLanguage', 'preferredCurrency'] as const).map((key) => <label key={key} className="text-sm text-foreground/80">{key.replace(/([A-Z])/g, ' $1')}<input value={form[key]} onChange={(e) => update(key, e.target.value)} className="mt-2 w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 outline-none focus:border-accent" /></label>)}</div>
      <label className="block text-sm text-foreground/80">Avatar URL<input value={form.avatarUrl} onChange={(e) => update('avatarUrl', e.target.value)} className="mt-2 w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 outline-none focus:border-accent" /></label>
      <label className="block text-sm text-foreground/80">Bio<textarea value={form.bio} onChange={(e) => update('bio', e.target.value)} maxLength={500} rows={4} className="mt-2 w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 outline-none focus:border-accent" /></label>
      {message && <p className="text-sm text-emerald-400" role="status">{message}</p>}{error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      <button disabled={saving} className="rounded-xl bg-accent px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save profile'}</button>
    </form>
  </div></section>;
}
