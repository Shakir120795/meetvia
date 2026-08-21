'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicPost } from '@/lib/api';
import { saveCustomerSession, useCustomerAuth } from '@/context/CustomerAuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^\+?[1-9]\d{7,14}$/;

type OtpRequestResponse = { success: boolean; data: { requestId: string; expiresAt: string; developmentOtp?: string } };
type OtpVerifyResponse = { success: boolean; data: { user: { id: string; email?: string | null; mobile?: string | null; status: string; profile?: { displayName?: string | null; avatarUrl?: string | null } | null }; sessionToken: string; expiresAt: string } };

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useCustomerAuth();
  const [channel, setChannel] = useState<'email' | 'mobile'>('email');
  const [identifier, setIdentifier] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    const value = identifier.trim();
    const valid = channel === 'email' ? EMAIL_RE.test(value) : MOBILE_RE.test(value);
    if (!valid) { setError(channel === 'email' ? 'Enter a valid email address.' : 'Enter a valid mobile number with country code.'); return; }
    setBusy(true);
    try {
      const response = await publicPost<OtpRequestResponse>('/api/v1/public/auth/otp/request', { channel, identifier: value, purpose: 'LOGIN' });
      setRequestId(response.data.requestId); setDevOtp(response.data.developmentOtp || null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send OTP.'); }
    finally { setBusy(false); }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!requestId || !/^\d{4,8}$/.test(otp)) { setError('Enter the OTP sent to you.'); return; }
    setBusy(true);
    try {
      const response = await publicPost<OtpVerifyResponse>('/api/v1/public/auth/otp/verify', { requestId, code: otp });
      saveCustomerSession(response.data.sessionToken, response.data.expiresAt);
      await refresh();
      router.push('/profile');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to verify OTP.'); }
    finally { setBusy(false); }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-accent text-sm font-semibold uppercase tracking-[0.2em]">GoWith</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Find someone to go with.</h1>
          <p className="mt-2 text-foreground/65">Sign in with a one-time verification code.</p>
        </div>

        {!requestId ? (
          <form onSubmit={requestOtp} className="space-y-5">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-foreground/5">
              {(['email', 'mobile'] as const).map((item) => (
                <button key={item} type="button" onClick={() => { setChannel(item); setIdentifier(''); setError(''); }} className={`rounded-lg py-2 text-sm font-medium transition ${channel === item ? 'bg-accent text-white' : 'text-foreground/70 hover:text-foreground'}`}>
                  {item === 'email' ? 'Email' : 'Mobile'}
                </button>
              ))}
            </div>
            <label className="block text-sm text-foreground/80">
              {channel === 'email' ? 'Email address' : 'Mobile number'}
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={channel === 'email' ? 'you@example.com' : '+91XXXXXXXXXX'} autoComplete={channel === 'email' ? 'email' : 'tel'} className="mt-2 w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 outline-none focus:border-accent" />
            </label>
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-5">
            <p className="text-sm text-foreground/70">OTP sent to <strong className="text-foreground">{identifier}</strong>.</p>
            <label className="block text-sm text-foreground/80">
              Verification code
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))} inputMode="numeric" autoComplete="one-time-code" placeholder="123456" className="mt-2 w-full rounded-xl border border-foreground/10 bg-background/60 px-4 py-3 text-center text-2xl tracking-[0.35em] outline-none focus:border-accent" />
            </label>
            {devOtp && <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">Development OTP: {devOtp}</p>}
            {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Verifying…' : 'Verify & Continue'}</button>
            <button type="button" onClick={() => { setRequestId(null); setOtp(''); setDevOtp(null); setError(''); }} className="w-full text-sm text-foreground/60 hover:text-foreground">Use a different contact</button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-foreground/50">By continuing, you agree to our <Link className="underline hover:text-accent" href="/terms-of-service">Terms</Link> and <Link className="underline hover:text-accent" href="/privacy-policy">Privacy Policy</Link>.</p>
      </div>
    </section>
  );
}
