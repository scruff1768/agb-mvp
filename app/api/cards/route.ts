import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * /api/cards
 * - Default: returns a *plain array* of cards (shuffled & sliced) for backward-compat with play page
 * - Optional: /api/cards?format=object -> { deck: Card[], total: number }
 * - Supports: /api/cards?size=20, /api/cards?faction=Highlanders|Keepers
 */

type Faction = 'Highlanders' | 'Keepers';
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
type HeroType = 'Tank' | 'DPS' | 'Support' | 'Hybrid' | 'Specialist' | string;
type AttackType = 'Physical' | 'Magical' | 'Mental' | 'Divine' | 'Poison' | 'Elemental' | string;

type StatKey =
  | 'hp' | 'prana' | 'focus' | 'stamina' | 'strength'
  | 'intelligence' | 'defense' | 'speed' | 'power';

type CardStats = Record<StatKey, number>;
interface CanonMeta {
  id: string;
  name: string;
  faction: Faction;
  class: string;
  rarity: Rarity;
  heroType: HeroType;
  attackType: AttackType;
}
interface Card extends CanonMeta {
  image: string;
  stats: CardStats;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams;
  const format = (qs.get('format') || 'array').toLowerCase(); // 'array' | 'object'
  const factionFilter = qs.get('faction');
  const size = Math.max(1, Math.min(60, Number(qs.get('size')) || 20));

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseOk = Boolean(url && anon);

    let cards: Card[];

    if (!supabaseOk) {
      cards = synthesizeAll(CANONICAL_LIST);
    } else {
      const supabase = createClient(url!, anon!, { auth: { persistSession: false } });
      const { data, error } = await supabase
        .from('cards')
        .select(`
          id,
          name,
          faction,
          class,
          rarity,
          hero_type,
          attack_type,
          image,
          hp, prana, focus, stamina, strength, intelligence, defense, speed, power
        `);

      if (error || !data || data.length === 0) {
        cards = synthesizeAll(CANONICAL_LIST);
      } else {
        const dbMap = new Map<string, any>();
        for (const row of data) {
          const id = normId(row.id);
          if (id) dbMap.set(id, row);
        }
        cards = CANONICAL_LIST.map((c, idx) => {
          const db = dbMap.get(c.id);
          const base: Card = {
            ...c,
            image: `/images/${c.id}.png`,
            stats: genStatsFor(c, idx),
          };
          if (!db) return base;
          return {
            ...base,
            class: db.class ?? base.class,
            rarity: (db.rarity as Rarity) ?? base.rarity,
            heroType: db.hero_type ?? db.heroType ?? base.heroType,
            attackType: db.attack_type ?? db.attackType ?? base.attackType,
            faction: (db.faction as Faction) ?? base.faction,
            stats: {
              hp: num(db.hp, base.stats.hp),
              prana: num(db.prana, base.stats.prana),
              focus: num(db.focus, base.stats.focus),
              stamina: num(db.stamina, base.stats.stamina),
              strength: num(db.strength, base.stats.strength),
              intelligence: num(db.intelligence, base.stats.intelligence),
              defense: num(db.defense, base.stats.defense),
              speed: num(db.speed, base.stats.speed),
              power: num(db.power, base.stats.power),
            },
          };
        });
      }
    }

    // Filter, shuffle, slice
    const filtered = applyFactionFilter(cards, factionFilter);
    const deck = shuffle(filtered).slice(0, size);

    if (format === 'object') {
      return NextResponse.json({ deck, total: filtered.length }, { status: 200 });
    }
    // Default: plain array (back-compat for existing play page)
    return NextResponse.json(deck, { status: 200 });
  } catch (err: any) {
    console.error('[api/cards] Fatal:', err?.message || err);
    const cards = synthesizeAll(CANONICAL_LIST);
    const filtered = applyFactionFilter(cards, factionFilter);
    const deck = shuffle(filtered).slice(0, size);
    return format === 'object'
      ? NextResponse.json({ deck, total: filtered.length }, { status: 200 })
      : NextResponse.json(deck, { status: 200 });
  }
}

/* ---------------- Canonical list (trimmed comments for brevity) ---------------- */

const H: Faction = 'Highlanders';
const K: Faction = 'Keepers';

