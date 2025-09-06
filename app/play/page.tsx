'use client';

import React from 'react';

/** ===========================
 *  Config (root hosting)
 *  =========================== */
const BASE = ''; // running at site root
const API_CARDS = `${BASE}/api/cards?format=object`;

// ensures ".png" and a clean id
function imgUrlFor(id: string) {
  const clean = String(id ?? '').trim();
  return `${BASE}/images/${encodeURIComponent(clean)}.png`;
}
const IMG_BACK = `${BASE}/images/card-back.png`;

/** ===========================
 *  Types
 *  =========================== */
type Faction = 'Highlanders' | 'Keepers';
type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
type HeroType = 'Tank' | 'DPS' | 'Support' | 'Hybrid' | 'Specialist' | string;
type AttackType = 'Physical' | 'Magical' | 'Mental' | 'Divine' | 'Poison' | 'Elemental' | string;

type StatKey =
  | 'hp' | 'prana' | 'focus' | 'stamina' | 'strength'
  | 'intelligence' | 'defense' | 'speed' | 'power';

const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP', prana: 'Prana', focus: 'Focus', stamina: 'Stamina',
  strength: 'Strength', intelligence: 'Intelligence', defense: 'Defense',
  speed: 'Speed', power: 'Power',
};

type CardStats = Record<StatKey, number>;

interface Card {
  id: string;
  name: string;
  faction: Faction;
  class: string;
  rarity: Rarity;
  heroType: HeroType;
  attackType: AttackType;
  image?: string;
  stats: CardStats;
}

type Side = 'player' | 'ai';
type Phase = 'awaitingStart' | 'awaitingChoice' | 'revealing' | 'roundResolved' | 'gameOver';

interface DeckState { deck: Card[]; discard: Card[]; active?: Card; }

