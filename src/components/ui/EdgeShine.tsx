import React from 'react';

interface EdgeShineProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'crimson' | 'cyan' | 'amber';
}

export function EdgeShine({
  children,
  className = '',
  glowColor = 'emerald',
}: EdgeShineProps) {
  const glowStyles = {
    emerald: 'from-emerald-500/0 via-emerald-400/50 to-emerald-500/0',
    crimson: 'from-rose-500/0 via-rose-500/50 to-rose-500/0',
    cyan: 'from-cyan-500/0 via-cyan-400/50 to-cyan-500/0',
    amber: 'from-amber-500/0 via-amber-400/50 to-amber-500/0',
  };

  return (
    <div className={`relative group overflow-hidden rounded-xl p-[1px] ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-r ${glowStyles[glowColor]} opacity-75 blur-xs transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative rounded-[11px] bg-[#0d0e12] w-full h-full">
        {children}
      </div>
    </div>
  );
}
