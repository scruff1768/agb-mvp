'use client';

import React from 'react';

/* ========= Tiny responsive helper ========= */
function useIsNarrow(breakpoint = 768) {
  const [isNarrow, setIsNarrow] = React.useState(false);
  React.useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < breakpoint);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoint]);
  return isNarrow;
}

/* ========= Minimal notifications ========= */
type Notice = { id: number; text: string };
function useNotifications(max = 50, toastMs = 1800) {
  const [log, setLog] = React.useState<Notice[]>([]);
  const [toast, setToast] = React.useState<Notice | null>(null);
  const idRef = React.useRef(1);

  const push = React.useCallback(
    (text: string, showToast = true) => {
      const id = idRef.current++;
      const n = { id, text };
      setLog((prev) => {
        const next = [...prev, n];
        return next.length > max ? next.slice(next.length - max) : next;
      });
      if (showToast) {
        setToast(n);
        const t = setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), toastMs);
        return () => clearTimeout(t);
      }
      return () => {};
    },
    [max, toastMs]
  );

  return { log, toast, push };
}

/* ========= Inline styles ========= */
const styles = {
  page: {
    width: '100%',
    minHeight: '100dvh',
    background: '#0a0f16',
    color: '#dce6ff',
    boxSizing: 'border-box' as const,
  },

  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid #1f2937',
    position: 'sticky' as const,
    top: 0,
    background: '#0a0f16',
    zIndex: 10,
  },

  title: { fontSize: 16, opacity: 0.9 },

  startBtn: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #1f2937',
    background: '#10223f',
    color: '#e5edff',
    cursor: 'pointer',
    fontWeight: 600,
  },

  board: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 1400,
    margin: '0 auto',
    padding: 12,
    boxSizing: 'border-box' as const,
    overflowX: 'hidden',
  },

  cardSlot: {
    padding: 8,
    boxSizing: 'border-box' as const,
  },

  card: {
    height: 'auto',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    background: '#0b1220',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 12,
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },

  imageBox: {
    background: '#0f172a',
    border: '1px solid #1f2937',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative' as const,
    flex: '0 0 auto',
    margin: '0 auto',
    transition: 'box-shadow 120ms ease',
  },

  imageBoxActive: {
    boxShadow: '0 0 0 2px #3b82f6 inset',
  },

  img: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain' as const,
    objectPosition: 'center',
    userSelect: 'none' as const,
    pointerEvents: 'none' as const,
  },

  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: 8,
    borderTop: '1px solid #1f2937',
    paddingTop: 8,
  },

  statCell: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    border: '1px solid #1f2937',
    borderRadius: 8,
    padding: '8px 10px',
    background: '#0d1627',
    cursor: 'pointer',
    outline: 'none',
    transition: 'transform 80ms ease, box-shadow 120ms ease, background 120ms ease',
    fontSize: 14,
    lineHeight: 1.2,
  },

  statCellHover: { background: '#11203a' },
  statCellActive: { boxShadow: '0 0 0 2px #3b82f6 inset', background: '#10223f', transform: 'translateY(-1px)' },

  statName: { opacity: 0.85, fontSize: 12 },
  statValue: { fontWeight: 700 },

  logPanel: {
    width: '100%',
    maxWidth: 1000,
    margin: '12px auto 24px',
    padding: 12,
    background: '#0b1220',
    border: '1px solid #1f2937',
    borderRadius: 10,
    boxSizing: 'border-box' as const,
  },

  logTitle: { fontSize: 13, opacity: 0.8, marginBottom: 8 },
  logList: { display: 'grid', gap: 6, fontSize: 13 },

  toast: {
    position: 'fixed' as const,
    bottom: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#10223f',
    border: '1px solid #26435f',
    color: '#e6efff',
    padding: '10px 14px',
    borderRadius: 10,
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    zIndex: 50,
    pointerEvents: 'none' as const,
    transition: 'opacity 180ms ease',
    opacity: 1,
    maxWidth: '92vw',
  },
  toastHidden: { opacity: 0 },
} as const;

/* ========= Types & demo data ========= */
type Stat = { name: string; value: number };

const LEFT_STATS: Stat[] = [
  { name: 'Strength', value: 12 },
  { name: 'Stamina', value: 8 },
  { name: 'Prana', value: 14 },
  { name: 'Focus', value: 10 },
  { name: 'Agility', value: 7 },
  { name: 'Luck', value: 9 },
  { name: 'Wisdom', value: 11 },
  { name: 'Spirit', value: 13 },
  { name: 'Armor', value: 6 },
];

const RIGHT_STATS: Stat[] = [
  { name: 'Strength', value: 9 },
  { name: 'Stamina', value: 10 },
  { name: 'Prana', value: 12 },
  { name: 'Focus', value: 8 },
  { name: 'Agility', value: 11 },
  { name: 'Luck', value: 6 },
  { name: 'Wisdom', value: 14 },
  { name: 'Spirit', value: 7 },
  { name: 'Armor', value: 10 },
];

