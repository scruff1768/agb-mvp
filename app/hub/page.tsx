// app/hub/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase';
import HubTile from '@/components/HubTile';
import SignOutBtn from '@/components/SignOutBtn';

const BASE = '/agb'; // only for static assets in /public

export default async function HubPage() {
  const supabase = createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // basePath is applied automatically -> /agb/login
    redirect('/login');
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white">Amica Hub</h1>
          <p className="mt-1 text-slate-300">Choose where you’d like to go.</p>
        </div>

        <div className="flex items-center gap-3">
          <SignOutBtn />
        </div>
      </header>

      <section className="flex flex-wrap justify-center gap-8">
        <HubTile
          title="Battle"
          subtitle="Fight the AI, a player, or go Ranked"
          href="/battle"
          imageUrl={`${BASE}/images/battle-bg.png`}
        />
        <HubTile
          title="Archive"
          subtitle="Browse all the cards you own"
          href="/archive"
          imageUrl={`${BASE}/images/archive-bg.png`}
        />
        <HubTile
          title="Deck Builder"
          subtitle="Create and save up to 5 loadouts"
          href="/deck-builder"
          imageUrl={`${BASE}/images/deckbuilder-bg.png`}
        />
        <HubTile
          title="Treasure Vault"
          subtitle="Buy keys, open vaults, get cards"
          href="/vault"
          imageUrl={`${BASE}/images/vault-bg.png`}
        />
        <HubTile
          title="Hall of Glory"
          subtitle="Pathways of Amica & Trophy Room"
          href="/hall-of-glory"
          imageUrl={`${BASE}/images/glory-bg.png`}
        />
      </section>
    </main>
  );
}
