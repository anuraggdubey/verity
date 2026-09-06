import { describe, expect, it } from 'vitest';

import { extractDocument, fieldsFromText, isSupported, SUPPORTED_EXTENSIONS } from '@/lib/integrations/documents';

const bytes = (text: string) => Buffer.from(text, 'utf8');

describe('evidence ingestion', () => {
  it('accepts the common finance document formats', () => {
    expect(SUPPORTED_EXTENSIONS.length).toBeGreaterThanOrEqual(10);
    for (const name of ['a.pdf', 'b.PNG', 'c.jpg', 'd.csv', 'e.docx', 'f.xlsx', 'g.txt', 'h.json']) {
      expect(isSupported(name), name).toBe(true);
    }
  });

  it('refuses a format it cannot read instead of accepting it silently', async () => {
    const result = await extractDocument('ledger.exe', bytes('nope'));
    expect('error' in result).toBe(true);
  });

  it('pulls reference, amount, currency and date off an invoice', () => {
    const fields = fieldsFromText(
      'LYRA GmbH\nINVOICE INV-LG-2291\nTransaction date: 2026-08-11\nTotal due: EUR 8,000.00',
    );
    expect(fields.documentType).toBe('invoice');
    expect(fields.reference).toBe('INV-LG-2291');
    expect(fields.amount).toBe(8000);
    expect(fields.currency).toBe('EUR');
    expect(fields.transactionDate).toBe('2026-08-11');
  });

  it('reads a csv receipt deterministically, with no model involved', async () => {
    const result = await extractDocument(
      'fee.csv',
      bytes('date,description,reference,currency,amount\n2026-08-08,MONTHLY SERVICE CHARGE,SVC-AUG,USD,45.00\n'),
    );
    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.extractedBy).toBe('deterministic');
    expect(result.fields.reference).toBe('SVC-AUG');
    expect(result.fields.amount).toBe(45);
  });

  it('says it could not read an image when no model key is set', async () => {
    const previous = { a: process.env.ANTHROPIC_API_KEY, b: process.env.VERITY_MODEL_API_KEY };
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.VERITY_MODEL_API_KEY;

    const result = await extractDocument('receipt.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    expect('error' in result).toBe(false);
    if ('error' in result) return;
    // The honest outcome: accepted, unread, and labelled unread.
    expect(result.extractedBy).toBe('none');
    expect(result.warnings.join(' ')).toContain('not read');

    if (previous.a) process.env.ANTHROPIC_API_KEY = previous.a;
    if (previous.b) process.env.VERITY_MODEL_API_KEY = previous.b;
  });

  it('flags a document with no amount rather than reconciling against nothing', async () => {
    const result = await extractDocument('note.txt', bytes('Called the vendor about the missing paperwork.'));
    if ('error' in result) throw new Error('unexpected');
    expect(result.fields.amount).toBeUndefined();
    expect(result.warnings.join(' ')).toContain('No amount');
  });
});
