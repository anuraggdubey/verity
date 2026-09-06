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
  const [selectedReason, setSelectedReason] = useState('wrong_fx_rate');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [isBlocked]);

  const handleApprove = () => {
    setStatusMessage('Approved. Journal posted to sandbox ledger.');
    onDecision('approve');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleConfirmReject = () => {
    setStatusMessage(`Rejected: ${selectedReason}. Logged to failure store.`);
    setShowRejectModal(false);
    onDecision('reject', selectedReason);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleEscalate = () => {
    setStatusMessage('Escalated to senior controller.');
    onDecision('escalate');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <>
      {statusMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-emerald-200 bg-white px-4 py-2.5 text-xs text-emerald-700 shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/95 px-3 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-2 border-r border-black/[0.06] pr-3 mr-1 text-xs text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-zinc-700">Controller</span>
          </div>

          <button
            onClick={handleApprove}
            disabled={isBlocked}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors select-none ${
              isBlocked
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors select-none"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reject</span>
            <KbdBadge className="text-rose-500 bg-rose-50 border-rose-200">R</KbdBadge>
          </button>

          <button
            onClick={handleEscalate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors select-none"
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
              Rejection Notice
            </h4>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Rejections feed into Verity&apos;s failure grouping to draft new Control PRs. Select a reason code:
            </p>

            <div className="space-y-2 mb-6">
              {[
                { code: 'wrong_fx_rate', label: 'VERITY-FX-003: Unapproved or Outdated FX Oracle Rate' },
                { code: 'wrong_entity', label: 'VERITY-ACCT-004: Incorrect Legal Entity GL Account' },
                { code: 'unsupported_claim', label: 'VERITY-EVID-003: Citation Claim Missing Direct Evidence' },
                { code: 'closed_period', label: 'VERITY-ACCT-002: Target Ledger Period is Closed' },
              ].map((reason) => (
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
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 transition-colors"
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
