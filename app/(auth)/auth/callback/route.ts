// app/(auth)/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * DEV-ROBUST callback:
 * 1) Performs PKCE code exchange using auth-helpers (reads the PKCE cookie).
 * 2) Explicitly sets sb-access-token / sb-refresh-token on the redirect response
 *    if Supabase didn’t do it automatically (helps in tricky local setups).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });

  // Always prepare the redirect response first
  const redirect = NextResponse.redirect(new URL('/agb/hub', url.origin));

  // If a code is present, exchange it for a session (use FULL URL so helper parses all params)
  const code = url.searchParams.get('code');
  if (code) {
    await supabase.auth.exchangeCodeForSession(request.url);

    // DEV fallback: read the session and write cookies manually if needed
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (session) {
      const access = session.access_token;
      const refresh = session.refresh_token;

      // Only set if not already present (auth-helpers should normally set these)
      if (access) {
        redirect.cookies.set('sb-access-token', access, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: false, // ok on localhost
        });
      }
      if (refresh) {
        redirect.cookies.set('sb-refresh-token', refresh, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
        });
      }
    }
  }

  return redirect;
}
