import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { BankLine, LedgerEntry } from '@/lib/contracts/types';
import { normalizeCurrency, parseIsoDate, parseMoneyMinor } from '@/lib/matcher/normalize';

export class CsvValidationError extends Error {
  constructor(message: string, public readonly row?: number) {
    super(row ? `Row ${row}: ${message}` : message);
    this.name = 'CsvValidationError';
  }
}

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (quoted) throw new CsvValidationError('Unterminated quoted field');
  if (cell.length > 0 || row.length > 0) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  return rows.filter((cells) => cells.some((value) => value.trim() !== ''));
}

function records(input: string, required: string[]): Record<string, string>[] {
  const rows = parseCsv(input);
  if (rows.length === 0) throw new CsvValidationError('CSV is empty');
  const headers = rows[0].map((value) => value.trim());
  for (const name of required) if (!headers.includes(name)) throw new CsvValidationError(`Missing required column "${name}"`);
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) throw new CsvValidationError(`Expected ${headers.length} columns, received ${values.length}`, index + 2);
    return Object.fromEntries(headers.map((header, column) => [header, values[column].trim()]));
  });
}

function ensureUnique<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.id) throw new CsvValidationError('Identifier cannot be empty');
    if (seen.has(item.id)) throw new CsvValidationError(`Duplicate identifier "${item.id}"`);
    seen.add(item.id);
  }
  return items;
}

export function loadBankCsv(input: string): BankLine[] {
  const required = ['id', 'postedDate', 'valueDate', 'amount', 'currency', 'counterparty', 'reference', 'description'];
  return ensureUnique(records(input, required).map((r, index) => {
    try {
      return { id: r.id, postedDate: parseIsoDate(r.postedDate), valueDate: parseIsoDate(r.valueDate), amount: parseMoneyMinor(r.amount) / 100, currency: normalizeCurrency(r.currency), counterparty: r.counterparty, reference: r.reference, description: r.description };
    } catch (error) { throw new CsvValidationError(error instanceof Error ? error.message : String(error), index + 2); }
  }));
}

export function loadLedgerCsv(input: string): LedgerEntry[] {
  const required = ['id', 'entryDate', 'account', 'entity', 'period', 'amount', 'currency', 'counterparty', 'reference', 'description', 'posted'];
  return ensureUnique(records(input, required).map((r, index) => {
    try {
      if (!/^(true|false)$/i.test(r.posted)) throw new Error(`Invalid boolean "${r.posted}"`);
      if (!/^\d{4}-\d{2}$/.test(r.period)) throw new Error(`Invalid period "${r.period}"`);
      return { id: r.id, entryDate: parseIsoDate(r.entryDate), account: r.account, entity: r.entity, period: r.period, amount: parseMoneyMinor(r.amount) / 100, currency: normalizeCurrency(r.currency), counterparty: r.counterparty, reference: r.reference, description: r.description, posted: r.posted.toLowerCase() === 'true' };
    } catch (error) { throw new CsvValidationError(error instanceof Error ? error.message : String(error), index + 2); }
  }));
}

export function loadFrozenReconciliation(): { bankLines: BankLine[]; ledgerEntries: LedgerEntry[] } {
  const root = path.join(process.cwd(), 'bench', 'fixtures');
  return {
    bankLines: loadBankCsv(readFileSync(path.join(root, 'bank.csv'), 'utf8')),
    ledgerEntries: loadLedgerCsv(readFileSync(path.join(root, 'ledger.csv'), 'utf8')),
  };
}
