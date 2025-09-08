// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const BASE = '/agb';

// Which paths should be public
function isPublicPath(path: string) {
  if (path === '/' || path === `${BASE}/login` || path.startsWith(`${BASE}/auth`)) return true;

  // static & image assets
  if (path.startsWith('/_next')) return true;
  if (path.startsWith('/favicon')) return true;
  if (path.startsWith(`${BASE}/images`)) return true;

  return false;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();
  const path = url.pathname;

  // If not logged in → send to login
  if (!session && !isPublicPath(path)) {
    url.pathname = `${BASE}/login`;
    return NextResponse.redirect(url);
  }

  // If logged in and at root or login → send to hub
  if (session && (path === '/' || path === `${BASE}/` || path === `${BASE}/login`)) {
    url.pathname = `${BASE}/hub`;
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
