'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { ControllerDecision, RejectReasonCode } from '@/lib/contracts/types';
import { KbdBadge } from '../ui/KbdBadge';

const REASON_CODES: { code: RejectReasonCode; label: string }[] = [
  { code: 'UNSUPPORTED_FX_SOURCE', label: 'FX rate is from an unapproved source' },
  { code: 'WRONG_RATE_DATE', label: 'FX rate date does not match the invoice date' },
  { code: 'MISSING_EVIDENCE', label: 'Missing supporting document or citation' },
  { code: 'WRONG_ACCOUNT', label: 'Wrong GL account used' },
  { code: 'WRONG_ENTITY', label: 'Wrong legal entity' },
  { code: 'DUPLICATE_POSTING', label: 'Looks like a duplicate payment' },
  { code: 'CLOSED_PERIOD', label: 'Posting into a closed accounting period' },
  { code: 'INSUFFICIENT_NARRATIVE', label: 'Explanation is too brief or unclear' },
  { code: 'OTHER', label: 'Other (please add a note)' },
];

interface ControllerDockProps {
  caseId: string;
  proposalId: string;
  isBlocked: boolean;
  decision?: ControllerDecision;
  onComplete?: () => void;
}

export function ControllerDock({
  caseId,
  proposalId,
  isBlocked,
  decision,
  onComplete,
}: ControllerDockProps) {
  const router = useRouter();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<RejectReasonCode>('WRONG_RATE_DATE');
  const [rationale, setRationale] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = useCallback((message: string) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  const postDecision = useCallback(
    async (kind: 'approve' | 'reject', reasonCode?: RejectReasonCode, note?: string) => {
      setBusy(true);
      setError(null);
      const res = await fetch(`/api/proposals/${proposalId}/decision`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          decision: kind,
          reasonCode: kind === 'reject' ? reasonCode : undefined,
          rationale: note || undefined,
        }),
      });
      const body = await res.json();
      setBusy(false);
      if (!res.ok) {
        setError(body.error ?? 'Decision failed');
        return false;
      }
      onComplete?.();
      router.refresh();
      return true;
    },
    [proposalId, router, onComplete],
  );

  const handleApprove = useCallback(async () => {
    if (isBlocked || decision || busy) return;
    const ok = await postDecision('approve');
    if (ok) flash('Approved. Journal posted to sandbox ledger.');
  }, [busy, decision, flash, isBlocked, postDecision]);

  const handleConfirmReject = useCallback(async () => {
    if (decision || busy) return;
    const ok = await postDecision('reject', selectedReason, rationale);
    if (ok) {
      setShowRejectModal(false);
      flash(`Rejected: ${selectedReason}. Logged to failure store.`);
      setRationale('');
    }
  }, [busy, decision, flash, postDecision, rationale, selectedReason]);

  const handleEscalate = useCallback(async () => {
    if (decision || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/cases/${caseId}/escalate`, { method: 'POST' });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Escalation failed');
      return;
    }
    router.refresh();
    onComplete?.();
    flash('Escalated to senior controller.');
  }, [busy, caseId, decision, flash, onComplete, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (decision || busy) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        if (!isBlocked) handleApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        setShowRejectModal(true);
      } else if (e.key === 'e' || e.key === 'E') {
        handleEscalate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, decision, handleApprove, handleEscalate, isBlocked]);

  if (decision) {
    return (
      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-[min(100vw-1.5rem,42rem)] -translate-x-1/2 sm:bottom-6 sm:w-auto">
        <div className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] text-xs">
          <span
            className={`font-semibold ${
              decision.decision === 'approve' ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {decision.decision === 'approve' ? 'Approved' : 'Rejected'}
          </span>
          <span className="text-zinc-500">
            {' '}
            by {decision.decidedBy} · {decision.decidedAt.replace('T', ' ').slice(0, 19)}
          </span>
          {decision.reasonCode && (
            <span className="block mt-1 font-mono text-zinc-500">{decision.reasonCode}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {statusMessage && (
        <div className="fixed bottom-28 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs text-emerald-700 shadow-lg sm:bottom-24 sm:w-auto">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div className="fixed bottom-28 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-xs text-rose-700 shadow-lg sm:bottom-24 sm:w-auto">
          {error}
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-1.5rem)] max-w-[min(100vw-1.5rem,42rem)] -translate-x-1/2 sm:bottom-6 sm:w-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white/95 px-3 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:flex-nowrap sm:justify-start">
          <div className="flex items-center gap-2 text-xs text-zinc-500 sm:mr-1 sm:border-r sm:border-black/[0.06] sm:pr-3">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-zinc-700">Your decision</span>
          </div>

          <a
            href={`/api/cases/${caseId}/export`}
            className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-500 border border-black/[0.08] hover:border-black/[0.12] transition-colors"
          >
            Export PR
          </a>

          <button
            onClick={handleApprove}
            disabled={isBlocked || busy}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${
              isBlocked || busy
                ? 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400 border border-zinc-200'
                : 'bg-zinc-950 text-white hover:bg-zinc-800'
            }`}
          >
            <Check className="h-3.5 w-3.5" />
            <span>Approve</span>
            <KbdBadge>A</KbdBadge>
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors select-none disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reject</span>
            <KbdBadge className="text-rose-500 bg-rose-50 border-rose-200">R</KbdBadge>
          </button>

          <button
            onClick={handleEscalate}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors select-none disabled:opacity-40"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Escalate</span>
            <KbdBadge className="text-amber-600 bg-amber-50 border-amber-200">E</KbdBadge>
          </button>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-black/[0.08] bg-white p-6 shadow-xl">
            <h4 className="text-base font-semibold text-zinc-900 mb-1 flex items-center gap-2">
              <X className="h-4 w-4 text-rose-500" />
              Why are you rejecting?
            </h4>
            <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
              Pick the main reason. This helps Verity learn which rules to add next.
            </p>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {REASON_CODES.map((reason) => (
                <label
                  key={reason.code}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason.code
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-black/[0.06] bg-zinc-50 text-zinc-600 hover:border-black/[0.1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.code}
                    checked={selectedReason === reason.code}
                    onChange={() => setSelectedReason(reason.code)}
                    className="accent-rose-500"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={2}
              placeholder="Optional rationale for the preparer…"
              className="w-full mb-4 rounded-lg border border-black/[0.08] bg-zinc-50 px-3 py-2 text-xs text-zinc-700 focus:outline-none focus:border-zinc-300"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors disabled:opacity-40"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