/* ========= Small widgets ========= */
function StatCell({
  stat,
  active,
  onSelect,
}: {
  stat: Stat;
  active: boolean;
  onSelect: () => void;
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        ...styles.statCell,
        ...(hover ? styles.statCellHover : null),
        ...(active ? styles.statCellActive : null),
      }}
      title={`${stat.name}: ${stat.value}`}
    >
      <span style={styles.statName}>{stat.name}</span>
      <span style={styles.statValue}>{stat.value}</span>
    </div>
  );
}

function NineStats({
  stats,
  selectedIndex,
  onSelectIndex,
}: {
  stats: Stat[];
  selectedIndex: number | null;
  onSelectIndex: (i: number) => void;
}) {
  return (
    <>
      {stats.map((stat, i) => (
        <StatCell
          key={i}
          stat={stat}
          active={selectedIndex === i}
          onSelect={() => onSelectIndex(i)}
        />
      ))}
    </>
  );
}

/* ========= Page Component ========= */
export default function PlayPage() {
  const isNarrow = useIsNarrow(768);
  const { log, toast, push } = useNotifications();

  // Fixed, predictable sizes (4:3 image; stable grid)
  const IMG_W = isNarrow ? 360 : 420; // px
  const IMG_H = isNarrow ? 270 : 315; // px
  const GRID_H = isNarrow ? 200 : 210; // px

  // Minimal “game” state
  const [gameStarted, setGameStarted] = React.useState(false);
  const [activeCard, setActiveCard] = React.useState<0 | 1 | null>(null);
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<number | null>(null);

  const handleStart = () => {
    setGameStarted(true);
    setActiveCard(0);
    setSelectedLeft(null);
    setSelectedRight(null);
    push('Game started. Left card is active.');
  };

  const onCardFocus = (side: 0 | 1) => {
    setActiveCard(side);
    push(`${side === 0 ? 'Left' : 'Right'} card focused`);
  };

  const onStatSelect = (side: 0 | 1, i: number) => {
    const stats = side === 0 ? LEFT_STATS : RIGHT_STATS;
    const chosen = stats[i];
    if (side === 0) setSelectedLeft(i);
    else setSelectedRight(i);
    push(`${side === 0 ? 'Left' : 'Right'} selected ${chosen.name}: ${chosen.value}`);
  };

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.title}>Amica Guardian Battles — Play</div>
        <button
          type="button"
          onClick={handleStart}
          style={styles.startBtn}
          aria-pressed={gameStarted}
          title="Start / restart"
        >
          {gameStarted ? 'Restart' : 'Start'}
        </button>
      </div>

      {/* Board */}
      <div
        style={{
          ...styles.board,
          flexDirection: isNarrow ? 'column' : 'row',
        }}
      >
        {/* Left card */}
        <div
          style={{
            ...styles.cardSlot,
            width: isNarrow ? '100%' : '50%',
          }}
        >
          <div style={styles.card}>
            <div
              onClick={() => onCardFocus(0)}
              style={{
                ...styles.imageBox,
                ...(activeCard === 0 ? styles.imageBoxActive : null),
                width: IMG_W,
                height: IMG_H,
              }}
            >
              <img
                src="/agb/images/0000001B.png"
                alt="Card art"
                style={styles.img}
              />
            </div>

            <div style={{ ...styles.statGrid, height: GRID_H }}>
              <NineStats
                stats={LEFT_STATS}
                selectedIndex={selectedLeft}
                onSelectIndex={(i) => onStatSelect(0, i)}
              />
            </div>
          </div>
        </div>

        {/* Right card */}
        <div
          style={{
            ...styles.cardSlot,
            width: isNarrow ? '100%' : '50%',
          }}
        >
          <div style={styles.card}>
            <div
              onClick={() => onCardFocus(1)}
              style={{
                ...styles.imageBox,
                ...(activeCard === 1 ? styles.imageBoxActive : null),
                width: IMG_W,
                height: IMG_H,
              }}
            >
              <img
                src="/agb/images/0000001C.png"
                alt="Card art"
                style={styles.img}
              />
            </div>

            <div style={{ ...styles.statGrid, height: GRID_H }}>
              <NineStats
                stats={RIGHT_STATS}
                selectedIndex={selectedRight}
                onSelectIndex={(i) => onStatSelect(1, i)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications log */}
      <div style={styles.logPanel}>
        <div style={styles.logTitle}>Notifications</div>
        <div style={styles.logList}>
          {log.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No events yet. Tap <b>Start</b> and interact with the cards.</div>
          ) : (
            log
              .slice()
              .reverse()
              .map((n) => <div key={n.id}>• {n.text}</div>)
          )}
        </div>
      </div>

      {/* Toast */}
      <div style={{ ...(toast ? styles.toast : { ...styles.toast, ...styles.toastHidden }) }}>
        {toast?.text}
      </div>
    </div>
  );
}
