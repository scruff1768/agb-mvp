import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-200">
      <h1 className="mb-4 text-3xl font-bold">Disclaimer</h1>
      <p className="mb-8 text-slate-400">
        This is a placeholder for the Cookie Policy document. Content will be added here later.
      </p>

      <div className="flex gap-4">
        <Link href="/legal" className="text-sm underline hover:text-white">
          ← Back to Legal Hub
        </Link>
        <Link href="/" className="text-sm underline hover:text-white">
          Back to Landing
        </Link>
      </div>
    </main>
  );
}
