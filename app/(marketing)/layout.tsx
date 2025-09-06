import type { Metadata, Viewport } from 'next';
import '../globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL('https://teamscruff.com'),
  title: {
    default: 'Amica Guardian Battles (AGB) — Team Scruff',
    template: '%s — AGB • Team Scruff',
  },
  description:
    'AGB is a fast, strategic Top-Trumps-style card battler set in the Amica universe. Build decks, outplay rivals, and climb the ranks.',
  openGraph: {
    type: 'website',
    url: '/agb',
    title: 'Amica Guardian Battles (AGB) — Team Scruff',
    siteName: 'Team Scruff — AGB',
    description:
      'AGB is a fast, strategic Top-Trumps-style card battler set in the Amica universe.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amica Guardian Battles (AGB) — Team Scruff',
    description:
      'Top-Trumps-style card battler set in the Amica universe.',
  },
  alternates: { canonical: '/agb' },
};

export const viewport: Viewport = {
  themeColor: '#0b0f14',
  colorScheme: 'dark',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container navbar-inner" aria-label="Main Navigation">
            <div className="nav-left">
              <span aria-hidden="true" className="badge">AGB</span>
              <Link href="/" className="brand" aria-label="Go to AGB home">
                Team Scruff — AGB
              </Link>
            </div>
            <div className="nav-links">
              <Link className="nav-link" href="/play">Play</Link>
              <Link className="btn btn-ghost" href="/login">Login</Link>
            </div>
          </div>
        </nav>

        {children}

        <footer className="footer">
          <div className="container" role="contentinfo">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>© {new Date().getFullYear()} Team Scruff. All rights reserved.</div>
              <div className="footer-links">
                <Link href="/play">Play</Link>
                <Link href="/login">Login</Link>
                <Link href="https://teamscruff.com" target="_blank" rel="noopener noreferrer">Main Site</Link>
                <Link href="mailto:hello@teamscruff.com">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
