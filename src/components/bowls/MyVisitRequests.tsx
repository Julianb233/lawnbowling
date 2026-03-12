"use client";

import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
import type { VisitRequest } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-[#0A2E12]/5 text-[#3D5A3E] border-[#0A2E12]/10",
};

export function MyVisitRequests() {
  const [requests, setRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clubs/visit-request")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRequests(data))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-[#3D5A3E]">
        Loading visit requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-6 text-center">
        <MapPin className="mx-auto h-8 w-8 text-[#3D5A3E]" />
        <p className="mt-2 text-sm text-[#3D5A3E]">
          No visit requests yet. Browse the{" "}
          <a href="/clubs" className="text-[#1B5E20] hover:underline">
            club directory
          </a>{" "}
          to find clubs to visit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-xl border border-[#0A2E12]/10 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#0A2E12] truncate">
                {req.club_id}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-[#3D5A3E]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {req.requested_date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
              </div>
              {req.preferred_positions.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {req.preferred_positions.map((pos) => (
                    <span
                      key={pos}
                      className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-[11px] font-medium text-[#3D5A3E] capitalize"
                    >
                      {pos}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                STATUS_STYLES[req.status] || STATUS_STYLES.pending
              }`}
            >
              {req.status}
            </span>
          </div>
          {req.status === "accepted" && req.visit_token && (
            <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-xs font-semibold text-green-700">
                Your visit is confirmed! Use this link to check in:
              </p>
              <a
                href={`/checkin?visit_token=${req.visit_token}`}
                className="mt-1 block text-xs text-[#1B5E20] hover:underline break-all"
              >
                /checkin?visit_token={req.visit_token}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
