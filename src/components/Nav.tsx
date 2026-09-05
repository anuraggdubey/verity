'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { GitPullRequest, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/ui';

const links = [
  { href: '/', label: 'Exception queue' },
  { href: '/controls', label: 'Control PRs' },
  { href: '/metrics', label: 'Metrics' },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);

  async function reset() {
    setResetting(true);
    await fetch('/api/reset', { method: 'POST' });
    setResetting(false);
    startTransition(() => router.refresh());
  }

  return (
    <header className="border-b border-line">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <GitPullRequest className="size-4 text-violet-400" />
          Verity
          <span className="text-zinc-500 font-normal hidden sm:inline">
            merge control for finance agents
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm ml-auto">
          {links.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60',
                  active && 'bg-zinc-800 text-zinc-100',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            onClick={reset}
            disabled={resetting || pending}
            className="ml-2 px-3 py-1.5 rounded-md border border-line text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 disabled:opacity-50 flex items-center gap-1.5"
            title="Reset the demo to the frozen initial state"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        </nav>
      </div>
    </header>
  );
}
