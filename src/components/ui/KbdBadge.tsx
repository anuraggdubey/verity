import React from 'react';

interface KbdBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function KbdBadge({ children, className = '' }: KbdBadgeProps) {
  return (
    <kbd
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-mono font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 rounded select-none ${className}`}
    >
      {children}
    </kbd>
  );
}
