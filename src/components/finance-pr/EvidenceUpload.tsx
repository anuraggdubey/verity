'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, FileUp, Loader2, Paperclip } from 'lucide-react';

type Extraction = {
  fileName: string;
  extension: string;
  bytes: number;
  extractedBy: 'model' | 'deterministic' | 'none';
  fields: {
    documentType: string;
    counterparty?: string;
    amount?: number;
    currency?: string;
    reference?: string;
    transactionDate?: string;
  };
  warnings: string[];
};

type Accepted = { extraction: Extraction; document: { id: string } };

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,.csv,.tsv,.txt,.md,.json,.docx,.xlsx';

const HOW: Record<Extraction['extractedBy'], string> = {
  model: 'read by the model',
  deterministic: 'parsed directly',
  none: 'not read',
};

/**
 * Attach receipts, invoices and statements to a case.
 *
 * An upload becomes a supporting document the agent can retrieve and must cite
 * — it is evidence, not a decision. Nothing here posts to the ledger, and a
 * claim about an uploaded file is checked by the evidence-lineage controls like
 * any other claim. How each file was read is always shown, so a file we could
 * not open never looks like one we understood.
 */
export function EvidenceUpload({ onUploaded }: { onUploaded?: () => void | Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState<Accepted[]>([]);
  const [rejected, setRejected] = useState<{ fileName: string; reason: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      for (const file of Array.from(files)) form.append('files', file);

      const response = await fetch('/api/evidence/upload', { method: 'POST', body: form });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? 'Upload failed.');
        return;
      }
      setAccepted(body.accepted ?? []);
      setRejected(body.rejected ?? []);
      await onUploaded?.();
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2">
        <Paperclip className="h-4 w-4 text-zinc-400" />
        <h3 className="text-xs font-semibold text-zinc-900">Attach evidence</h3>
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        Receipts, invoices, remittances, statements. Each becomes a document the agent can retrieve
        and must cite — evidence, never a decision. PDF, PNG, JPG, WEBP, GIF, CSV, TSV, TXT, MD,
        JSON, DOCX, XLSX, up to 8 MB.
      </p>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/[0.12] bg-zinc-50/60 px-3 py-6 text-xs text-zinc-500 transition-colors hover:border-black/[0.2] hover:text-zinc-700"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        {busy ? 'Reading…' : 'Drop files here, or click to choose'}
      </div>

      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />

      {error && <p className="text-[11px] text-rose-600">{error}</p>}

      {rejected.map((entry) => (
        <p key={entry.fileName} className="flex items-start gap-1.5 text-[11px] text-amber-800">
          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            <span className="font-medium">{entry.fileName}</span> — {entry.reason}
          </span>
        </p>
      ))}

      {accepted.map(({ extraction, document }) => (
        <div key={document.id} className="rounded-lg border border-black/[0.06] bg-zinc-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-zinc-800">{document.id}</span>
            <span className="text-[11px] text-zinc-500">{extraction.fileName}</span>
            <span
              className={`rounded-full border px-1.5 py-0.5 font-mono text-[10px] ${
                extraction.extractedBy === 'none'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {HOW[extraction.extractedBy]}
            </span>
          </div>

          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:grid-cols-3">
            {[
              ['Type', extraction.fields.documentType],
              ['Counterparty', extraction.fields.counterparty],
              [
                'Amount',
                extraction.fields.amount !== undefined
                  ? `${extraction.fields.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${extraction.fields.currency ?? ''}`.trim()
                  : undefined,
              ],
              ['Reference', extraction.fields.reference],
              ['Transaction date', extraction.fields.transactionDate],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">{label}</dt>
                <dd className={value ? 'text-zinc-800' : 'text-zinc-400'}>{value ?? 'not found'}</dd>
              </div>
            ))}
          </dl>

          {extraction.warnings.map((warning) => (
            <p key={warning} className="mt-1.5 text-[11px] text-amber-800">
              {warning}
            </p>
          ))}
        </div>
      ))}

      {accepted.length > 0 && (
        <p className="text-[11px] text-zinc-500">
          Registered as evidence. Re-run the worker on this case and it can retrieve these with
          <span className="font-mono"> get_supporting_document</span>; any claim it makes about them
          is checked by the evidence-lineage controls.
        </p>
      )}
    </div>
  );
}
