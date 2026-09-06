'use client';

import React from 'react';

export type PageBadge = {
  label: string;
  tone?: 'neutral' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet';
};

const badgeStyles: Record<NonNullable<PageBadge['tone']>, string> = {
  neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
};

export function AppPageHeader({
  title,
  subtitle,
  badges,
  actions,
}: {
  title: string;
  subtitle?: string;
  badges?: PageBadge[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl sm:text-[28px] font-semibold text-zinc-950 tracking-[-0.03em]">
            {title}
          </h1>
          {badges?.map((badge) => (
            <span
              key={badge.label}
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badgeStyles[badge.tone ?? 'neutral']}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
        {subtitle && (
          <p className="text-[15px] text-zinc-500 mt-2 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
