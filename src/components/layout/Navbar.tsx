'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { RotateCcw } from 'lucide-react';
import { VyLogo } from '../ui/VyLogo';

const navLinks = [
  { href: '/queue', label: 'Exceptions' },
  { href: '/cases/CASE-001', label: 'Finance PR' },
  { href: '/controls', label: 'Controls' },
  { href: '/metrics', label: 'Metrics' },
];

function isActive(pathname: string, href: string) {
  if (href.startsWith('/cases')) return pathname.startsWith('/cases');
  return pathname === href;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [resetting, setResetting] = useState(false);

  async function resetDemo() {
    setResetting(true);
    await fetch('/api/reset', { method: 'POST' });
    setResetting(false);
    startTransition(() => router.refresh());
    if (pathname !== '/queue') router.push('/queue');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <VyLogo size={22} theme="light" showWordmark={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                    active
                      ? 'text-zinc-950'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDemo}
            disabled={resetting}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
            title="Reset demo to frozen initial state"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <Link
            href="/cases/CASE-001"
            className="hidden sm:inline-flex px-3 py-1.5 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Demo
          </Link>
          <Link
            href="/queue"
            className="inline-flex items-center px-3.5 py-1.5 text-[13px] font-medium rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