const CANONICAL_LIST: CanonMeta[] = [
  meta('00000001', 'Highlands Stable Boy', H, 'Warrior', 'Common',    'Tank',       'Physical'),
  meta('00000002', 'Highlands Stable Master', H, 'Warrior', 'Uncommon','Tank',      'Physical'),
  meta('00000003', 'Highlands Horseman', H, 'Warrior', 'Rare', 'DPS','Physical'),
  meta('00000004', 'Highlands Master Horseman', H, 'Warrior', 'Epic','Hybrid','Physical'),
  meta('00000005', 'Highlands Student', H, 'Mage','Common','DPS','Magical'),
  meta('00000006', 'Highlands Academic', H, 'Mage','Uncommon','DPS','Magical'),
  meta('00000007', 'Highlands Professor', H, 'Mage','Rare','Specialist','Magical'),
  meta('00000008', 'Highlands Scholar', H, 'Healer','Common','Support','Divine'),
  meta('00000009', 'Highlands Medic', H, 'Healer','Uncommon','Support','Divine'),
  meta('0000000A', 'Highlands Surgeon', H, 'Healer','Rare','Support','Divine'),
  meta('0000000B', 'Highlands Priest', H, 'Healer','Epic','Support','Divine'),
  meta('0000000C', 'Highlands Pope', H, 'Healer','Legendary','Support','Divine'),
  meta('0000000D', 'Highlands Slinger', H, 'Sharpshooter','Common','DPS','Physical'),
  meta('0000000E', 'Highlands Archer', H, 'Sharpshooter','Uncommon','DPS','Physical'),
  meta('0000000F', 'Highlands Hitman', H, 'Sharpshooter','Rare','DPS','Physical'),
  meta('00000010', 'Highlands Spy', H, 'Sharpshooter','Epic','Specialist','Mental'),
  meta('00000021', 'Highlands Commander', H, 'Champion','Legendary','Hybrid','Physical'),
  meta('00000022', 'Highlands Mentalist', H, 'Champion','Legendary','Specialist','Mental'),
  meta('00000023', 'Highlands Forrester', H, 'Champion','Legendary','Hybrid','Elemental'),
  meta('00000024', 'Heathcliff - King of the Highlands', H, 'Guardian','Mythic','Hybrid','Physical'),
  meta('00000025', 'Doogen Howzit - Chief Doctor of the Highlands', H, 'Guardian','Mythic','Support','Divine'),
  meta('00000026', 'Elijah Forester - The High Priest of the Highlands', H, 'Guardian','Mythic','Support','Divine'),
  meta('00000027', 'Supreme Knight of the Highlands - Sir Caerlon Saddler', H, 'Guardian','Mythic','Tank','Physical'),
  meta('00000028', 'Brick “Ironshoe” Davidson - The Grand Equestrian of the Highlands', H,'Guardian','Mythic','DPS','Physical'),
  meta('00000029', 'Edward McCallister - Dean of the Highlands', H, 'Guardian','Mythic','Specialist','Mental'),
  meta('0000002A', 'Marshall Westborough - Scout of the Highlands', H, 'Guardian','Mythic','DPS','Physical'),
  meta('0000002B', 'Unknown of the Highlands', H, 'Guardian','Mythic','Hybrid','Elemental'),
  meta('00000011', 'Skeleton Remains of the Crypt', K, 'Warrior','Common','Tank','Physical'),
  meta('00000012', 'Bone Marrow of the Crypt', K, 'Warrior','Uncommon','Tank','Physical'),
  meta('00000013', 'Bone Soldier of the Crypt', K, 'Warrior','Rare','DPS','Physical'),
  meta('00000014', 'Bone General of the Crypt', K, 'Warrior','Epic','Hybrid','Physical'),
  meta('00000015', 'Skeleton Occultist of the Crypt', K, 'Mage','Common','DPS','Magical'),
  meta('00000016', 'Bone Lich of the Crypt', K, 'Mage','Uncommon','Specialist','Magical'),
  meta('00000017', 'Cabalist of the Crypt', K, 'Mage','Rare','Specialist','Mental'),
  meta('00000018', 'Necromancer of the Crypt', K, 'Mage','Epic','Specialist','Magical'),
  meta('00000019', 'Apparition of the Crypt', K, 'Support','Common','Support','Mental'),
  meta('0000001A', 'Poltergeist of the Crypt', K, 'Support','Uncommon','Support','Mental'),
  meta('0000001B', 'Banshee of the Crypt', K, 'Support','Rare','Support','Mental'),
  meta('0000001C', 'Tainted of the Crypt', K, 'Sharpshooter','Common','DPS','Poison'),
  meta('0000001D', 'Vampire of the Crypt', K, 'Sharpshooter','Uncommon','DPS','Physical'),
  meta('0000001E', 'Vampire Lord of the Crypt', K, 'Sharpshooter','Rare','DPS','Physical'),
  meta('0000001F', 'Werewolf of the Crypt', K, 'Sharpshooter','Uncommon','DPS','Physical'),
  meta('00000020', 'Lycanthrope of the Crypt', K, 'Sharpshooter','Rare','DPS','Physical'),
  meta('0000002C', 'Skeleton Prince of the Crypt', K, 'Champion','Legendary','Hybrid','Physical'),
  meta('0000002D', 'Skull Magician of the Crypt (redone correctly)', K, 'Champion','Legendary','Specialist','Magical'),
  meta('0000002E', 'Bone Archer of the Crypt', K, 'Champion','Legendary','DPS','Physical'),
  meta('0000002F', 'Charles Jameson - Skeleton King of the Crypt', K, 'Guardian','Mythic','Hybrid','Physical'),
  meta('00000030', 'Furusiyya – The Bone General of the Crypt', K, 'Guardian','Mythic','Tank','Physical'),
  meta('00000031', 'Mekubbal – The Skeletal Cabalist of the Crypt', K, 'Guardian','Mythic','Specialist','Mental'),
  meta('00000032', 'Soriben – The Skeletal Necromancer of the Crypt', K, 'Guardian','Mythic','Specialist','Magical'),
  meta('00000033', 'Bram – Vampire Lord of the Crypt', K, 'Guardian','Mythic','DPS','Physical'),
  meta('00000034', 'Jay Cub – The Frenzied Lycanthrope of the Crypt', K, 'Guardian','Mythic','DPS','Physical'),
  meta('00000035', 'Caroline McNancy – The Hallowed Banshee of the Crypt', K, 'Guardian','Mythic','Support','Mental'),
  meta('00000036', 'Simon Peter - The Exalted Reborn of the Crypt', K, 'Guardian','Mythic','Hybrid','Divine'),
];

