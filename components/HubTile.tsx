'use client';

import Link from 'next/link';
import Image from 'next/image';

type Props = {
  title: string;
  subtitle: string;
  href: string;        // e.g. "/battle"
  imageUrl: string;    // e.g. "/images/battle-bg.png"
};

export default function HubTile({ title, subtitle, href, imageUrl }: Props) {
  return (
    <Link
      href={href}
      className="group block w-[260px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900/40 shadow hover:border-slate-500 hover:bg-slate-900/60"
    >
      <div className="relative h-[150px] w-full">
        {/* next/image automatically honors next.config basePath ("/agb") */}
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="260px"
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="border-t border-slate-700 p-3">
        <div className="text-center text-sm font-bold tracking-wide text-slate-100">
          {title}
        </div>
        <div className="mt-1 line-clamp-2 text-center text-xs text-slate-300">
          {subtitle}
        </div>
      </div>
    </Link>
  );
}
