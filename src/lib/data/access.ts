import type {
  BankLine,
  ControlPR,
  FxObservation,
  LedgerEntry,
  SupportingDocument,
} from '@/lib/contracts/types';

/**
 * Read-only data access for the control engine and agent tools.
 *
 * The finance kernel binds the loaded benchmark at startup. The engine never
 * imports the runtime store directly — only this module.
 */

type RuntimeReaders = {
  bankLines: () => BankLine[];
  ledgerEntries: () => LedgerEntry[];
  documents: () => SupportingDocument[];
  fxObservations: () => FxObservation[];
  controlPRs: () => ControlPR[];
  packVersion: () => string;
};

let readers: RuntimeReaders | null = null;

export function bindRuntime(next: RuntimeReaders): void {
  readers = next;
}

function requireReaders(): RuntimeReaders {
  if (!readers) throw new Error('Finance kernel data access is not bound yet.');
  return readers;
}

export function listBankLines(): BankLine[] {
  return requireReaders().bankLines();
}

export function getBankLine(id: string): BankLine | undefined {
  return requireReaders().bankLines().find((b) => b.id === id);
}

export function listLedgerEntries(): LedgerEntry[] {
  return requireReaders().ledgerEntries();
}

export function listSupportingDocuments(): SupportingDocument[] {
  return requireReaders().documents();
}

export function getSupportingDocument(id: string): SupportingDocument | undefined {
  return requireReaders().documents().find((d) => d.id === id);
}

export function listFxObservations(): FxObservation[] {
  return requireReaders().fxObservations();
}

export function listControlPRs(): ControlPR[] {
  return requireReaders().controlPRs();
}

export function packVersion(): string {
  return requireReaders().packVersion();
}
