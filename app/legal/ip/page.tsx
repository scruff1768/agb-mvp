import Link from "next/link";

export const dynamic = "force-static";

export default function IPPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-200">
      <h1 className="mb-4 text-3xl font-bold">Copyright &amp; IP Policy</h1>
      <p className="mb-8 text-slate-400">
        This is a placeholder for the Copyright & Intellectual Property Policy. Content will be added later.
      </p>

      <nav className="flex flex-wrap items-center gap-4">
        <Link href="/legal/community" className="text-sm underline hover:text-white">← Previous: Community Guidelines</Link>
        <Link href="/legal/disclaimer" className="text-sm underline hover:text-white">Next: Disclaimer →</Link>
        <span className="mx-2 opacity-40">|</span>
        <Link href="/legal" className="text-sm underline hover:text-white">Legal Hub</Link>
        <Link href="/" className="text-sm underline hover:text-white">Landing</Link>
      </nav>
    </main>
  );
}
