"use client";

import { useState, useEffect, useCallback } from "react";
import { Plane, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { VisitRequest, VisitRequestStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<VisitRequestStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending" },
  accepted: { icon: CheckCircle2, color: "text-green-600 bg-green-50 border-green-200", label: "Accepted" },
  declined: { icon: XCircle, color: "text-red-500 bg-red-50 border-red-200", label: "Declined" },
  expired: { icon: AlertCircle, color: "text-[#3D5A3E] bg-[#0A2E12]/[0.03] border-[#0A2E12]/10", label: "Expired" },
};

export function MyVisitRequests() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clubs/visit-request");
      if (res.ok) {
        const data = await res.json();
        setRequests(data ?? []);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-[#0A2E12]/5" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white/80 p-6 text-center">
        <Plane className="mx-auto mb-2 h-8 w-8 text-[#3D5A3E]" />
        <p className="text-sm text-[#3D5A3E]">
          No visit requests yet. Browse clubs and request a visit!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const config = STATUS_CONFIG[req.status];
        const StatusIcon = config.icon;
        const date = new Date(req.requested_date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return (
          <div
            key={req.id}
            className="rounded-xl border border-[#0A2E12]/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0A2E12] truncate">
                  {req.club?.name ?? req.club_id}
                </p>
                <p className="mt-0.5 text-xs text-[#3D5A3E]">
                  {date}
                </p>
                {req.preferred_positions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {req.preferred_positions.map((pos) => (
                      <span
                        key={pos}
                        className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-[10px] font-medium capitalize text-[#3D5A3E]"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold",
                  config.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </span>
            </div>

            {req.status === "accepted" && req.visit_token && (
              <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                Your visit is approved! Use the check-in link sent to you on the day of your visit.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
