import React from 'react';

interface KbdBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function KbdBadge({ children, className = '' }: KbdBadgeProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-mono font-medium text-zinc-300 bg-zinc-900 border border-zinc-700/80 rounded shadow-[inset_0_-1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] select-none ${className}`}
    >
      {children}
    </kbd>
  );
}
