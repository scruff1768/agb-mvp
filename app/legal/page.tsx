import Link from "next/link";

export const dynamic = "force-static";

export default function LegalHubPage() {
  const items = [
    { href: "/legal/disclaimer", label: "Disclaimer" },
    { href: "/legal/terms", label: "Terms & Conditions" },
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/legal/cookies", label: "Cookie Policy" },
    { href: "/legal/community", label: "Community Guidelines" },
    { href: "/legal/ip", label: "Copyright & IP Policy" },
  ];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-200">
      <h1 className="mb-2 text-3xl font-bold">Legal</h1>
      <p className="mb-8 text-slate-400">
        These are placeholder documents for the public playtest.
      </p>

      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="underline hover:text-white">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <Link href="/" className="text-sm underline hover:text-white">
          ← Back to Landing
        </Link>
      </div>
    </main>
  );
}
