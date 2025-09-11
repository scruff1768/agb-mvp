// app/api/cards/local/route.ts
import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** -------------------------------------------------------------------------
 * Canonical domains
 * --------------------------------------------------------------------------*/
const UMBRELLAS = [
  "Vanguard",
  "Swiftborn",
  "Caster",
  "Support",
  "Healer",
  "Hybrid",
  "Specialist",
] as const;

const ASCENSIONS = ["Hero", "Champion", "Guardian"] as const;

type Umbrella = (typeof UMBRELLAS)[number];
type Ascension = (typeof ASCENSIONS)[number];

/** -------------------------------------------------------------------------
 * Input / Output Types
 * --------------------------------------------------------------------------*/
// Raw card as stored in public/amica_cards.json (legacy-friendly)
type AGBCardRaw = {
  id: string;
  name: string;
  faction: "Highlanders" | "Keepers";
  class: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";

  // Legacy field that may contain either umbrella OR an ascension rank
  heroType?: string;

  // New explicit ascension
  ascensionRank?: string;

  // Keep attackType unchanged (for now)
  attackType: "physical" | "magical" | "support";

  // Flat stats in the source JSON (API will wrap into stats object)
  hp: number;
  defense: number;
  power: number;
  strength: number;
  intelligence: number;
  speed: number;
  prana: number;
  stamina: number;
  focus: number;

  // Optional image path (relative to /public) or full URL
  image?: string;
};

// Shaped card returned by this API
type AGBCardShaped = {
  id: string;
  name: string;
  faction: "Highlanders" | "Keepers";
  class: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  heroType: Umbrella; // umbrella / family
  ascensionRank: Ascension; // Hero | Champion | Guardian
  attackType: "physical" | "magical" | "support";
  image?: string; // passed through if present in raw
  stats: {
    hp: number;
    defense: number;
    power: number;
    strength: number;
    intelligence: number;
    speed: number;
    prana: number;
    stamina: number;
    focus: number;
  };
};

/** -------------------------------------------------------------------------
 * In-memory cache & loader
 * --------------------------------------------------------------------------*/
let CACHE: AGBCardRaw[] | null = null;

function loadCards(): AGBCardRaw[] {
  if (CACHE) return CACHE;
  const filePath = join(process.cwd(), "public", "amica_cards.json");
  const json = readFileSync(filePath, "utf8");
  CACHE = JSON.parse(json) as AGBCardRaw[];
  return CACHE;
}

/** -------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------*/
function isUmbrella(v: string | undefined | null): v is Umbrella {
  return !!v && (UMBRELLAS as readonly string[]).includes(v);
}
function isAscension(v: string | undefined | null): v is Ascension {
  return !!v && (ASCENSIONS as readonly string[]).includes(v);
}

/**
 * Best-effort umbrella derivation from the class name.
 * Extend the regexes as class taxonomy grows.
 */
function deriveUmbrellaFromClass(className: string): Umbrella {
  const c = (className || "").toLowerCase();

  // Vanguard (frontline melee / bruisers)
  if (
    /(tank|guardian|juggernaut|brute|warrior|fighter|barbarian|paladin|crusader|holy\s*knight|monk|martial)/.test(
      c
    )
  ) {
    return "Vanguard";
  }

  // Swiftborn (speed / skirmish)
  if (
    /(archer|ranger|hunter|assassin|rogue|thief|skirmisher|scout|speedster)/.test(
      c
    )
  ) {
    return "Swiftborn";
  }

  // Healer (pure sustain)
  if (/(healer|cleric|priest|sage|medic|mender|restorer)/.test(c)) {
    return "Healer";
  }

  // Support (utility / traps / control)
  if (
    /(bard|tactician|engineer|trap|trickster|controller|warden|keeper|alchemist|herbalist)/.test(
      c
    )
  ) {
    return "Support";
  }

  // Caster (magical dps / summoner / morph)
  if (
    /(mage|wizard|sorcerer|elementalist|necromancer|conjurer|shaman|druid|enchanter|illusionist|morpher|summoner)/.test(
      c
    )
  ) {
    return "Caster";
  }

  // Hybrid (mixed identities)
  if (
    /(battle[-\s]?mage|spellblade|death\s?knight|dark\s?paladin|mystic\s?knight|rune\s?knight|magical\s?ranger)/.test(
      c
    )
  ) {
    return "Hybrid";
  }

  // Fallback
  return "Specialist";
}

/**
 * Normalize umbrella + ascension from legacy/new inputs.
 * - If `ascensionRank` is valid, use it. Otherwise, if `heroType` is an ascension, use that.
 * - Determine umbrella: if `heroType` is a valid umbrella use it, else derive from class.
 */
function normalizeTypeAndAscension(raw: AGBCardRaw): {
  umbrella: Umbrella;
  ascension: Ascension;
} {
  const maybeUmbrella = raw.heroType;
  const maybeAsc = raw.ascensionRank;

  const ascension: Ascension = isAscension(maybeAsc)
    ? maybeAsc
    : isAscension(maybeUmbrella)
    ? (maybeUmbrella as Ascension)
    : "Hero";

  const umbrella: Umbrella = isUmbrella(maybeUmbrella)
    ? (maybeUmbrella as Umbrella)
    : deriveUmbrellaFromClass(raw.class);

  return { umbrella, ascension };
}

/** -------------------------------------------------------------------------
 * Route
 * --------------------------------------------------------------------------*/
export async function GET(request: Request) {
  const url = new URL(request.url);

  // Existing filters
  const faction = url.searchParams.get("faction"); // e.g. "Highlanders"
  const rarity = url.searchParams.get("rarity"); // e.g. "Epic"
  const klass = url.searchParams.get("class"); // substring match
  const q = url.searchParams.get("q"); // name substring

  // New filters
  const heroType = url.searchParams.get("heroType"); // umbrella filter
  const ascension = url.searchParams.get("ascension"); // "Hero" | "Champion" | "Guardian"

  // Load + basic filters (on raw)
  let data = loadCards();
  if (faction) data = data.filter((c) => c.faction === faction);
  if (rarity) data = data.filter((c) => c.rarity === rarity);
  if (klass)
    data = data.filter((c) =>
      c.class.toLowerCase().includes(klass.toLowerCase())
    );
  if (q)
    data = data.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));

  // Shape + normalize to API contract
  const shaped: AGBCardShaped[] = data.map((c) => {
    const { umbrella, ascension } = normalizeTypeAndAscension(c);
    return {
      id: c.id,
      name: c.name,
      faction: c.faction,
      class: c.class,
      rarity: c.rarity,
      heroType: umbrella,
      ascensionRank: ascension,
      attackType: c.attackType, // unchanged
      image: c.image, // pass-through if present
      stats: {
        // Canonical 9 (locked)
        hp: c.hp,
        defense: c.defense,
        power: c.power,
        strength: c.strength,
        intelligence: c.intelligence,
        speed: c.speed,
        prana: c.prana,
        stamina: c.stamina,
        focus: c.focus,
      },
    };
  });

  // Apply new-field filters on shaped data
  let filtered = shaped;
  if (heroType && isUmbrella(heroType)) {
    filtered = filtered.filter((c) => c.heroType === heroType);
  }
  if (ascension && isAscension(ascension)) {
    filtered = filtered.filter((c) => c.ascensionRank === ascension);
  }

  return NextResponse.json(filtered);
}
