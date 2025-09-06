'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginClient() {
  const router = useRouter();
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
      router.push('/play');
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
      router.push('/play');
    }
  }

  // Google login
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }, // ✅ no /agb
    });
  }

  // Facebook login
  async function handleFacebookLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` }, // ✅ no /agb
    });
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1>Login to AGB</h1>
        <form onSubmit={handleLogin} className="card" style={{ marginTop: 20, display: 'grid', gap: 12 }}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="input"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input"
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <button type="button" onClick={handleSignup} className="btn btn-ghost" disabled={loading}>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleGoogleLogin} className="btn btn-primary">Sign in with Google</button>
          <button onClick={handleFacebookLogin} className="btn btn-primary">Sign in with Facebook</button>
        </div>
      </div>
    </main>
  );
}
