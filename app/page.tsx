// app/page.tsx
"use client";

import Link from "next/link";

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        background: "#0b0f16",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          textAlign: "left",
          border: "1px solid #222",
          padding: "2rem",
          borderRadius: 12,
          background: "#111",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 32 }}>Amica Guardian Battles</h1>
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          Collect, craft, and conquer. Build decks, duel AI or players, and climb the
          Pathways of Amica.
        </p>

        {/* Single action for the public playtest */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/hub"
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 10,
              display: "inline-block",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
            }}
          >
            Enter Hub
          </Link>
        </div>

        {/* Feature list */}
        <ul style={{ marginTop: 20, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>⚔️ Battle Modes: PvAI, PvP, Ranked</li>
          <li>🧩 Deck Builder: craft up to 5 loadouts</li>
          <li>🗄️ Archive: browse your collection</li>
          <li>💎 Treasure Vault: open, earn, upgrade</li>
          <li>🏆 Hall of Glory: milestones &amp; trophies</li>
        </ul>

        {/* Footer links row (kept as-is) */}
        <div
          style={{
            marginTop: 24,
            borderTop: "1px solid #222",
            paddingTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            fontSize: 12,
            color: "#A8B1C3",
          }}
        >
          <Link href="/legal/disclaimer" style={{ color: "inherit" }}>
            Disclaimer
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/legal/terms" style={{ color: "inherit" }}>
            Terms &amp; Conditions
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/legal/privacy" style={{ color: "inherit" }}>
            Privacy Policy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/legal/cookies" style={{ color: "inherit" }}>
            Cookie Policy
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/legal/community" style={{ color: "inherit" }}>
            Community Guidelines
          </Link>
          <span style={{ opacity: 0.3 }}>•</span>
          <Link href="/legal/ip" style={{ color: "inherit" }}>
            Copyright &amp; IP Policy
          </Link>
          <div style={{ marginLeft: "auto", opacity: 0.6 }}>© {year} Amica AGB</div>
        </div>
      </div>
    </main>
  );
}
