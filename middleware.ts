import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

// Only protect these paths. No normalization, no extras.
const PROTECTED = [
  "/agb/hub",
  "/agb/play",
  "/agb/archive",
  "/agb/deck-builder",
  "/agb/vault",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run on protected paths
  const needsAuth =
    PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not signed in → send to /agb/login with ?next=<original>
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/agb/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Signed in → continue
  return res;
}

// Run ONLY on the protected routes above
export const config = {
  matcher: [
    "/agb/hub",
    "/agb/hub/:path*",
    "/agb/play",
    "/agb/play/:path*",
    "/agb/archive",
    "/agb/archive/:path*",
    "/agb/deck-builder",
    "/agb/deck-builder/:path*",
    "/agb/vault",
    "/agb/vault/:path*",
  ],
};
