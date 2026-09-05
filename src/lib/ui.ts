import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { CaseState, ControlFamily, Lane } from '@/lib/contracts/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function shortDate(iso: string) {
  return iso.slice(0, 10);
}

export function clockTime(iso: string) {
  return iso.slice(11, 19);
}

export const laneStyles: Record<Lane, string> = {
  auto: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  review: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  escalate: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
};

export const laneLabel: Record<Lane, string> = {
  auto: 'Auto',
  review: 'Review',
  escalate: 'Escalate',
};

export const stateStyles: Record<CaseState, string> = {
  unmatched: 'border-zinc-600 bg-zinc-800 text-zinc-300',
  investigating: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  proposed: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  controls_failed: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  revising: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  merge_ready: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
  auto_cleared: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  escalated: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
};

export const familyLabel: Record<ControlFamily, string> = {
  evidence_lineage: 'Evidence lineage',
  accounting_integrity: 'Accounting integrity',
  policy_provenance: 'Policy & market-data provenance',
};

export function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
