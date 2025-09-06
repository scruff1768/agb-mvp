'use client';

import React from 'react';

/** Tiny responsive helper (no refactor) */
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

/** Inline styles (kept minimal; only keys we need) */
const styles = {
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
    overflowX: 'hidden', // no horizontal scroll
  },

  cardSlot: {
    padding: 8,
    boxSizing: 'border-box' as const,
  },

  card: {
    // allow page to scroll on mobile; remove fixed viewport-dependent height
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
    // width/height set at render time (fixed pixels to prevent layout shift)
    background: '#0f172a',
    border: '1px solid #1f2937',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative' as const,
    flex: '0 0 auto',
    margin: '0 auto',
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
    // height set at render time to keep the grid stable
    borderTop: '1px solid #1f2937',
    paddingTop: 8,
  },

  statCell: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const, // minimal wrapping → truncate if too long
    fontSize: 14,
    lineHeight: 1.15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #1f2937',
    borderRadius: 8,
    padding: '6px 4px',
    background: '#0d1627',
  },
} as const;

/** Example stat renderer — replace with your real 9 stats */
function NineStats() {
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={styles.statCell}>
          Stat {i + 1}
        </div>
      ))}
    </>
  );
}

export default function PlayPage() {
  const isNarrow = useIsNarrow(768);

  // Fixed image box sizes (4:3) — predictable & no layout shift
  const IMG_W = isNarrow ? 320 : 420; // px
  const IMG_H = isNarrow ? 240 : 315; // px

  // Fixed stat grid height; 3 equal rows → stable 3×3
  const GRID_H = isNarrow ? 180 : 210; // px

  return (
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
          <div style={{ ...styles.imageBox, width: IMG_W, height: IMG_H }}>
            {/* Keep <img>, not next/image */}
            {/* Swap src with your actual image path */}
            <img
              src="/agb/images/0000001B.png"
              alt="Card art"
              style={styles.img}
            />
          </div>

          <div style={{ ...styles.statGrid, height: GRID_H }}>
            <NineStats />
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
          <div style={{ ...styles.imageBox, width: IMG_W, height: IMG_H }}>
            <img
              src="/agb/images/0000001C.png"
              alt="Card art"
              style={styles.img}
            />
          </div>

          <div style={{ ...styles.statGrid, height: GRID_H }}>
            <NineStats />
          </div>
        </div>
      </div>
    </div>
  );
}
