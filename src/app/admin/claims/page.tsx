"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Building2, User } from "lucide-react";

interface Claim {
  id: string;
  club_id: string;
  player_id: string;
  status: "pending" | "approved" | "rejected";
  role_at_club: string | null;
  message: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  player?: { id: string; display_name: string; avatar_url: string | null };
  club?: { id: string; name: string; slug: string; city: string; state_code: string };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  async function fetchClaims() {
    setLoading(true);
    const params = filter !== "all" ? `?status=${filter}` : "";
    try {
      const res = await fetch(`/api/clubs/claims${params}`);
      const data = await res.json();
      setClaims(data.claims ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(claimId: string, action: "approve" | "reject") {
    try {
      const res = await fetch(`/api/clubs/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejection_reason: action === "reject" ? rejectionReason : undefined,
        }),
      });
      if (res.ok) {
        setRejectingId(null);
        setRejectionReason("");
        fetchClaims();
      }
    } catch {
      // ignore
    }
  }

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    approved: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const statusLabel = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-1">Club Claims</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Review and manage club ownership claims
      </p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-sm text-zinc-500">
            No {filter !== "all" ? filter : ""} claims found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Club info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-900">
                      {claim.club?.name ?? "Unknown Club"}
                    </span>
                    {claim.club && (
                      <span className="text-sm text-zinc-500">
                        {claim.club.city}, {claim.club.state_code}
                      </span>
                    )}
                  </div>

                  {/* Claimant info */}
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="font-medium">
                      {claim.player?.display_name ?? "Unknown Player"}
                    </span>
                    {claim.role_at_club && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {claim.role_at_club}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  {claim.message && (
                    <p className="mt-2 text-sm text-zinc-500 bg-zinc-50 rounded-lg p-3">
                      {claim.message}
                    </p>
                  )}

                  {/* Rejection reason */}
                  {claim.rejection_reason && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                      Reason: {claim.rejection_reason}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className="mt-2 text-xs text-zinc-400">
                    Submitted {new Date(claim.created_at).toLocaleDateString()}
                    {claim.reviewed_at &&
                      ` · Reviewed ${new Date(claim.reviewed_at).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Status badge & actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[claim.status]}
                    <span
                      className={`text-sm font-medium ${
                        claim.status === "pending"
                          ? "text-amber-600"
                          : claim.status === "approved"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {statusLabel[claim.status]}
                    </span>
                  </div>

                  {claim.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(claim.id, "approve")}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          rejectingId === claim.id
                            ? handleAction(claim.id, "reject")
                            : setRejectingId(claim.id)
                        }
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Rejection reason input */}
              {rejectingId === claim.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection (optional)..."
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                  <button
                    onClick={() => {
                      setRejectingId(null);
                      setRejectionReason("");
                    }}
                    className="text-sm text-zinc-500 hover:text-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
