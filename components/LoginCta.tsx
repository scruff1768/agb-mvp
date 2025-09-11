// components/LoginCta.tsx
"use client";

import Link from "next/link";

export default function LoginCta() {
  // Public build: auth is disabled, so present direct links.
  // If you re-enable auth later, you can restore the Supabase OAuth button here.
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <h2 className="text-xl font-semibold">Amica Guardian Battles</h2>
      <p className="text-sm opacity-80">Jump in and play right now — no login required.</p>

      <div className="flex gap-3">
        <Link
          href="/agb/play?source=local"
          className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Play Now
        </Link>

        <Link
          href="/agb/hub"
          className="rounded-lg px-4 py-2 border border-neutral-300 hover:bg-neutral-100 transition"
        >
          Enter Hub
        </Link>
      </div>

      <p className="text-xs opacity-60">
        (Authentication temporarily disabled for public testing.)
      </p>
    </div>
  );
}
