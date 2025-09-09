// lib/supabase.ts
import { createClient as createBrowserClientRaw, SupabaseClient } from '@supabase/supabase-js'
import {
  createServerComponentClient as createServerComponentClientHelper,
  createRouteHandlerClient as createRouteHandlerClientHelper,
  // createMiddlewareClient can be added later if we introduce middleware
} from '@supabase/auth-helpers-nextjs'
import type { CookieOptions } from '@supabase/auth-js'
import { cookies as nextCookies } from 'next/headers'

/**
 * Environment
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev to avoid silent no-cookie bugs
  console.warn('[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Shared cookie options (dev-friendly)
 * You can tweak sameSite to 'lax' if you ever see cross-site cookie issues during local testing.
 */
export const defaultCookieOptions: Partial<CookieOptions> = {
  sameSite: 'lax',
  path: '/',
}

/**
 * 1) BROWSER CLIENT (for client components)
 * PKCE flow enabled. Detects session in URL (hash or query) in browser only.
 */
export function createBrowserClient(): SupabaseClient {
  return createBrowserClientRaw(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      cookieOptions: defaultCookieOptions,
    },
  })
}

/**
 * 2) SERVER COMPONENT CLIENT (for protecting pages like /agb/hub)
 * This binds to Next.js App Router cookies() so Supabase can read the session server-side.
 */
export function createServerComponentClient() {
  return createServerComponentClientHelper({ cookies: nextCookies })
}

/**
 * 3) ROUTE HANDLER CLIENT (for /agb/auth/callback)
 * Critical: this binds to the Request/Response cookie store used by the route handler,
 * allowing exchangeCodeForSession to SET sb-access-token / sb-refresh-token cookies.
 */
export function createRouteHandlerClient() {
  return createRouteHandlerClientHelper({ cookies: nextCookies })
}
