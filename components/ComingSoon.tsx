'use client';

import React from 'react';

type Props = {
  title?: string;
  detail?: string;
  onClose?: () => void;
};

export default function ComingSoon({
  title = 'Feature coming soon',
  detail = 'This section is on the roadmap. Battle mode is available today.',
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-6 shadow-xl ring-1 ring-white/10">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-slate-300">{detail}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-4 py-2 text-slate-900 hover:bg-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
