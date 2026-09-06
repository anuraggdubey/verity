import { createHash } from 'node:crypto';

import type { JournalLine, LedgerRecord } from '@/lib/contracts/types';

export function createLedgerRecord(existing: LedgerRecord[], proposalId: string, lines: JournalLine[], postedAt = new Date().toISOString()): LedgerRecord {
  const previous = existing[existing.length - 1];
  const prevHash = previous?.hash ?? '0000000000000000';
  const id = `LR-${String(existing.length + 1).padStart(4, '0')}`;
  const hash = createHash('sha256').update(prevHash + JSON.stringify({ id, proposalId, lines, postedAt })).digest('hex').slice(0, 16);
  return { id, proposalId, lines: structuredClone(lines), postedAt, prevHash, hash };
}

export function verifyLedgerChain(records: LedgerRecord[]): boolean {
  const rebuilt: LedgerRecord[] = [];
  for (const record of records) {
    const expected = createLedgerRecord(rebuilt, record.proposalId, record.lines, record.postedAt);
    if (record.id !== expected.id || record.prevHash !== expected.prevHash || record.hash !== expected.hash) return false;
    rebuilt.push(record);
  }
  return true;
}
