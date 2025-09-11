// app/battle/ranked/page.tsx
import Link from "next/link";

export default function RankedComingSoon() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-white">Ranked</h1>
      <p className="mt-3 text-slate-300">
        The competitive ladder is <span className="font-semibold text-slate-200">coming soon</span>.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/play"
          className="rounded-xl border border-emerald-600/60 bg-emerald-700/20 px-4 py-2 text-emerald-200 hover:bg-emerald-700/30"
        >
          ▶ Play vs AI (Unranked)
        </Link>
        <Link
          href="/battle"
          className="rounded-xl border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
        >
          ← Back to Battle Menu
        </Link>
        <Link
          href="/hub"
          className="rounded-xl border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
        >
          ⌂ Back to Hub
        </Link>
      </div>
    </main>
  );
}
