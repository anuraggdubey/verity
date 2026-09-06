'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Menu, RotateCcw, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating away should always close the sheet, including via the browser
  // back button — otherwise it stays open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // A panel that covers the page has to be dismissable without hunting for the
  // close button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  async function resetDemo() {
    setResetting(true);
    setMenuOpen(false);
    await fetch('/api/reset', { method: 'POST' });
    setResetting(false);
    startTransition(() => router.refresh());
    if (pathname !== '/queue') router.push('/queue');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
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
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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
            className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 sm:px-3.5"
          >
            Get started
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/[0.08] text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          {/* Tapping anywhere off the sheet closes it. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 top-14 z-40 cursor-default bg-black/10 md:hidden"
          />
          <nav
            id="mobile-nav"
            className="relative z-50 border-t border-black/[0.06] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 flex items-center gap-2 border-t border-black/[0.06] pt-3">
              <button
                onClick={resetDemo}
                disabled={resetting}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] px-3 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {resetting ? 'Resetting…' : 'Reset demo'}
              </button>
              <Link
                href="/cases/CASE-001"
                onClick={() => setMenuOpen(false)}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-black/[0.08] px-3 py-2 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Open the demo
              </Link>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
