'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-browser';

const BASE = '/agb';
const CALLBACK = `${BASE}/auth/callback`;

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithGoogle() {
    try {
      setBusy(true);
      setErr(null);
      const redirectTo = `${window.location.origin}${CALLBACK}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) throw error;
      // Browser will redirect to Google automatically.
    } catch (e: any) {
      console.error('Google sign-in error:', e?.message || e);
      setErr(e?.message || 'Failed to start Google sign-in.');
      setBusy(false);
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setErr(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}${CALLBACK}` },
      });
      if (error) throw error;
      alert('Magic link sent! Check your email.');
    } catch (e: any) {
      console.error('Magic link error:', e?.message || e);
      setErr(e?.message || 'Failed to send magic link.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          border: '1px solid #333',
          padding: '2rem',
          borderRadius: 10,
          background: '#111',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, marginBottom: 16, color: 'white' }}>
          Sign in
        </h1>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 20,
            padding: '0.75rem',
            borderRadius: 8,
            border: '1px solid #555',
            background: busy ? '#333' : '#222',
            color: 'white',
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>

        <form onSubmit={sendMagicLink}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              marginBottom: 10,
              borderRadius: 6,
              border: '1px solid #444',
              background: '#000',
              color: 'white',
            }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 8,
              border: '1px solid #555',
              background: busy ? '#333' : '#222',
              color: 'white',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            Send magic link
          </button>
        </form>

        {err && (
          <p style={{ color: 'salmon', marginTop: 12 }}>
            {err}
          </p>
        )}
      </div>
    </main>
  );
}
