"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const REASONS = [
  { value: "unsportsmanlike", label: "Unsportsmanlike Conduct" },
  { value: "harassment", label: "Harassment" },
  { value: "no_show", label: "No Show" },
  { value: "cheating", label: "Cheating" },
  { value: "other", label: "Other" },
];

interface ReportPlayerModalProps {
  reportedId: string;
  reportedName: string;
  open: boolean;
  onClose: () => void;
}

export function ReportPlayerModal({
  reportedId,
  reportedName,
  open,
  onClose,
}: ReportPlayerModalProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function submit() {
    if (!reason) return;
    startTransition(async () => {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reported_id: reportedId,
          reason,
          details: details || undefined,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(onClose, 2000);
      }
    });
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm rounded-2xl glass p-6 text-center">
          <p className="text-3xl mb-2">{"\u2705"}</p>
          <p className="text-zinc-100 font-medium">Report submitted</p>
          <p className="text-sm text-zinc-400 mt-1">
            An admin will review this shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl glass p-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">
          Report {reportedName}
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          This report will be reviewed by venue administrators.
        </p>

        <div className="space-y-2 mb-4">
          {REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={cn(
                "w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all border",
                reason === r.value
                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Additional details (optional)"
          className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!reason || isPending}
            className={cn(
              "flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all",
              reason
                ? "bg-red-600 hover:bg-red-500"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            )}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
