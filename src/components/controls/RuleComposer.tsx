'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2, Sparkles, X } from 'lucide-react';

import type { ConstrainedRule } from '../../lib/contracts/types';

type Simulation = {
  wouldBlock: { proposalId: string; caseId: string; why: string }[];
  stillAllowed: string[];
  wouldBlockApproved: string[];
  totalEvaluated: number;
  notApplicable: number;
  summary: string;
};

type Draft = {
  rule: ConstrainedRule;
  restatement: string;
  simulation: Simulation;
  draftedBy: 'model' | 'offline';
};

const EXAMPLES = [
  'FX rates must be dated the invoice transaction date',
  'Only use FX rates from an approved provider',
  'Never post into a closed accounting period',
  'Any journal entry must cite a supporting document',
];

/**
 * Write a control in plain English.
 *
 * The model does not write code and cannot switch anything on. It fills the
 * same constrained schema the engine already evaluates, the draft is checked
 * against what the engine can actually read, and then it is simulated over
 * every stored proposal so a reviewer sees which real decisions it would have
 * stopped — including any a controller had already approved. Only after that
 * can it be proposed, and it still has to be replayed and merged.
 */
export function RuleComposer({ onProposed }: { onProposed?: () => void | Promise<void> }) {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState<'draft' | 'propose' | null>(null);
  const [proposed, setProposed] = useState<string | null>(null);

  async function drafting() {
    setBusy('draft');
    setError(null);
    setSuggestions([]);
    setDraft(null);
    setProposed(null);
    try {
      const response = await fetch('/api/control-prs/compose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setError(body.error ?? 'Could not draft that rule.');
        setSuggestions(body.suggestions ?? []);
        return;
      }
      setDraft({
        rule: body.rule,
        restatement: body.restatement,
        simulation: body.simulation,
        draftedBy: body.draftedBy,
      });
    } finally {
      setBusy(null);
    }
  }

  async function propose() {
    setBusy('propose');
    setError(null);
    try {
      const response = await fetch('/api/control-prs/compose', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, propose: true }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        setError(body.error ?? 'Could not propose that rule.');
        return;
      }
      setProposed(body.controlPR?.id ?? null);
      setDraft(null);
      setText('');
      await onProposed?.();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-6 space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-zinc-900">Write a control in plain English</h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
          Describe the policy in your own words. Verity turns it into a rule its engine can
          actually check, shows you which past decisions it would have stopped, and only then
          lets you propose it. Nothing is enforced until it is replayed and merged.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder="e.g. Never post into a closed accounting period"
        className="w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={drafting}
          disabled={busy !== null || text.trim().length < 8}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
        >
          {busy === 'draft' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {busy === 'draft' ? 'Drafting…' : 'Draft the rule'}
        </button>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => setText(example)}
            className="rounded-full border border-black/[0.08] bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-600 transition-colors hover:border-black/[0.16] hover:text-zinc-900"
          >
            {example}
          </button>
        ))}
      </div>

      {proposed && (
        <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <Check className="h-3.5 w-3.5" />
          Proposed as {proposed}. Replay it below, then merge — it is not enforced yet.
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="flex items-start gap-1.5 text-xs text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setText(suggestion)}
                  className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[11px] text-amber-800 hover:border-amber-400"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {draft && (
        <div className="space-y-3 rounded-lg border border-black/[0.06] bg-zinc-50/60 p-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              What this rule will do
            </p>
            <p className="mt-1 text-sm text-zinc-900">{draft.restatement}</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Drafted {draft.draftedBy === 'model' ? 'by the model' : 'from the offline rule library (no model key configured)'}.
              Blocks as <span className="font-mono">{draft.rule.onFail.code}</span>.
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              Checked against every case on file
            </p>
            <p className="mt-1 text-sm text-zinc-800">{draft.simulation.summary}</p>

            {draft.simulation.wouldBlock.length > 0 && (
              <ul className="mt-2 space-y-1">
                {draft.simulation.wouldBlock.slice(0, 6).map((entry) => (
                  <li key={entry.proposalId} className="flex items-start gap-1.5 text-[11px] text-zinc-600">
                    <X className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" />
                    <span>
                      <span className="font-mono text-zinc-800">{entry.caseId}</span> — {entry.why}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {draft.simulation.wouldBlockApproved.length > 0 && (
              <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-800">
                This would have blocked {draft.simulation.wouldBlockApproved.join(', ')}, which a
                controller already approved. Check that before merging.
              </p>
            )}
          </div>

          <details className="text-[11px] text-zinc-500">
            <summary className="cursor-pointer select-none">Show the technical rule</summary>
            <pre className="mt-2 overflow-x-auto rounded-md border border-black/[0.06] bg-white p-2.5 font-mono text-[11px] text-zinc-700">
{JSON.stringify(draft.rule, null, 2)}
            </pre>
          </details>

          <button
            onClick={propose}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-40"
          >
            {busy === 'propose' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            {busy === 'propose' ? 'Proposing…' : 'Propose as a Control PR'}
          </button>
        </div>
      )}
    </div>
  );
}
