// app/battle/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import HubTile from "@/components/HubTile";

const BASE = "/agb"; // only for static assets in /public
const IMG = (file: string) => `${BASE}/images/${file}`;

export default function BattlePicker() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white">Choose Battle Mode</h1>
          <p className="mt-1 text-slate-300">
            Pick a mode to begin. You can fine-tune matchmaking rules later.
          </p>
        </div>
        <Link
          href="/hub"
          className="rounded-lg border border-slate-700/60 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          ← Back to Hub
        </Link>
      </header>

      <section className="flex flex-wrap justify-center gap-8">
        <HubTile
          title="vs AI (Unranked)"
          subtitle="Quick match against an AI opponent"
          href="/play" // ready today
          imageUrl={IMG("pvsai.png")}
        />

        <HubTile
          title="vs Player (Unranked)"
          subtitle="Invite a friend or find a casual match"
          href="/battle/pvp" // Coming Soon page
          imageUrl={IMG("pvp.png")}
        />

        <HubTile
          title="Ranked"
          subtitle="Competitive ladder with MMR"
          href="/battle/ranked" // Coming Soon page
          imageUrl={IMG("ranked.png")}
        />
      </section>
    </main>
  );
}
