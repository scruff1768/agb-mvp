import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function LegalHub() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "3rem 1.5rem",
        color: "#E5E7EB",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Legal & Policies</h1>
      <p style={{ color: "#9CA3AF", marginBottom: 24 }}>
        Please review the following policies to understand your rights,
        responsibilities, and our commitments as you enjoy Amica Guardian Battles.
      </p>

      <ul style={{ paddingLeft: 18, lineHeight: 1.9 }}>
        <li><Link href="/legal/disclaimer" style={{ textDecoration: "underline" }}>Disclaimer</Link></li>
        <li><Link href="/legal/terms" style={{ textDecoration: "underline" }}>Terms &amp; Conditions</Link></li>
        <li><Link href="/legal/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</Link></li>
        <li><Link href="/legal/cookies" style={{ textDecoration: "underline" }}>Cookie Policy</Link></li>
        <li><Link href="/legal/community" style={{ textDecoration: "underline" }}>Community Guidelines</Link></li>
        <li><Link href="/legal/ip" style={{ textDecoration: "underline" }}>Copyright &amp; IP Policy</Link></li>
      </ul>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          fontSize: 14,
        }}
      >
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back to Landing
        </Link>
        {session && (
          <Link href="/hub" style={{ textDecoration: "underline" }}>
            Go to Hub →
          </Link>
        )}
      </div>
    </main>
  );
}