function meta(id: string, name: string, faction: Faction, cls: string, rarity: Rarity, heroType: HeroType, attackType: AttackType): CanonMeta {
  return { id: id.toUpperCase(), name, faction, class: cls, rarity, heroType, attackType };
}

function synthesizeAll(list: CanonMeta[]): Card[] {
  return list.map((c, idx) => ({
    ...c,
    image: `/images/${c.id}.png`,
    stats: genStatsFor(c, idx),
  }));
}

function normId(input: any): string {
  if (input == null) return '';
  let s = String(input).toUpperCase();
  if (s.length < 8) s = s.padStart(8, '0');
  return s;
}
function num(v: any, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const BUDGET: Record<Rarity, number> = {
  Common: 270, Uncommon: 285, Rare: 300, Epic: 315, Legendary: 330, Mythic: 345,
};

const WEIGHTS: Record<HeroType, number[]> = {
  Tank:         [0.16,0.06,0.05,0.14,0.10,0.06,0.16,0.10,0.17],
  DPS:          [0.08,0.05,0.05,0.10,0.20,0.06,0.08,0.18,0.20],
  Support:      [0.10,0.18,0.14,0.10,0.06,0.18,0.10,0.06,0.08],
  Hybrid:       [0.12,0.10,0.10,0.12,0.12,0.12,0.12,0.10,0.10],
  Specialist:   [0.08,0.10,0.12,0.10,0.12,0.18,0.10,0.08,0.12],
  default:      [0.11,0.10,0.10,0.11,0.11,0.11,0.11,0.10,0.15],
};

function genStatsFor(meta: CanonMeta, idx: number): CardStats {
  const budget = BUDGET[meta.rarity] ?? BUDGET.Common;
  const w = WEIGHTS[meta.heroType] ?? WEIGHTS.default;
  const seed = hash(meta.id + meta.name) + idx * 17;

  const bump: Partial<CardStats> =
    meta.faction === 'Highlanders'
      ? { hp: 2, strength: 2, stamina: 2, defense: 2 }
      : { intelligence: 2, focus: 2, power: 2 };

  const statsOrder: StatKey[] = ['hp','prana','focus','stamina','strength','intelligence','defense','speed','power'];
  const arr: number[] = [];
  let remain = budget;

  for (let i = 0; i < statsOrder.length; i++) {
    const base = Math.round(w[i] * budget);
    const noise = randRange(seed + i * 97, -3, 3);
    const val = Math.max(10, base + noise + ((bump as any)[statsOrder[i]] || 0));
    arr.push(val);
    remain -= val;
  }
  let i = 0;
  while (remain > 0) { arr[i % arr.length]++; remain--; i++; }
  while (remain < 0) { const j = (i++) % arr.length; if (arr[j] > 10) { arr[j]--; remain++; } }

  return {
    hp: arr[0], prana: arr[1], focus: arr[2], stamina: arr[3], strength: arr[4],
    intelligence: arr[5], defense: arr[6], speed: arr[7], power: arr[8],
  };
}

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0;
  return h >>> 0;
}
function randRange(seed: number, min: number, max: number): number {
  let x = (seed ^ 0x9E3779B9) >>> 0;
  x = (1664525 * x + 1013904223) >>> 0;
  const t = (x >>> 8) / (0xFFFFFF);
  return Math.floor(min + t * (max - min + 1));
}

function applyFactionFilter(cards: Card[], factionFilter: string | null) {
  if (!factionFilter || (factionFilter !== 'Highlanders' && factionFilter !== 'Keepers')) return cards;
  return cards.filter(c => c.faction === factionFilter);
}
