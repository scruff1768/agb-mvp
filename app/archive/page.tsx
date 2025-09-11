// app/archive/page.tsx
import Link from "next/link";

export default function ArchiveComingSoon() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-white">Archive</h1>
      <p className="mt-3 text-slate-300">Coming Soon</p>
      <Link
        href="/hub"
        className="mt-8 inline-block rounded-xl border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
      >
        ← Back to Hub
      </Link>
    </main>
  );
}
