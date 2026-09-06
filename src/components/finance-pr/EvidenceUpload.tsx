'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, FileUp, Loader2, Paperclip } from 'lucide-react';
import { SpotlightCard } from '../ui/SpotlightCard';

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
    <SpotlightCard className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900">Attach evidence</h3>
        </div>
        <span className="text-xs text-zinc-400">PDF, images, CSV, up to 8 MB</span>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-black/[0.1] bg-zinc-50/80 px-4 py-8 text-sm text-zinc-500 transition-colors hover:border-blue-200 hover:bg-blue-50/30 hover:text-zinc-700"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
        {busy ? 'Uploading…' : 'Drop files or click to browse'}
      </div>

      <input
        ref={input}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {rejected.map((entry) => (
        <p key={entry.fileName} className="flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{entry.fileName}: {entry.reason}</span>
        </p>
      ))}

      {accepted.map(({ extraction, document }) => (
        <div key={document.id} className="rounded-lg border border-black/[0.06] bg-zinc-50 p-3 space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-zinc-900">{extraction.fileName}</span>
            <span className="text-xs text-zinc-400">{document.id}</span>
          </div>
          {(extraction.fields.counterparty || extraction.fields.amount !== undefined) && (
            <p className="text-sm text-zinc-600">
              {[
                extraction.fields.counterparty,
                extraction.fields.amount !== undefined
                  ? `${extraction.fields.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${extraction.fields.currency ?? ''}`.trim()
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {extraction.warnings.map((warning) => (
            <p key={warning} className="text-xs text-amber-800">{warning}</p>
          ))}
        </div>
      ))}
    </SpotlightCard>
  );
}
