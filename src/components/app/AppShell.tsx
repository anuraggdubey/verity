import type { ReactNode } from 'react';

/**
 * Dark frame for the console pages.
 *
 * The root layout is the landing page's light theme; the working surfaces are
 * dark, on the same pinstripe ground the landing page uses for its product
 * sections. Every console page goes through here so they stay one system.
 */
export function AppShell({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="attio-pinstripe-dark min-h-screen w-full text-zinc-200">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-1.5 max-w-3xl text-sm text-zinc-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function Card({
  title,
  hint,
  right,
  children,
  className = '',
}: {
  title?: string;
  hint?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0d12] ${className}`}
    >
      {(title || right) && (
        <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] bg-[#11131a] px-4 py-2.5">
          <div className="min-w-0">
            {title && <h2 className="text-xs font-semibold text-zinc-200">{title}</h2>}
            {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
          </div>
          {right && <div className="ml-auto text-[11px] text-zinc-400">{right}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Metric({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  const tones = {
    default: 'text-white',
    good: 'text-emerald-300',
    warn: 'text-amber-300',
    bad: 'text-rose-300',
  } as const;
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className={`mono-num mt-1.5 text-2xl font-semibold ${tones[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-zinc-500">{sub}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-white/[0.1] bg-black/20 px-4 py-8 text-center text-sm text-zinc-500">
      {children}
    </div>
  );
}
