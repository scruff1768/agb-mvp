'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SignOutBtn() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login'); // => /agb/login
  }

  return (
    <button
      onClick={handleSignOut}
      className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
    >
      Sign out
    </button>
  );
}
