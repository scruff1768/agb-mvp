'use client';

import React from 'react';
import HubTile from '@/components/HubTile';

const BASE = '/agb'; // must match next.config.ts basePath
const IMG = (file: string) => `${BASE}/images/${file}`;

export default function HubPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Amica Hub</h1>
        <p className="mt-1 text-slate-300">Choose where you’d like to go.</p>
      </header>

      <section className="flex flex-wrap justify-center gap-8">
        <HubTile
          title="Battle"
          subtitle="Fight the AI, a player, or go Ranked"
          href={`${BASE}/battle`}
          imageUrl={IMG('battle-bg.png')}
        />

        <HubTile
          title="Archive"
          subtitle="Browse all the cards you own"
          href={`${BASE}/archive`}
          imageUrl={IMG('archive-bg.png')}
        />

        <HubTile
          title="Deck Builder"
          subtitle="Create and save up to 5 loadouts"
          href={`${BASE}/deck-builder`}
          imageUrl={IMG('deckbuilder-bg.png')}
        />

        <HubTile
          title="Treasure Vault"
          subtitle="Buy keys, open vaults, get cards"
          href={`${BASE}/vault`}
          imageUrl={IMG('vault-bg.png')}
        />

        <HubTile
          title="Hall of Glory"
          subtitle="Pathways of Amica & Trophy Room"
          href={`${BASE}/hall-of-glory`}
          imageUrl={IMG('glory-bg.png')}
        />
      </section>
    </main>
  );
}
