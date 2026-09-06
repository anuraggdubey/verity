import Anthropic from '@anthropic-ai/sdk';
import JSZip from 'jszip';

import type { SupportingDocument } from '@/lib/contracts/types';

/**
 * Evidence ingestion.
 *
 * A controller drops in the receipts, invoices and statements they already
 * have; Verity turns each one into a `SupportingDocument` the agent can
 * retrieve and must cite. That is deliberately not a document-intelligence
 * product bolted onto the side: the value here is that uploaded paper becomes
 * *evidence under the control pack*, so an unsupported claim about it gets
 * blocked like any other.
 *
 * Extraction is honest about how it was done. `extractedBy` is:
 *   'model'         — Claude read the image or PDF
 *   'deterministic' — parsed from structured text (csv/tsv/json) or OOXML
 *   'none'          — we could not read it, and say so rather than guess
 *
 * Nothing here posts, and nothing here bypasses a control: an uploaded document
 * is evidence, not a decision.
 */

export const SUPPORTED_EXTENSIONS = [
  'pdf',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'csv',
  'tsv',
  'txt',
  'md',
  'json',
  'docx',
  'xlsx',
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type ExtractedFields = {
  documentType: 'invoice' | 'receipt' | 'bank_statement' | 'fee_schedule' | 'remittance' | 'unknown';
  counterparty?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  transactionDate?: string;
  notes?: string;
};

export type ExtractionResult = {
  fileName: string;
  extension: SupportedExtension;
  bytes: number;
  extractedBy: 'model' | 'deterministic' | 'none';
  fields: ExtractedFields;
  /** Raw text we recovered, trimmed. Empty for images when no model is configured. */
  excerpt: string;
  warnings: string[];
};

export function extensionOf(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export function isSupported(fileName: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extensionOf(fileName));
}

const IMAGE_MEDIA: Record<string, 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/* ------------------------------------------------------- text extraction */

function stripXml(xml: string): string {
  return xml
    .replace(/<w:p[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function textFromOoxml(bytes: Buffer, extension: string): Promise<string> {
  const zip = await JSZip.loadAsync(bytes);
  if (extension === 'docx') {
    const doc = zip.file('word/document.xml');
    return doc ? stripXml(await doc.async('string')) : '';
  }
  // xlsx: shared strings carry the human-readable cell text.
  const shared = zip.file('xl/sharedStrings.xml');
  const sheets = zip.file(/xl\/worksheets\/sheet\d+\.xml/);
  const parts: string[] = [];
  if (shared) parts.push(stripXml(await shared.async('string')));
  for (const sheet of sheets.slice(0, 3)) parts.push(stripXml(await sheet.async('string')));
  return parts.join('\n').trim();
}

/* --------------------------------------------------- deterministic fields */

// Amount matching is line-bounded and prefers a decimal. An earlier pattern let
// a CSV header word ("...,amount", then a line break, then "2026-08-08,...")
// reach across the break and report the year as the amount.
const KEYWORD_AMOUNT = /(?:total|amount|balance|due|paid)[^\n]{0,14}?([0-9][0-9,]*\.[0-9]{2})/i;
const DECIMAL_AMOUNT = /([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2})/;
const KEYWORD_INTEGER = /(?:total|amount|balance|due|paid)[^\n]{0,14}?([0-9][0-9,]*)/i;
const CURRENCY = /\b(USD|EUR|GBP|JPY|CAD|AUD|CHF|INR|SGD)\b|([€$£¥])/i;
// The hyphen is required. Without it this matched the words "INVOICE" and
// "REFERENCE" (INV+OICE, REF+ERENCE) and reported them as reference numbers.
const REFERENCE = /\b((?:INV|REF|RCPT|BNK|PO|CHK|SVC|REM|GL)-[A-Z0-9]{2,}(?:-[A-Z0-9]+)*)\b/i;
const DATE = /\b(20\d{2}-\d{2}-\d{2})\b|\b(\d{2}\/\d{2}\/20\d{2})\b/;
const SYMBOL_TO_CODE: Record<string, string> = { '€': 'EUR', $: 'USD', '£': 'GBP', '¥': 'JPY' };

function classify(text: string): ExtractedFields['documentType'] {
  const lower = text.toLowerCase();
  if (/bank statement|statement of account|opening balance|closing balance/.test(lower)) return 'bank_statement';
  if (/remittance/.test(lower)) return 'remittance';
  if (/fee schedule|service charge|maintenance fee/.test(lower)) return 'fee_schedule';
  if (/invoice|inv[- ]?no|bill to/.test(lower)) return 'invoice';
  if (/receipt|paid in full|thank you for your payment/.test(lower)) return 'receipt';
  return 'unknown';
}

function normalizeDate(raw?: string): string | undefined {
  // Only the unambiguous ISO form is trusted. dd/mm/yyyy and mm/dd/yyyy are
  // indistinguishable on most days, and a transaction date silently off by
  // months is worse than no date at all — the FX controls read this field.
  return raw && /^20\d{2}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
}

export function fieldsFromText(text: string): ExtractedFields {
  const amountMatch =
    text.match(KEYWORD_AMOUNT) ?? text.match(DECIMAL_AMOUNT) ?? text.match(KEYWORD_INTEGER);
  const currencyMatch = text.match(CURRENCY);
  const referenceMatch = text.match(REFERENCE);
  const dateMatch = text.match(DATE);

  const currencyRaw = currencyMatch?.[1] ?? currencyMatch?.[2];
  return {
    documentType: classify(text),
    amount: amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : undefined,
    currency: currencyRaw ? (SYMBOL_TO_CODE[currencyRaw] ?? currencyRaw.toUpperCase()) : undefined,
    reference: referenceMatch?.[1]?.toUpperCase(),
    transactionDate: normalizeDate(dateMatch?.[1] ?? dateMatch?.[2]),
    notes: undefined,
  };
}

/* ---------------------------------------------------------- model reading */

const EXTRACTION_PROMPT = [
  'You are reading one financial document for a bank reconciliation.',
  'Extract only what the document actually says. If a field is not visible, omit it — do not infer, and do not compute totals that are not printed.',
  'Reply with JSON only, no prose, in this shape:',
  '{"documentType":"invoice|receipt|bank_statement|fee_schedule|remittance|unknown","counterparty":"","amount":0,"currency":"USD","reference":"","transactionDate":"YYYY-MM-DD","notes":""}',
].join('\n');

async function readWithModel(
  bytes: Buffer,
  extension: string,
): Promise<{ fields: ExtractedFields; excerpt: string } | null> {
  const apiKey = process.env.VERITY_MODEL_API_KEY ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const base64 = bytes.toString('base64');

  const content: Anthropic.ContentBlockParam[] =
    extension === 'pdf'
      ? [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: EXTRACTION_PROMPT },
        ]
      : [
          {
            type: 'image',
            source: { type: 'base64', media_type: IMAGE_MEDIA[extension] ?? 'image/png', data: base64 },
          },
          { type: 'text', text: EXTRACTION_PROMPT },
        ];

  const response = await client.messages.create({
    model: process.env.VERITY_MODEL ?? 'claude-opus-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const json = text.match(/\{[\s\S]*\}/);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json[0]) as ExtractedFields;
    return { fields: parsed, excerpt: text.slice(0, 600) };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------- public API */

export async function extractDocument(
  fileName: string,
  bytes: Buffer,
): Promise<ExtractionResult | { error: string }> {
  const extension = extensionOf(fileName) as SupportedExtension;
  if (!isSupported(fileName)) {
    return {
      error: `Verity cannot read .${extension || '?'} files. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}.`,
    };
  }
  if (bytes.length > MAX_UPLOAD_BYTES) {
    return { error: `That file is ${(bytes.length / 1024 / 1024).toFixed(1)} MB; the limit is 8 MB.` };
  }

  const warnings: string[] = [];

  if (extension === 'pdf' || extension in IMAGE_MEDIA) {
    const read = await readWithModel(bytes, extension);
    if (read) {
      return {
        fileName,
        extension,
        bytes: bytes.length,
        extractedBy: 'model',
        fields: read.fields,
        excerpt: read.excerpt,
        warnings,
      };
    }
    warnings.push(
      'No model key is configured, so this file was accepted but not read. Set ANTHROPIC_API_KEY to extract from images and PDFs.',
    );
    return {
      fileName,
      extension,
      bytes: bytes.length,
      extractedBy: 'none',
      fields: { documentType: 'unknown' },
      excerpt: '',
      warnings,
    };
  }

  let text = '';
  if (extension === 'docx' || extension === 'xlsx') {
    try {
      text = await textFromOoxml(bytes, extension);
    } catch {
      warnings.push('That Office file could not be unpacked.');
    }
  } else {
    text = bytes.toString('utf8');
  }

  if (!text.trim()) {
    return {
      fileName,
      extension,
      bytes: bytes.length,
      extractedBy: 'none',
      fields: { documentType: 'unknown' },
      excerpt: '',
      warnings: [...warnings, 'No readable text was found in this file.'],
    };
  }

  const fields = fieldsFromText(text);
  if (fields.amount === undefined) {
    warnings.push('No amount was found, so nothing can be reconciled against it yet.');
  }
  if (!fields.reference) {
    warnings.push('No reference was found, so matching will rely on counterparty and amount.');
  }

  return {
    fileName,
    extension,
    bytes: bytes.length,
    extractedBy: 'deterministic',
    fields,
    excerpt: text.replace(/\s+/g, ' ').trim().slice(0, 600),
    warnings,
  };
}

/** Turns an extraction into the evidence record the agent's tools can retrieve. */
export function asSupportingDocument(result: ExtractionResult, id: string): SupportingDocument {
  return {
    id,
    docType: result.fields.documentType,
    issuedDate: result.fields.transactionDate ?? new Date().toISOString().slice(0, 10),
    counterparty: result.fields.counterparty ?? 'Unknown counterparty',
    amount: result.fields.amount ?? 0,
    currency: result.fields.currency ?? 'USD',
    reference: result.fields.reference ?? id,
    fields: {
      uploadedFile: result.fileName,
      extractedBy: result.extractedBy,
      ...(result.fields.transactionDate ? { transactionDate: result.fields.transactionDate } : {}),
      ...(result.fields.notes ? { notes: result.fields.notes } : {}),
    },
  };
}
