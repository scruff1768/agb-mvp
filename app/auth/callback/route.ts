// app/auth/callback/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

/**
 * OAuth PKCE (authorization code) flow:
 * Supabase redirects here with ?code=... then we exchange it for a server session cookie.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/hub';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  const dest = next.startsWith('/agb') ? next : `/agb${next}`;
  return NextResponse.redirect(new URL(dest, url.origin));
}

/**
 * Implicit hash flow fallback:
 * The login page will POST { access_token, refresh_token } here.
 * We set the server session cookie and respond 200.
 */
export async function POST(request: Request) {
  const { access_token, refresh_token } = await request.json();

  if (!access_token || !refresh_token) {
    return NextResponse.json({ ok: false, error: 'Missing tokens' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  // Set cookie-based session on the server so SSR/middleware see it
  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
