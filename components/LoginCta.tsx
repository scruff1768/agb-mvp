'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginCta() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/agb/auth/callback`,
          // Prefer PKCE/code flow; if your supabase-js version ignores flowType,
          // our /login page already has a hash fallback.
          flowType: 'pkce',
          // queryParams: { response_type: 'code' }, // optional fallback
        },
      });
      if (error) throw error;
    } catch (e: any) {
      console.error('Google sign-in error:', e?.message || e);
      alert('Could not start Google sign-in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={signInWithGoogle}
      disabled={loading}
      className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60"
    >
      {loading ? 'Starting…' : 'Continue with Google'}
    </button>
  );
}
