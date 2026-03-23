"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Save, Loader2 } from "lucide-react";
import type { SkillLevel } from "@/lib/db/players";
import type { NotificationPreferences } from "@/lib/types";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { MyVisitRequests } from "@/components/clubs/MyVisitRequests";
import { BottomNav } from "@/components/board/BottomNav";

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DEFAULT_PREFS: NotificationPreferences = {
  player_id: "",
  push_partner_requests: true,
  push_match_ready: true,
  push_friend_checkin: true,
  push_scheduled_reminder: true,
  email_weekly_summary: true,
  email_upcoming_games: true,
  profile_public: true,
  stats_public: true,
  event_reminders: true,
  new_events: true,
  tournament_results: true,
  chat_messages: true,
  club_announcements: true,
  updated_at: "",
};

interface PlayerData {
  display_name: string;
  skill_level: SkillLevel;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("beginner");
  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPreferences>(DEFAULT_PREFS);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, prefsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/settings/notifications"),
        ]);

        if (profileRes.status === 401) {
          router.push("/login");
          return;
        }
        if (!profileRes.ok) throw new Error("Failed to load profile");

        const player: PlayerData = await profileRes.json();
        setDisplayName(player.display_name);
        setSkillLevel(player.skill_level);

        if (prefsRes.ok) {
          const prefs = await prefsRes.json();
          setNotifPrefs(prefs);
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  async function handleSave() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          skill_level: skillLevel,
          sports: ["lawn_bowling"],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleSignOutAll() {
    setSigningOutAll(true);
    await fetch("/api/auth/logout-all", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FEFCF9" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-24" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm hover:opacity-70 min-h-[44px]"
          style={{ color: "#3D5A3E" }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1
          className="mb-8 text-2xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
        >
          Settings
        </h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            Settings saved
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Settings Card */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
            <h2
              className="mb-4 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Profile
            </h2>

            <div className="space-y-5">
              {/* Display Name */}
              <div>
                <label
                  htmlFor="display-name"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "#3D5A3E" }}
                >
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-3 outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 min-h-[44px] transition"
                  style={{ color: "#0A2E12" }}
                  placeholder="Your display name"
                />
              </div>

              {/* Skill Level */}
              <div>
                <label
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "#3D5A3E" }}
                >
                  Skill Level
                </label>
                <div className="flex gap-2">
                  {SKILL_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevel(level.value)}
                      className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                        skillLevel === level.value
                          ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                          : "border-[#0A2E12]/10 bg-white hover:bg-[#0A2E12]/[0.03]"
                      }`}
                      style={skillLevel !== level.value ? { color: "#3D5A3E" } : undefined}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || !displayName.trim()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Visit Requests Card */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
            <h2
              className="mb-4 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              My Visit Requests
            </h2>
            <MyVisitRequests />
          </div>

          {/* Notification Preferences Card */}
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
            <h2
              className="mb-4 text-lg font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#0A2E12" }}
            >
              Notifications
            </h2>
            <NotificationSettings preferences={notifPrefs} />
          </div>

          {/* Sign Out */}
          <div className="space-y-3">
            <button
              onClick={handleSignOut}
              disabled={signingOut || signingOutAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 min-h-[44px] transition-colors"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
            <button
              onClick={handleSignOutAll}
              disabled={signingOut || signingOutAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/60 px-6 py-3 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50 min-h-[44px] transition-colors"
            >
              {signingOutAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {signingOutAll ? "Signing out all devices..." : "Sign Out All Devices"}
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
