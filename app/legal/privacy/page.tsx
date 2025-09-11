import Link from "next/link";

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-200">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-8 text-slate-400">
        This is a placeholder for the Privacy Policy. Content will be added later.
      </p>

      <nav className="flex flex-wrap items-center gap-4">
        <Link href="/legal/terms" className="text-sm underline hover:text-white">← Previous: Terms &amp; Conditions</Link>
        <Link href="/legal/cookies" className="text-sm underline hover:text-white">Next: Cookie Policy →</Link>
        <span className="mx-2 opacity-40">|</span>
        <Link href="/legal" className="text-sm underline hover:text-white">Legal Hub</Link>
        <Link href="/" className="text-sm underline hover:text-white">Landing</Link>
      </nav>
    </main>
  );
}
