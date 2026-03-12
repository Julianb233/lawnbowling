"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BOWLS_POSITION_LABELS, type BowlsPosition, type SkillLevel } from "@/lib/types";

interface VisitRequestModalProps {
  clubId: string;
  clubName: string;
  open: boolean;
  onClose: () => void;
}

export function VisitRequestModal({ clubId, clubName, open, onClose }: VisitRequestModalProps) {
  const [requestedDate, setRequestedDate] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");
  const [positions, setPositions] = useState<BowlsPosition[]>([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  function togglePosition(pos: BowlsPosition) {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/clubs/visit-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: clubId,
          requested_date: requestedDate,
          skill_level: skillLevel,
          preferred_positions: positions,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit request");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Min date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#0A2E12]/10 px-6 py-4">
          <h2 className="text-lg font-black text-[#0A2E12]">
            {success ? "Request Sent!" : `Visit ${clubName}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#3D5A3E] hover:bg-[#0A2E12]/5 hover:text-[#3D5A3E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/10">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-sm text-[#3D5A3E]">
              Your visit request has been submitted. The club will be notified
              and you&apos;ll receive a notification when they respond.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-bold text-white hover:bg-[#145218]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-[#2D4A30] mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                required
                min={minDate}
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full rounded-xl border border-[#0A2E12]/10 px-4 py-3 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              />
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-semibold text-[#2D4A30] mb-1">
                Skill Level
              </label>
              <div className="flex gap-2">
                {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSkillLevel(level)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${
                        skillLevel === level
                          ? "border-[#1B5E20] bg-[#1B5E20]/5 text-[#1B5E20]"
                          : "border-[#0A2E12]/10 text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                      }`}
                    >
                      {level}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Preferred Positions */}
            <div>
              <label className="block text-sm font-semibold text-[#2D4A30] mb-1">
                Preferred Positions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(BOWLS_POSITION_LABELS) as BowlsPosition[]).map(
                  (pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => togglePosition(pos)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                        positions.includes(pos)
                          ? "border-[#1B5E20] bg-[#1B5E20]/5 text-[#1B5E20] font-semibold"
                          : "border-[#0A2E12]/10 text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03]"
                      }`}
                    >
                      <span className="font-medium">
                        {BOWLS_POSITION_LABELS[pos].label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-[#2D4A30] mb-1">
                Message <span className="font-normal text-[#3D5A3E]">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself or mention any special requirements..."
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-[#0A2E12]/10 px-4 py-3 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !requestedDate}
              className="w-full rounded-xl bg-[#1B5E20] px-4 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Visit Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
