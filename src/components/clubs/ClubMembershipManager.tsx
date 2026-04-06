"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  Crown,
  UserPlus,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CLUB_ROLE_LABELS } from "@/lib/types";
import type { ClubRole, ClubMembership } from "@/lib/types";

const ROLE_ICONS: Record<ClubRole, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  manager: Users,
  member: Users,
  visitor: Users,
};

const ROLE_COLORS: Record<ClubRole, string> = {
  owner: "text-amber-600 bg-amber-50 border-amber-200",
  admin: "text-purple-600 bg-purple-50 border-purple-200",
  manager: "text-blue-600 bg-blue-50 border-blue-200",
  member: "text-[#3D5A3E] bg-[#0A2E12]/[0.03] border-[#0A2E12]/10",
  visitor: "text-[#3D5A3E] bg-[#0A2E12]/[0.03] border-[#0A2E12]/10",
};

interface ClubMembershipManagerProps {
  clubId: string;
  currentUserRole: ClubRole;
}

export function ClubMembershipManager({ clubId, currentUserRole }: ClubMembershipManagerProps) {
  const [memberships, setMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteRole, setInviteRole] = useState<ClubRole>("member");
  const [inviteEmail, setInviteEmail] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ club_id: clubId });
    if (filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/clubs/memberships?${params}`);
    if (res.ok) {
      const data = await res.json();
      setMemberships(data.memberships ?? []);
    }
    setLoading(false);
  }, [clubId, filter]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  async function handleGenerateInvite() {
    setGeneratingInvite(true);
    const res = await fetch("/api/clubs/memberships/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ club_id: clubId, role: inviteRole, ...(inviteEmail.trim() && { email: inviteEmail.trim() }) }),
    });
    if (res.ok) {
      const data = await res.json();
      setInviteCode(data.invite_code);
    }
    setGeneratingInvite(false);
  }

  async function handleCopyInvite() {
    if (!inviteCode) return;
    const url = `${window.location.origin}/clubs/join/${inviteCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleUpdateRole(membershipId: string, newRole: ClubRole) {
    const res = await fetch("/api/clubs/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: membershipId, role: newRole }),
    });
    if (res.ok) {
      fetchMemberships();
    }
    setEditingId(null);
  }

  async function handleApprove(membershipId: string) {
    const res = await fetch("/api/clubs/memberships", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: membershipId, status: "active" }),
    });
    if (res.ok) fetchMemberships();
  }

  async function handleRemove(membershipId: string) {
    const res = await fetch("/api/clubs/memberships", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: membershipId }),
    });
    if (res.ok) fetchMemberships();
  }

  const filtered = memberships.filter((m) => {
    if (!searchQuery) return true;
    return m.player?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const assignableRoles: ClubRole[] = currentUserRole === "owner"
    ? ["admin", "manager", "member", "visitor"]
    : ["manager", "member", "visitor"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0A2E12]">Members</h2>
        {canManage && (
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1B5E20] px-3 py-2 text-sm font-medium text-white hover:bg-[#1B5E20]/90 min-h-[44px]"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </button>
        )}
      </div>

      {/* Invite panel */}
      <AnimatePresence>
        {showInvite && canManage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#3D5A3E]">
                  Invite as
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ClubRole)}
                  className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-2 text-sm text-[#0A2E12] min-h-[44px]"
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {CLUB_ROLE_LABELS[r].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[#3D5A3E]">
                  Email (optional — sends invite automatically)
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full rounded-lg border border-[#0A2E12]/10 bg-white px-3 py-2 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/40 min-h-[44px]"
                />
              </div>

              <button
                onClick={handleGenerateInvite}
                disabled={generatingInvite}
                className="w-full rounded-lg bg-[#1B5E20] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1B5E20]/90 disabled:opacity-50 min-h-[44px]"
              >
                {generatingInvite ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : inviteEmail.trim() ? (
                  "Send Invite Email"
                ) : (
                  "Generate Invite Link"
                )}
              </button>

              {inviteCode && (
                <div className="flex items-center gap-2 rounded-lg bg-[#0A2E12]/[0.03] p-3">
                  <code className="flex-1 text-xs text-[#3D5A3E] truncate">
                    {window.location.origin}/clubs/join/{inviteCode}
                  </code>
                  <button
                    onClick={handleCopyInvite}
                    className="shrink-0 rounded-md p-2 hover:bg-[#0A2E12]/5:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-[#3D5A3E]" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[36px]",
              filter === f
                ? "bg-[#1B5E20] text-white"
                : "bg-[#0A2E12]/5 text-[#3D5A3E] hover:text-[#2D4A30]"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A3E]" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[#0A2E12]/10 bg-white pl-9 pr-4 py-2.5 text-sm text-[#0A2E12] placeholder-[#3D5A3E] min-h-[44px]"
        />
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#3D5A3E]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#3D5A3E]">
          No members found
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => {
            const RoleIcon = ROLE_ICONS[m.role];
            const isPending = m.status === "pending";

            return (
              <div
                key={m.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3",
                  isPending
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-[#0A2E12]/10 bg-white"
                )}
              >
                {/* Avatar */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#0A2E12]/5">
                  {m.player?.avatar_url ? (
                    <img src={m.player.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#3D5A3E]">
                      {m.player?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0A2E12]">
                    {m.player?.display_name ?? "Pending invite"}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        ROLE_COLORS[m.role]
                      )}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {m.role}
                    </span>
                    {isPending && (
                      <span className="text-[10px] font-medium text-amber-600">Pending</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canManage && m.role !== "owner" && (
                  <div className="flex items-center gap-1">
                    {isPending && (
                      <button
                        onClick={() => handleApprove(m.id)}
                        className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100:bg-green-900 min-h-[36px]"
                      >
                        Approve
                      </button>
                    )}

                    {/* Role selector */}
                    <div className="relative">
                      <button
                        onClick={() => setEditingId(editingId === m.id ? null : m.id)}
                        className="rounded-lg p-1.5 hover:bg-[#0A2E12]/5:bg-white/10 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <ChevronDown className="h-4 w-4 text-[#3D5A3E]" />
                      </button>
                      {editingId === m.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-[#0A2E12]/10 bg-white py-1 shadow-lg">
                          {assignableRoles.map((r) => (
                            <button
                              key={r}
                              onClick={() => handleUpdateRole(m.id, r)}
                              className={cn(
                                "block w-full px-3 py-2 text-left text-xs hover:bg-[#0A2E12]/[0.03]:bg-white/10",
                                r === m.role ? "font-bold text-[#1B5E20]" : "text-[#3D5A3E]"
                              )}
                            >
                              {CLUB_ROLE_LABELS[r].label}
                            </button>
                          ))}
                          <hr className="my-1 border-[#0A2E12]/10" />
                          <button
                            onClick={() => handleRemove(m.id)}
                            className="block w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50:bg-red-950"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
