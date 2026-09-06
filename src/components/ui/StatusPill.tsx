import React from 'react';

type StatusType = 'pass' | 'blocked' | 'warn' | 'active' | 'review' | 'escalate' | 'auto';

interface StatusPillProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function StatusPill({
  status,
  label,
  size = 'md',
  pulse = false,
}: StatusPillProps) {
  const configs: Record<
    StatusType,
    { bg: string; text: string; border: string; dot: string; defaultLabel: string }
  > = {
    pass: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Passed',
    },
    auto: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      defaultLabel: 'Auto-Cleared',
    },
    blocked: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      defaultLabel: 'Blocked',
    },
    escalate: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      defaultLabel: 'Escalated',
    },
    warn: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Warning',
    },
    review: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      defaultLabel: 'Review Required',
    },
    active: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      defaultLabel: 'Active Agent',
    },
  };

  const config = configs[status] || configs.pass;
  const displayText = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight ${
        config.bg
      } ${config.text} ${config.border} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot}`} />
      </span>
      {displayText}
    </span>
  );
}
