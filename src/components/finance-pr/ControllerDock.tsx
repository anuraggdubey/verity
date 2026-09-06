'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { KbdBadge } from '../ui/KbdBadge';

interface ControllerDockProps {
  proposalId: string;
  isBlocked: boolean;
  onDecision: (decision: 'approve' | 'reject' | 'escalate', reasonCode?: string) => void;
}

export function ControllerDock({
  proposalId,
  isBlocked,
  onDecision,
}: ControllerDockProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('WRONG_RATE_DATE');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleApprove = () => {
    setStatusMessage('Approved. Posting to the sandbox ledger and rerunning the reconciliation.');
    onDecision('approve');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleConfirmReject = () => {
    setStatusMessage(`Changes requested — reason code ${selectedReason}, recorded for failure grouping.`);
    setShowRejectModal(false);
    onDecision('reject', selectedReason);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleEscalate = () => {
    setStatusMessage('Escalated. The case waits for a human; nothing is posted.');
    onDecision('escalate');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'a' || e.key === 'A') {
        if (!isBlocked) {
          handleApprove();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        setShowRejectModal(true);
      } else if (e.key === 'e' || e.key === 'E') {
        handleEscalate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlocked, handleApprove, handleEscalate]);

  return (
    <>
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-emerald-500/40 bg-[#0d1512] px-4 py-2.5 text-xs text-emerald-300 shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Floating Dock Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#0c0d12]/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center gap-2 border-r border-white/[0.1] pr-3 mr-1 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-zinc-200">Controller Gate</span>
          </div>

          {/* Approve Button */}
          <button
            onClick={handleApprove}
            disabled={isBlocked}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all select-none ${
              isBlocked
                ? 'opacity-40 cursor-not-allowed bg-zinc-800 text-zinc-500 border border-zinc-700'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Approve & Post</span>
            <KbdBadge className={isBlocked ? 'text-zinc-600 bg-zinc-800 border-zinc-700' : 'text-zinc-900 bg-emerald-300 border-emerald-400'}>
              A
            </KbdBadge>
          </button>

          {/* Reject Button */}
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 hover:border-rose-500/50 transition-all select-none hover:scale-[1.02] active:scale-[0.98]"
          >
            <X className="h-3.5 w-3.5 text-rose-400 stroke-[2.5]" />
            <span>Reject</span>
            <KbdBadge className="text-rose-300 bg-rose-950/80 border-rose-800">
              R
            </KbdBadge>
          </button>

          {/* Escalate Button */}
          <button
            onClick={handleEscalate}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 hover:border-amber-500/50 transition-all select-none hover:scale-[1.02] active:scale-[0.98]"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 stroke-[2.5]" />
            <span>Escalate</span>
            <KbdBadge className="text-amber-300 bg-amber-950/80 border-amber-800">
              E
            </KbdBadge>
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#11131a] p-6 shadow-2xl">
            <h4 className="text-base font-semibold text-zinc-100 mb-1 flex items-center gap-2">
              <X className="h-4 w-4 text-rose-400" />
              Controller Rejection Notice
            </h4>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Rejections feed into Verity&apos;s Reviewer-Grounded Failure Grouping to draft new Control PRs. Select an audited reason code:
            </p>

            <div className="space-y-2 mb-6">
              {[
                { code: 'WRONG_RATE_DATE', label: 'FX rate dated other than the invoice transaction date' },
                { code: 'UNSUPPORTED_FX_SOURCE', label: 'FX rate from a provider outside the approved list' },
                { code: 'MISSING_EVIDENCE', label: 'A material claim has no supporting evidence' },
                { code: 'WRONG_ACCOUNT', label: 'Posted to an account outside the permitted chart' },
                { code: 'WRONG_ENTITY', label: 'Posted to an entity outside the permitted list' },
                { code: 'CLOSED_PERIOD', label: 'Journal targets a closed accounting period' },
                { code: 'DUPLICATE_POSTING', label: 'Duplicate of an entry already posted' },
                { code: 'INSUFFICIENT_NARRATIVE', label: 'Narrative does not explain the decision' },
                { code: 'OTHER', label: 'Other — explain in the rationale' },
              ].map((reason) => (
                <label
                  key={reason.code}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedReason === reason.code
                      ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                      : 'border-white/[0.06] bg-black/20 text-zinc-400 hover:border-white/[0.1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.code}
                    checked={selectedReason === reason.code}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-rose-500"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors"
              >
                Confirm Rejection & Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
