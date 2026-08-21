'use client';

import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useCustomerAuth();

  if (isLoading) return <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Loading profile…</section>;
  if (!isAuthenticated) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold">Your GoWith profile</h1>
          <p className="mt-2 text-foreground/60">Sign in to view and manage your profile.</p>
          <Link href="/login" className="inline-block mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-white">Sign in</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-accent text-sm font-semibold uppercase tracking-[0.18em]">Profile</p>
              <h1 className="mt-2 text-3xl font-bold">{user?.profile?.displayName || 'Your GoWith profile'}</h1>
              <p className="mt-2 text-foreground/60">Manage your identity and travel profile.</p>
            </div>
            <button onClick={() => void logout()} className="rounded-xl border border-foreground/10 px-4 py-2 text-sm hover:border-accent hover:text-accent">Sign out</button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Email</span><p className="mt-1 font-medium">{user?.email || 'Not provided'}</p></div>
            <div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Mobile</span><p className="mt-1 font-medium">{user?.mobile || 'Not provided'}</p></div>
            <div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Account status</span><p className="mt-1 font-medium">{user?.status}</p></div>
            <div className="rounded-xl bg-foreground/5 p-4"><span className="text-xs text-foreground/50">Verification</span><p className="mt-1 font-medium">Verified session</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
