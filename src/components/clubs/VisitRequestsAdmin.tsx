"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, X, Clock, User, MapPin } from "lucide-react";
import type { VisitRequest, VisitRequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface VisitRequestsAdminProps {
  clubId: string;
}

export function VisitRequestsAdmin({ clubId }: VisitRequestsAdminProps) {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/visit-request?club_id=${clubId}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, [clubId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleRespond(requestId: string, action: "accept" | "decline") {
    setRespondingId(requestId);
    try {
      const res = await fetch(`/api/clubs/visit-request/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        // Refresh the list
        await fetchRequests();
      }
    } catch {
      // ignore
    }
    setRespondingId(null);
  }

  const STATUS_LABELS: Record<VisitRequestStatus, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-amber-600 bg-amber-50" },
    accepted: { label: "Accepted", color: "text-green-600 bg-green-50" },
    declined: { label: "Declined", color: "text-red-500 bg-red-50" },
    expired: { label: "Expired", color: "text-[#3D5A3E] bg-[#0A2E12]/[0.03]" },
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-[#0A2E12]/5" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-8 text-center">
        <MapPin className="mx-auto mb-3 h-10 w-10 text-[#3D5A3E]" />
        <p className="text-sm text-[#3D5A3E]">No visit requests yet.</p>
      </div>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Pending requests */}
      {pending.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]">
            Pending ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((req) => {
              const date = new Date(req.requested_date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              const isResponding = respondingId === req.id;

              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <User className="h-5 w-5 text-amber-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#0A2E12]">
                        {req.player?.display_name ?? "Unknown Player"}
                      </p>
                      <p className="text-xs text-[#3D5A3E]">
                        <Clock className="inline h-3 w-3 mr-0.5" />
                        {date}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-[10px] font-medium capitalize text-[#3D5A3E]">
                          {req.skill_level}
                        </span>
                        {req.preferred_positions.map((pos) => (
                          <span
                            key={pos}
                            className="rounded-full bg-[#1B5E20]/10 px-2 py-0.5 text-[10px] font-medium capitalize text-[#1B5E20]"
                          >
                            {pos}
                          </span>
                        ))}
                      </div>
                      {req.message && (
                        <p className="mt-2 text-xs italic text-[#3D5A3E]">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleRespond(req.id, "accept")}
                      disabled={isResponding}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1B5E20] px-3 py-2 text-xs font-bold text-white hover:bg-[#145218] disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, "decline")}
                      disabled={isResponding}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-2 text-xs font-bold text-[#3D5A3E] hover:bg-[#0A2E12]/[0.03] disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved requests */}
      {resolved.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3D5A3E]">
            History ({resolved.length})
          </h3>
          <div className="space-y-2">
            {resolved.map((req) => {
              const statusConfig = STATUS_LABELS[req.status];
              const date = new Date(req.requested_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={req.id}
                  className="flex items-center gap-3 rounded-xl border border-[#0A2E12]/10 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2D4A30] truncate">
                      {req.player?.display_name ?? "Unknown Player"}
                    </p>
                    <p className="text-xs text-[#3D5A3E]">{date}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                      statusConfig.color
                    )}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
