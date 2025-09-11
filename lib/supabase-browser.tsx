// lib/supabase-browser.tsx
'use client';

import React from 'react';
import {
  createClient,
  type AuthChangeEvent,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js';

/** =========================
 *  Client (real or stub)
 *  ========================= */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function makeBrowserClient(): SupabaseClient | any {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });
  }

  // --- Stub client (no envs) — keeps UI/types happy on Vercel build ---
  const stub: any = {
    auth: {
      async getSession(): Promise<{ data: { session: Session | null }; error: null }> {
        return { data: { session: null }, error: null };
      },
      async signOut(): Promise<{ error: null }> {
        return { error: null };
      },
      // Match supabase-js v2 return shape; cast to keep TS satisfied.
      onAuthStateChange(
        cb: (event: AuthChangeEvent, session: Session | null) => void | Promise<void>
      ) {
        cb('SIGNED_OUT', null); // <- uppercase constant matches AuthChangeEvent union
        return {
          data: {
            subscription: {
              id: 'stub',
              callback: cb,
              state: 'active',
              unsubscribe: () => {},
            },
          },
        } as any;
      },
    },
  };
  return stub;
}

/** =========================
 *  Context & Provider
 *  ========================= */
type Ctx = {
  client: SupabaseClient | any;
  user: Session['user'] | null;
  ready: boolean;
};

const SupabaseCtx = React.createContext<Ctx | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => makeBrowserClient());
  const [user, setUser] = React.useState<Session['user'] | null>(null);
  const [ready, setReady] = React.useState(false);

  // Initial session fetch
  React.useEffect(() => {
    let mounted = true;
    client.auth
      .getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, [client]);

  // Subscribe to auth state changes
  React.useEffect(() => {
    const { data } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => {
      try {
        data?.subscription?.unsubscribe?.();
      } catch {}
    };
  }, [client]);

  const value = React.useMemo<Ctx>(() => ({ client, user, ready }), [client, user, ready]);

  return <SupabaseCtx.Provider value={value}>{children}</SupabaseCtx.Provider>;
}

/** =========================
 *  Hooks
 *  ========================= */
export function useSupabaseClient(): SupabaseClient | any {
  const ctx = React.useContext(SupabaseCtx);
  if (!ctx) throw new Error('useSupabaseClient must be used within <SupabaseProvider>');
  return ctx.client;
}

export function useUser(): Session['user'] | null {
  const ctx = React.useContext(SupabaseCtx);
  if (!ctx) throw new Error('useUser must be used within <SupabaseProvider>');
  return ctx.user;
}

export function useAuthReady(): boolean {
  const ctx = React.useContext(SupabaseCtx);
  if (!ctx) throw new Error('useAuthReady must be used within <SupabaseProvider>');
  return ctx.ready;
}
