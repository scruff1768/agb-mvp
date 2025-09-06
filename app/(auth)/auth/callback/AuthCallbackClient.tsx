'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [msg, setMsg] = useState('Finishing sign-in…');

  useEffect(() => {
    async function run() {
      const code = params.get('code');
      const error = params.get('error_description') || params.get('error');

      if (error) {
        setMsg(`Sign-in error: ${error}`);
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        }
        router.replace('/play');
      } catch (e: any) {
        setMsg(`Sign-in failed: ${e?.message || 'Unknown error'}`);
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 480 }}>
        <h1>Signing you in…</h1>
        <p className="lead" style={{ marginTop: 8 }}>{msg}</p>
      </div>
    </main>
  );
}
