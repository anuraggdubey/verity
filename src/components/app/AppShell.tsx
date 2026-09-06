'use client';

import React from 'react';

export function AppShell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="app-page-shell">
      <div className={`app-page max-w-7xl mx-auto ${className}`}>{children}</div>
    </div>
  );
}
