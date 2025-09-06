import Link from 'next/link';

export default function LandingPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-wrap">
          <h1>Amica Guardian Battles</h1>
          <p className="lead">
            A fast, strategic Top-Trumps-style battler set in the Amica universe.
            Build your deck, master your faction, and outplay your rivals.
          </p>
          <div className="hero-cta" role="group" aria-label="Primary actions">
            <Link href="/play" className="btn btn-primary" aria-label="Play now">
              Play Now
            </Link>
            <Link href="/login" className="btn btn-ghost" aria-label="Sign in">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" aria-labelledby="features-title">
        <div className="container">
          <h2 id="features-title">Why you’ll love AGB</h2>
          <div style={{ height: 12 }} />
          <div className="grid grid-3">
            <article className="card" aria-label="Feature: Quick to learn">
              <h3>Quick to Learn</h3>
              <p>Pick a stat, compare, win the card. Simple rules—surprising depth.</p>
            </article>
            <article className="card" aria-label="Feature: Factions & Lore">
              <h3>Factions &amp; Lore</h3>
              <p>Highlanders, Keepers of the Crypt, and more—each with a distinct identity.</p>
            </article>
            <article className="card" aria-label="Feature: Built for speed">
              <h3>Built for Speed</h3>
              <p>Snappy rounds and responsive UI keep the action flowing.</p>
            </article>
            <article className="card" aria-label="Feature: Future-ready">
              <h3>Future-Ready</h3>
              <p>Supabase-powered profiles, cloud saves, and upcoming ranked play.</p>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" aria-labelledby="how-title">
        <div className="container">
          <h2 id="how-title">How it works</h2>
          <div style={{ height: 12 }} />
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 16 }}>
            <div className="card step">
              <div className="step-num" aria-hidden="true">1</div>
              <div>
                <h3>Create / Sign In</h3>
                <p>Use email, Google, or Facebook (coming soon) to jump in fast.</p>
              </div>
            </div>
            <div className="card step">
              <div className="step-num" aria-hidden="true">2</div>
              <div>
                <h3>Pick a Stat</h3>
                <p>Choose the best stat on your card. Highest value wins the round.</p>
              </div>
            </div>
            <div className="card step">
              <div className="step-num" aria-hidden="true">3</div>
              <div>
                <h3>Win the Deck</h3>
                <p>Capture all opponent cards to win. Clean, competitive fun.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
