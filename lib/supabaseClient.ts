// lib/supabaseClient.ts
'use client';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true, // 👈 important for hash flow
      autoRefreshToken: true,
    },
  }
);
