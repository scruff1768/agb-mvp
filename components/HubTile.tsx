// components/HubTile.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  subtitle?: string;
  href?: string;        // should already include basePath (e.g., /agb/archive)
  onClick?: () => void;
  disabled?: boolean;
  imageUrl?: string;    // should already include basePath (e.g., /agb/images/archive-bg.png)
};

export default function HubTile({
  title,
  subtitle,
  href,
  onClick,
  disabled,
  imageUrl,
}: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }
    if (!href) {
      e.preventDefault();
    }
  };

  const TileContent = (
    <div
      className={[
        'relative group w-[220px] h-[300px]',
        'rounded-2xl overflow-hidden',
        'bg-slate-900 text-slate-100',
        'border border-slate-700/70 shadow-xl',
        'transition-transform duration-200',
        disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.04] active:scale-[0.98]',
      ].join(' ')}
      aria-label={title}
      style={{ backgroundColor: '#0b1220' }}
    >
      {/* Background image layer (guaranteed render) */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black" />
      )}

      {/* Readability vignette (lighter so art is visible) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

      {/* Hover glow ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-yellow-400/70 transition-all duration-200 group-hover:ring-4 group-hover:shadow-[0_0_25px_rgba(250,204,21,0.35)]" />

      {/* Content */}
      <div className="relative z-[1] flex h-full flex-col items-center justify-end p-3">
        <div className="w-full rounded-lg bg-black/55 px-3 py-2 text-center text-sm font-semibold uppercase tracking-wide ring-1 ring-white/10 backdrop-blur-[2px]">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-2 text-center text-[11px] leading-tight text-slate-200">
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );

  // Prefer a real link when href is provided (better semantics & prefetch)
  if (href) {
    return (
      <Link href={href} onClick={handleClick} className="flex items-center justify-center">
        {TileContent}
      </Link>
    );
  }

  // Fallback to a button if no href (still supports onClick)
  return (
    <div className="flex items-center justify-center">
      <button onClick={handleClick} disabled={disabled} className="contents">
        {TileContent}
      </button>
    </div>
  );
}
