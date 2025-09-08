'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  // 🔁 Fallback: if we land on /agb/login#access_token=... parse it and set a server session
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    const params = new URLSearchParams(hash.slice(1)); // drop '#'
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) return;

    // Ask our server to set the cookie session so SSR/middleware can see it
    fetch('/agb/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token, refresh_token }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to set session.');
        }
        // Clean up the hash in the URL and go to Hub
        window.history.replaceState({}, '', window.location.pathname);
        router.replace('/hub'); // basePath auto-added -> /agb/hub
      })
      .catch((err) => {
        console.error('Set session (hash) error:', err);
        alert('Could not complete sign-in. Please try again.');
      });
  }, [router]);

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/agb/auth/callback`, // ✅ code/PCKE flow target
        // Force authorization code flow instead of implicit hash
        flowType: 'pkce',
        // If your supabase-js version doesn't support flowType, uncomment the line below as a backup:
        // queryParams: { response_type: 'code' },
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
      alert('Failed to start Google sign-in.');
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/agb/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error.message);
      alert('Failed to send magic link.');
      return;
    }

    alert('Magic link sent! Check your email.');
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
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 20,
            padding: '0.75rem',
            borderRadius: 8,
            border: '1px solid #555',
            background: '#222',
            color: 'white',
          }}
        >
          Continue with Google
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
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: 8,
              border: '1px solid #555',
              background: '#222',
              color: 'white',
            }}
          >
            Send magic link
          </button>
        </form>
      </div>
    </main>
  );
}
