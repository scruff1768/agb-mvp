// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type MinimalAuthAPI = {
  getSession: () => Promise<{ data: { session: any | null }; error: null }>;
  signOut: () => Promise<{ error: null }>;
};
type MinimalClient = {
  auth: MinimalAuthAPI;
} & Partial<SupabaseClient>;

function makeClientOrStub(): MinimalClient {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }) as unknown as MinimalClient;
  }
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
  } as MinimalClient;
}

export const supabase = makeClientOrStub();
export function createBrowserClient(): MinimalClient {
  return makeClientOrStub();
}
export function createServerComponentClient(): MinimalClient {
  return makeClientOrStub();
}