/** ===========================
 *  Helpers
 *  =========================== */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function splitDeck(all: Card[]): { player: Card[]; ai: Card[] } {
  const s = shuffle(all);
  const mid = Math.floor(s.length / 2);
  return { player: s.slice(0, mid), ai: s.slice(mid) };
}
function compareByStat(stat: StatKey, a: Card, b: Card): 1 | -1 | 0 {
  const av = a.stats[stat] ?? 0;
  const bv = b.stats[stat] ?? 0;
  return av > bv ? 1 : av < bv ? -1 : 0;
}
function aiPickStat(aiCard: Card): StatKey {
  return (Object.entries(aiCard.stats) as [StatKey, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}
function drawNextRound(player: DeckState, ai: DeckState) {
  const p: DeckState = { deck: player.deck.slice(), discard: player.discard.slice(), active: undefined };
  const e: DeckState = { deck: ai.deck.slice(), discard: ai.discard.slice(), active: undefined };

  if (p.deck.length === 0 && p.discard.length > 0) { p.deck = shuffle(p.discard); p.discard = []; }
  if (e.deck.length === 0 && e.discard.length > 0) { e.deck = shuffle(e.discard); e.discard = []; }

  const pEmpty = p.deck.length === 0 && p.discard.length === 0;
  const eEmpty = e.deck.length === 0 && e.discard.length === 0;
  if (pEmpty || eEmpty) return null;

  p.active = p.deck.shift();
  e.active = e.deck.shift();
  if (!p.active || !e.active) return null;

  return { player: p, ai: e };
}

// loot-aware resolve (non-committing; we commit on "Continue")
function resolveWithLoot(
  chosenStat: StatKey, player: DeckState, ai: DeckState, loot: Card[],
): { winner: Side | 'tie'; player: DeckState; ai: DeckState; loot: Card[] } {
  if (!player.active || !ai.active) return { winner: 'tie', player, ai, loot };
  const cmp = compareByStat(chosenStat, player.active, ai.active);
  if (cmp === 0) {
    return {
      winner: 'tie',
      player: { deck: player.deck.slice(), discard: player.discard.slice(), active: player.active },
      ai: { deck: ai.deck.slice(), discard: ai.discard.slice(), active: ai.active },
      loot: [...loot, player.active, ai.active],
    };
  }
  if (cmp > 0) {
    return {
      winner: 'player',
      player: { deck: player.deck.slice(), discard: [...player.discard], active: player.active },
      ai: { deck: ai.deck.slice(), discard: ai.discard.slice(), active: ai.active },
      loot: loot.slice(),
    };
  }
  return {
    winner: 'ai',
    player: { deck: player.deck.slice(), discard: player.discard.slice(), active: player.active },
    ai: { deck: ai.deck.slice(), discard: [...ai.discard], active: ai.active },
    loot: loot.slice(),
  };
}

/** ===========================
 *  Page
 *  =========================== */
type CardsResponseArray = Card[];
type CardsResponseObject = { deck?: Card[]; total?: number } & Record<string, unknown>;

export default function PlayPage() {
  const [isBooting, setIsBooting] = React.useState(true);

  const [allCards, setAllCards] = React.useState<Card[]>([]);
  const [player, setPlayer] = React.useState<DeckState>({ deck: [], discard: [] });
  const [ai, setAi] = React.useState<DeckState>({ deck: [], discard: [] });
  const [loot, setLoot] = React.useState<Card[]>([]);

  const [phase, setPhase] = React.useState<Phase>('awaitingStart');
  const [turn, setTurn] = React.useState<Side>('player');
  const [chosenStat, setChosenStat] = React.useState<StatKey | null>(null);
  const [roundWinner, setRoundWinner] = React.useState<Side | 'tie' | null>(null);

  const [snapPlayerCard, setSnapPlayerCard] = React.useState<Card | null>(null);
  const [snapAiCard, setSnapAiCard] = React.useState<Card | null>(null);

  const [pending, setPending] = React.useState<{
    player: DeckState; ai: DeckState; loot: Card[]; winner: Side | 'tie';
  } | null>(null);

  const [showRoundPanel, setShowRoundPanel] = React.useState(false);

  React.useEffect(() => { void bootstrap(); }, []);

  async function bootstrap() {
    try {
      const res = await fetch(API_CARDS, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to fetch ${API_CARDS}`);
      const raw: CardsResponseArray | CardsResponseObject = await res.json();
      const deck = Array.isArray(raw) ? raw : (raw.deck ?? []);

      if (!deck || deck.length === 0) {
        console.error('Empty deck from cards API:', raw);
        setAllCards([]); setPlayer({ deck: [], discard: [] }); setAi({ deck: [], discard: [] });
        setLoot([]); setPhase('gameOver'); setShowRoundPanel(true);
        setChosenStat(null); setRoundWinner(null);
        setSnapPlayerCard(null); setSnapAiCard(null);
        setPending(null);
        return;
      }

      // Always build a root-relative image URL from id
      const normalized = deck.map((c) => ({
        ...c,
        image: imgUrlFor(c.id),
      }));

      setAllCards(normalized);
      const { player: pDeck, ai: aDeck } = splitDeck(normalized);
      setPlayer({ deck: pDeck, discard: [] });
      setAi({ deck: aDeck, discard: [] });
      setLoot([]);
      setPhase('awaitingStart'); setTurn('player');
      setChosenStat(null); setRoundWinner(null);
      setSnapPlayerCard(null); setSnapAiCard(null);
      setPending(null); setShowRoundPanel(false);
    } catch (err) {
      console.error(err);
      setPhase('gameOver'); setShowRoundPanel(true);
    } finally {
      setIsBooting(false);
    }
  }

  function startRoundOnce() {
    if (phase !== 'awaitingStart') return;
    const drawn = drawNextRound(player, ai);
    if (!drawn) { setPhase('gameOver'); setShowRoundPanel(true); return; }
    setPlayer(drawn.player); setAi(drawn.ai);
    setPhase('awaitingChoice');
  }

  React.useEffect(() => {
    if (phase === 'awaitingChoice' && turn === 'ai' && ai.active) {
      const pick = aiPickStat(ai.active);
      const t = setTimeout(() => handlePick(pick), 600);
      return () => clearTimeout(t);
    }
  }, [phase, turn, ai.active]);

  function handlePick(stat: StatKey) {
    if (phase !== 'awaitingChoice') return;
    setChosenStat(stat);
    setPhase('revealing');

    setSnapPlayerCard(player.active || null);
    setSnapAiCard(ai.active || null);

    const computed = resolveWithLoot(stat, player, ai, loot);

    const committed = (() => {
      if (!player.active || !ai.active) return { player, ai, loot };
      if (computed.winner === 'tie') {
        const newLoot = [...loot, player.active, ai.active];
        return {
          player: { deck: player.deck.slice(), discard: player.discard.slice(), active: player.active },
          ai: { deck: ai.deck.slice(), discard: ai.discard.slice(), active: ai.active },
          loot: newLoot,
        };
      }
      if (computed.winner === 'player') {
        return {
          player: { deck: player.deck.slice(), discard: [...player.discard, player.active, ai.active, ...loot], active: player.active },
          ai: { deck: ai.deck.slice(), discard: ai.discard.slice(), active: ai.active },
          loot: [],
        };
      }
      return {
        player: { deck: player.deck.slice(), discard: player.discard.slice(), active: player.active },
        ai: { deck: ai.deck.slice(), discard: [...ai.discard, ai.active, player.active, ...loot], active: ai.active },
        loot: [],
      };
    })();

    setPending({ ...committed, winner: computed.winner });
    setRoundWinner(computed.winner);

    setShowRoundPanel(true);
    setPhase('roundResolved');
  }

  function commitAndDrawNext() {
    if (!pending) return;

    const afterPlayer: DeckState = { deck: pending.player.deck.slice(), discard: pending.player.discard.slice(), active: undefined };
    const afterAi: DeckState = { deck: pending.ai.deck.slice(), discard: pending.ai.discard.slice(), active: undefined };
    const afterLoot = pending.loot.slice();

    const pEmpty = afterPlayer.deck.length === 0 && afterPlayer.discard.length === 0;
    const eEmpty = afterAi.deck.length === 0 && afterAi.discard.length === 0;

    if (pEmpty || eEmpty) {
      setPlayer(afterPlayer); setAi(afterAi); setLoot(afterLoot);
      setPhase('gameOver'); setShowRoundPanel(true);
      setPending(null);
      return;
    }

    const drawn = drawNextRound(afterPlayer, afterAi);
    if (!drawn) {
      setPlayer(afterPlayer); setAi(afterAi); setLoot(afterLoot);
      setPhase('gameOver'); setShowRoundPanel(true);
      setPending(null);
      return;
    }

    setPlayer(drawn.player);
    setAi(drawn.ai);
    setLoot(afterLoot);

    const nextTurn = pending.winner === 'tie' ? turn : (pending.winner as Side);
    setTurn(nextTurn);

    setPending(null);
    setChosenStat(null);
    setRoundWinner(null);
    setSnapPlayerCard(null);
    setSnapAiCard(null);
    setShowRoundPanel(false);
    setPhase('awaitingChoice');
  }

  function newGame() { void bootstrap(); }

  const pActive = player.active;
  const aActive = ai.active;

  const showAICardBack = phase === 'awaitingChoice' && turn === 'player';
  const ORDER: StatKey[] = ['hp','prana','focus','stamina','strength','intelligence','defense','speed','power'];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20 }}>Amica Guardian Battles — MVP</h1>
          <small style={{ opacity: 0.75 }}>
            {isBooting ? 'Loading cards…'
              : phase === 'awaitingStart' ? 'Press Start Round to begin the match'
              : phase === 'awaitingChoice' ? (turn === 'player' ? 'Choose a stat' : 'AI is choosing…')
              : phase === 'roundResolved' ? 'Round finished — click Continue'
              : phase === 'gameOver' ? 'Game over'
              : 'Revealing…'}
          </small>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {!isBooting && phase === 'awaitingStart' && <button style={styles.primary} onClick={startRoundOnce}>Start Round</button>}
          {!isBooting && phase === 'gameOver' && <button style={styles.primary} onClick={newGame}>New Game</button>}
        </div>
      </header>

      <div style={styles.statusRow}>
        <span style={styles.pill}>You — Deck: <strong>{player.deck.length}</strong></span>
        <span style={styles.pill}>Discard: <strong>{player.discard.length}</strong></span>
        <span style={{ opacity: 0.65 }}>|</span>
        <span style={styles.pill}>Loot: <strong>{loot.length}</strong></span>
        <span style={{ opacity: 0.65 }}>|</span>
        <span style={styles.pill}>AI — Deck: <strong>{ai.deck.length}</strong></span>
        <span style={styles.pill}>Discard: <strong>{ai.discard.length}</strong></span>
      </div>

      <section style={styles.board}>
        <div style={styles.cardSlot}>
          <Card
            owner="player"
            card={pActive}
            selectable={!isBooting && phase === 'awaitingChoice' && turn === 'player'}
            onSelect={(s) => handlePick(s)}
            highlight={chosenStat ?? undefined}
            order={ORDER}
          />
        </div>

        <div style={styles.cardSlot}>
          <Card
            owner="ai"
            card={aActive}
            selectable={false}
            highlight={chosenStat ?? undefined}
            showBack={!isBooting && showAICardBack}
            order={ORDER}
          />
        </div>
      </section>

      {!isBooting && showRoundPanel && (
        <div style={styles.floatWrap} aria-live="polite">
          <div style={styles.floatPanel}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>
              {phase === 'gameOver' ? 'Game Over' : 'Round Result'}
            </h3>

            {phase === 'gameOver' ? (
              <p style={{ marginBottom: 12 }}>
                {player.deck.length + player.discard.length === 0
                  ? 'You ran out of cards. AI wins!'
                  : ai.deck.length + ai.discard.length === 0
                  ? 'AI ran out of cards. You win!'
                  : 'One side cannot continue. Match ended.'}
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 6 }}>
                <Row label="Stat" value={chosenStat ? STAT_LABELS[chosenStat] : '—'} />
                <Row label="Your Value" value={chosenStat && snapPlayerCard ? String(snapPlayerCard.stats[chosenStat]) : '—'} />
                <Row label="AI Value" value={chosenStat && snapAiCard ? String(snapAiCard.stats[chosenStat]) : '—'} />
                <Row
                  label="Outcome"
                  value={
                    roundWinner === 'player' ? 'You win'
                    : roundWinner === 'ai' ? 'You lose'
                    : 'Tie — into Loot'
                  }
                />
                <small style={{ opacity: 0.8 }}>
                  {roundWinner === 'tie'
                    ? `Tie! Both cards moved to the loot zone (${(pending?.loot ?? loot).length} total after this round).`
                    : `${roundWinner === 'player' ? 'You' : 'AI'} claimed both actives${(pending?.loot?.length ?? 0) ? ' plus all loot' : ''}.`}
                </small>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              {phase === 'gameOver'
                ? <button style={styles.primary} onClick={newGame}>Start New Game</button>
                : <button style={styles.primary} onClick={commitAndDrawNext}>Continue</button>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/** ===========================
 *  Card
 *  =========================== */
function Card({
  owner, card, selectable, onSelect, highlight, showBack = false, order,
}: {
  owner: 'player' | 'ai';
  card?: Card;
  selectable: boolean;
  onSelect?: (s: StatKey) => void;
  highlight?: StatKey;
  showBack?: boolean;
  order: StatKey[];
}) {
  if (!card) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHead}><strong>No Card</strong><span style={{ opacity: 0.6 }}>—</span></div>
        <div style={styles.badges}/>
        <div style={styles.body}>
          <div style={styles.imageBox}/>
          <div style={styles.statGridPlaceholder}>Awaiting draw…</div>
        </div>
        <div style={styles.cardFoot}>{owner === 'player' ? 'Your card' : 'AI card'}</div>
      </div>
    );
  }

  if (showBack) {
    return (
      <div style={styles.card}>
        <div style={styles.cardHead}><strong>Face Down</strong><span style={{ opacity: 0.6 }}>&nbsp;</span></div>
        <div style={styles.badges}/>
        <div style={styles.body}>
          <div style={styles.imageBox}>
            <img
              src={IMG_BACK}
              alt="Card back"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#0f172a' }}
            />
          </div>
          <div style={styles.statGridPlaceholder}>Opponent’s card is hidden until reveal.</div>
        </div>
        <div style={styles.cardFoot}>{owner === 'player' ? 'Your card' : 'AI card'}</div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <strong style={styles.name}>{card.name}</strong>
        <span style={{ opacity: 0.6 }}>#{card.id}</span>
      </div>

      <div style={styles.badges}>
        <Badge>{card.faction}</Badge>
        <Badge>{card.class}</Badge>
        <Badge>{card.heroType}</Badge>
        <Badge>{card.attackType}</Badge>
        <Badge tone={rarityTone(card.rarity)}>{card.rarity}</Badge>
      </div>

      <div style={styles.body}>
        <div style={styles.imageBox}>
          <CardImage name={card.name} id={card.id} src={card.image || imgUrlFor(card.id)} />
        </div>

        <div style={styles.statGrid}>
          {order.map((k) => {
            const v = card.stats[k] ?? 0;
            const cell = (
              <div style={styles.cellContent}>
                <div style={{ fontWeight: 700 }}>{STAT_LABELS[k]}</div>
                <div style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              </div>
            );

            return selectable ? (
              <button
                key={k}
                onClick={() => onSelect?.(k)}
                style={{
                  ...styles.cellBtn,
                  outline: highlight === k ? '2px solid #22c55e' : '1px solid #1f2937',
                }}
              >
                {cell}
              </button>
            ) : (
              <div
                key={k}
                style={{
                  ...styles.cell,
                  outline: highlight === k ? '2px solid #22c55e' : '1px solid #1f2937',
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.cardFoot}>{owner === 'player' ? 'Your card' : 'AI card'}</div>
    </div>
  );
}

function CardImage({ id, name, src }: { id: string; name: string; src: string }) {
  const warnedRef = React.useRef(false);
  return (
    <img
      src={src}
      alt={name}
      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#0f172a' }}
      onError={(e) => {
        const el = e.currentTarget as HTMLImageElement;
        if (el.src.includes('/card-back.png')) return;
        if (!warnedRef.current) {
          console.warn(`Image missing for id "${id}". Tried: ${src}`);
          warnedRef.current = true;
        }
        el.src = IMG_BACK;
      }}
    />
  );
}

function Badge({ children, tone = '#374151' }: { children: React.ReactNode; tone?: string }) {
  return (
    <span style={{ background: tone, color: 'white', borderRadius: 999, padding: '4px 10px', fontSize: 12, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}
function rarityTone(r: Rarity) {
  switch (r) {
    case 'Common': return '#6b7280';
    case 'Uncommon': return '#10b981';
    case 'Rare': return '#3b82f6';
    case 'Epic': return '#8b5cf6';
    case 'Legendary': return '#f59e0b';
    case 'Mythic': return '#ef4444';
    default: return '#6b7280';
  }
}

/** ===========================
 *  Styles
 *  =========================== */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    background: 'linear-gradient(180deg,#030712,#0b1220)',
    color: 'white',
    padding: 12,
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 10, marginBottom: 8,
  },
  statusRow: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginBottom: 8, flexWrap: 'wrap',
  },
  pill: {
    background: '#111827', border: '1px solid #1f2937', padding: '4px 10px', borderRadius: 999, fontSize: 12,
  } as React.CSSProperties,

  board: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(12px, 3vw, 28px)',
    height: '100%',
  },

  cardSlot: {
    flex: '0 0 auto',
    width: 'clamp(260px, 38vw, 420px)',
    display: 'grid',
    placeItems: 'center',
  },

  card: {
    width: '100%',
    height: 'min(82dvh, 720px)',
    background: '#0b1220',
    border: '1px solid #374151',
    borderRadius: 14,
    boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr auto',
  },

  cardHead: {
    display: 'flex', justifyContent: 'space-between', gap: 8,
    padding: '8px 10px', borderBottom: '1px solid #1f2937', minHeight: 38,
  },
  name: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' },

  badges: {
    display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 10px',
    borderBottom: '1px solid #1f2937', minHeight: 34,
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: '10px 10px',
    overflow: 'hidden',
  },

  imageBox: {
    flex: '0 0 auto',
    width: '100%',
    aspectRatio: '4 / 3',
    background: '#0f172a',
    border: '1px solid #1f2937',
    borderRadius: 10,
    overflow: 'hidden',
  },

  statGrid: {
    flex: '0 0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, minmax(36px, 1fr))',
    gap: 8,
  },
  statGridPlaceholder: {
    flex: '1 1 0',
    display: 'grid',
    placeItems: 'center',
    opacity: 0.75,
  },

  cell: {
    background: '#0f172a',
    borderRadius: 10,
    padding: 10,
    display: 'grid',
    placeItems: 'center',
    fontSize: 'clamp(11px, 1.4vw, 14px)',
  },
  cellBtn: {
    background: '#111827',
    color: 'white',
    borderRadius: 10,
    padding: 10,
    cursor: 'pointer',
    fontSize: 'clamp(11px, 1.4vw, 14px)',
  },
  cellContent: {
    display: 'grid',
    gap: 4,
    textAlign: 'center',
    lineHeight: 1.1,
  },

  cardFoot: {
    padding: '8px 10px',
    borderTop: '1px solid #1f2937',
    opacity: 0.75,
  },

  floatWrap: {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    alignItems: 'start',
    justifyItems: 'center',
    paddingTop: 'clamp(12px, 9vh, 96px)',
    pointerEvents: 'none',
    zIndex: 60,
  },
  floatPanel: {
    pointerEvents: 'auto',
    width: 'min(380px, 86vw)',
    maxHeight: '70vh',
    overflow: 'auto',
    background: 'rgba(17,24,39,0.92)',
    backdropFilter: 'blur(6px)',
    color: 'white',
    borderRadius: 12,
    padding: 14,
    border: '1px solid #374151',
  },

  primary: {
    background: '#22c55e',
    color: 'black',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
