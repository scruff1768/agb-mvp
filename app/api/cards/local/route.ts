import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type AGBCard = {
  id: string;
  name: string;
  faction: "Highlanders" | "Keepers";
  class: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  heroType: "Hero" | "Champion" | "Guardian";
  attackType: "physical" | "magical" | "support";
  hp: number; prana: number; focus: number; stamina: number;
  strength: number; intelligence: number; defense: number; speed: number; power: number;
};

let CACHE: AGBCard[] | null = null;

function loadCards(): AGBCard[] {
  if (CACHE) return CACHE;
  const filePath = join(process.cwd(), "public", "amica_cards.json");
  const json = readFileSync(filePath, "utf8");
  CACHE = JSON.parse(json) as AGBCard[];
  return CACHE;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const faction = url.searchParams.get("faction");   // "Highlanders" | "Keepers"
  const rarity  = url.searchParams.get("rarity");    // e.g. "Epic"
  const klass   = url.searchParams.get("class");     // substring
  const q       = url.searchParams.get("q");         // name substring

  let data = loadCards();

  if (faction) data = data.filter(c => c.faction === faction);
  if (rarity)  data = data.filter(c => c.rarity === rarity);
  if (klass)   data = data.filter(c => c.class.toLowerCase().includes(klass.toLowerCase()));
  if (q)       data = data.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));

  return NextResponse.json(data);
}
