"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Trophy,
  Settings,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  MapPin,
  ExternalLink,
  UserPlus,
  Shield,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Club } from "@/lib/db/clubs";
import type {
  ClubMemberDetail,
  ClubDashboardStats,
  ClubTournament,
  ClubAdminTab,
} from "@/lib/db/club-types";

export default function ClubAdminDashboard() {
  const params = useParams();
  const slug = params?.slug as string;
  const stateCode = params?.state as string;

  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState<ClubDashboardStats | null>(null);
  const [members, setMembers] = useState<ClubMemberDetail[]>([]);
  const [tournaments, setTournaments] = useState<ClubTournament[]>([]);
  const [activeTab, setActiveTab] = useState<ClubAdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  // Settings form
  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");
  const [settingsWebsite, setSettingsWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchClubData = useCallback(async () => {
    if (!slug) return;
    setLoading(true);

    try {
      const supabase = createClient();

      // Verify auth and club ownership
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      // Fetch club by slug
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("slug", slug)
        .single();

      if (clubError || !clubData) {
        setError("Club not found");
        setLoading(false);
        return;
      }

      // Check if user is the club manager
      const { data: player } = await supabase
        .from("players")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

      if (!player) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const isManager = clubData.claimed_by === player.id;
      const isAdmin = player.role === "admin";

      if (!isManager && !isAdmin) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      setClub(clubData as Club);

      // Populate settings form
      setSettingsName(clubData.name || "");
      setSettingsDescription(clubData.description || "");
      setSettingsPhone(clubData.phone || "");
      setSettingsEmail(clubData.email || "");
      setSettingsWebsite(clubData.website || "");

      // Fetch members
      const { data: membersData } = await supabase
        .from("club_members")
        .select(
          "*, player:players(id, display_name, avatar_url, skill_level)"
        )
        .eq("club_id", clubData.id)
        .order("role", { ascending: true })
        .order("joined_at", { ascending: true });

      setMembers((membersData ?? []) as unknown as ClubMemberDetail[]);

      // Fetch tournaments for this club
      const { data: tournamentsData } = await supabase
        .from("tournaments")
        .select("*")
        .eq("club_id", clubData.id)
        .order("created_at", { ascending: false });

      setTournaments((tournamentsData ?? []) as ClubTournament[]);

      // Build stats manually
      const activeMembers = (membersData ?? []).filter(
        (m: { status: string }) => m.status === "active"
      ).length;
      const pendingMembers = (membersData ?? []).filter(
        (m: { status: string }) => m.status === "pending"
      ).length;
      const activeTournaments = (tournamentsData ?? []).filter(
        (t: { status: string }) => t.status === "in_progress"
      ).length;

      setStats({
        club_id: clubData.id,
        club_name: clubData.name,
        slug: clubData.slug,
        active_members: activeMembers,
        pending_members: pendingMembers,
        total_tournaments: (tournamentsData ?? []).length,
        active_tournaments: activeTournaments,
        linked_venues: 0,
      });
    } catch {
      setError("Failed to load club data");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchClubData();
  }, [fetchClubData]);

  async function handleApproveMember(memberId: string) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("club_members")
      .update({ status: "active" })
      .eq("id", memberId);

    if (!updateError) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, status: "active" } : m
        )
      );
    }
  }

  async function handleRejectMember(memberId: string) {
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("club_members")
      .delete()
      .eq("id", memberId);

    if (!deleteError) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  }

  async function handleUpdateRole(
    memberId: string,
    role: ClubMemberDetail["role"]
  ) {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("club_members")
      .update({ role })
      .eq("id", memberId);

    if (!updateError) {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m))
      );
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!club) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/clubs/managed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: club.id,
          name: settingsName,
          description: settingsDescription || null,
          phone: settingsPhone || null,
          email: settingsEmail || null,
          website: settingsWebsite || null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
          <p className="text-sm text-zinc-500">Loading club dashboard...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Access Denied</h1>
          <p className="mt-2 text-sm text-zinc-500">
            You must be the club manager or an admin to access this dashboard.
          </p>
          <Link
            href={`/clubs/${stateCode}/${slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
          >
            View Club Page
          </Link>
        </div>
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-zinc-900">Error</h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
          <Link
            href="/clubs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const TABS: { key: ClubAdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "members", label: "Members", icon: <Users className="h-4 w-4" /> },
    { key: "tournaments", label: "Tournaments", icon: <Trophy className="h-4 w-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const pendingMembers = members.filter((m) => m.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href={`/clubs/${stateCode}/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Club Page
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-zinc-900">
                  {club?.name}
                </h1>
                <p className="text-xs text-zinc-500">Club Admin Dashboard</p>
              </div>
            </div>
            <Link
              href={`/clubs/${stateCode}/${slug}`}
              className="text-sm text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
            >
              Public Page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Tab navigation */}
          <div className="mt-4 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "members" && pendingMembers.length > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                label="Active Members"
                value={stats.active_members}
                icon={<Users className="h-5 w-5 text-emerald-500" />}
              />
              <StatCard
                label="Pending"
                value={stats.pending_members}
                icon={<Clock className="h-5 w-5 text-amber-500" />}
              />
              <StatCard
                label="Tournaments"
                value={stats.total_tournaments}
                icon={<Trophy className="h-5 w-5 text-blue-500" />}
              />
              <StatCard
                label="Active Events"
                value={stats.active_tournaments}
                icon={<BarChart3 className="h-5 w-5 text-purple-500" />}
              />
            </div>

            {/* Quick Actions */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab("members")}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <UserPlus className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Manage Members
                    </p>
                    <p className="text-xs text-zinc-500">
                      {pendingMembers.length > 0
                        ? `${pendingMembers.length} pending approval`
                        : "View and manage club members"}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("tournaments")}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Trophy className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Club Tournaments
                    </p>
                    <p className="text-xs text-zinc-500">
                      {stats.active_tournaments > 0
                        ? `${stats.active_tournaments} in progress`
                        : "Create and manage tournaments"}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                    <Settings className="h-5 w-5 text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Club Settings
                    </p>
                    <p className="text-xs text-zinc-500">
                      Update club info and contact details
                    </p>
                  </div>
                </button>

                <Link
                  href={`/clubs/${stateCode}/${slug}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-left hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      View Public Page
                    </p>
                    <p className="text-xs text-zinc-500">
                      See how your club looks to visitors
                    </p>
                  </div>
                </Link>
              </div>
            </section>

            {/* Recent Members */}
            {members.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-zinc-900">
                    Recent Members
                  </h2>
                  <button
                    onClick={() => setActiveTab("members")}
                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {members.slice(0, 5).map((member) => (
                    <MemberRow key={member.id} member={member} compact />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* Pending Members */}
            {pendingMembers.length > 0 && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Approval ({pendingMembers.length})
                </h2>
                <div className="space-y-3">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl bg-white p-4 border border-amber-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600">
                          {member.player?.display_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">
                            {member.player?.display_name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Requested {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveMember(member.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectMember(member.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Members */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-900">
                  Active Members ({activeMembers.length})
                </h2>
              </div>
              {activeMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-zinc-300" />
                  <p className="mt-2 text-sm text-zinc-500">
                    No active members yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeMembers.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onRoleChange={handleUpdateRole}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">
                Club Tournaments
              </h2>
              <Link
                href="/bowls"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Tournament
              </Link>
            </div>

            {tournaments.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-zinc-300" />
                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  No Tournaments Yet
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  Create your first tournament to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-zinc-900">
                          {tournament.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                          <span className="capitalize">{tournament.format?.replace("_", " ")}</span>
                          <span className="text-zinc-300">|</span>
                          <span>{tournament.max_players} max players</span>
                          {tournament.starts_at && (
                            <>
                              <span className="text-zinc-300">|</span>
                              <span>
                                {new Date(tournament.starts_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          tournament.status === "in_progress"
                            ? "bg-emerald-100 text-emerald-700"
                            : tournament.status === "registration"
                            ? "bg-blue-100 text-blue-700"
                            : tournament.status === "completed"
                            ? "bg-zinc-100 text-zinc-600"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tournament.status === "in_progress"
                          ? "In Progress"
                          : tournament.status === "registration"
                          ? "Registration"
                          : tournament.status === "completed"
                          ? "Completed"
                          : "Cancelled"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-4">
                Club Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 mb-1.5">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={settingsDescription}
                    onChange={(e) => setSettingsDescription(e.target.value)}
                    rows={4}
                    placeholder="Tell people about your club..."
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settingsPhone}
                      onChange={(e) => setSettingsPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settingsEmail}
                      onChange={(e) => setSettingsEmail(e.target.value)}
                      placeholder="info@yourclub.com"
                      className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-1.5 block">
                    Website
                  </label>
                  <input
                    type="url"
                    value={settingsWebsite}
                    onChange={(e) => setSettingsWebsite(e.target.value)}
                    placeholder="https://yourclub.com"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {saved && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Changes saved successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50">
        {icon}
      </div>
      <p className="text-2xl font-black text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

// Member row component
function MemberRow({
  member,
  compact,
  onRoleChange,
}: {
  member: ClubMemberDetail;
  compact?: boolean;
  onRoleChange?: (memberId: string, role: ClubMemberDetail["role"]) => void;
}) {
  const ROLE_OPTIONS: { value: ClubMemberDetail["role"]; label: string }[] = [
    { value: "member", label: "Member" },
    { value: "officer", label: "Officer" },
    { value: "captain", label: "Captain" },
    { value: "coach", label: "Coach" },
    { value: "social_coordinator", label: "Social Coordinator" },
  ];

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600">
          {member.player?.display_name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">
            {member.player?.display_name ?? "Unknown"}
          </p>
          {!compact && (
            <p className="text-xs text-zinc-500">
              Joined {new Date(member.joined_at ?? member.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {compact ? (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 capitalize">
            {member.role}
          </span>
        ) : onRoleChange ? (
          <select
            value={member.role}
            onChange={(e) =>
              onRoleChange(member.id, e.target.value as ClubMemberDetail["role"])
            }
            className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-700 focus:border-blue-300 focus:outline-none"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 capitalize">
            {member.role}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            member.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : member.status === "pending"
              ? "bg-amber-100 text-amber-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {member.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
