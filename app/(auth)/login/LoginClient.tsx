'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase';

/**
 * BasePath + callback + after-login targets, centralized.
 * Your app runs under /agb.
 */
const BASE = '/agb';
const CALLBACK_PATH = `${BASE}/auth/callback`;
const AFTER_LOGIN_PATH = `${BASE}/hub`; // change to `${BASE}/play` if you prefer

export default function LoginClient() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []); // PKCE-ready browser client

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email/password login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push(AFTER_LOGIN_PATH);
    }
  }

  // Email/password sign-up
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push(AFTER_LOGIN_PATH);
    }
  }

  // OAuth helpers (Google / Facebook) — PKCE flow with redirectTo
  async function signInWithProvider(provider: 'google' | 'facebook') {
    const origin = window.location.origin; // safe in client
    const redirectTo = `${origin}${CALLBACK_PATH}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo, // MUST point to our App Router callback route
        // Optional: force Google account chooser during dev
        // queryParams: { prompt: 'select_account' },
      },
    });

    if (error) setError(error.message);
  }

  async function handleGoogleLogin() {
    await signInWithProvider('google');
  }

  async function handleFacebookLogin() {
    await signInWithProvider('facebook');
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1>Login to AGB</h1>

        <form
          onSubmit={handleLogin}
          className="card"
          style={{ marginTop: 20, display: 'grid', gap: 12 }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={handleSignup}
            className="btn btn-ghost"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleGoogleLogin} className="btn btn-primary">
            Sign in with Google
          </button>
          <button onClick={handleFacebookLogin} className="btn btn-primary">
            Sign in with Facebook
          </button>
        </div>
      </div>
    </main>
  );
}
