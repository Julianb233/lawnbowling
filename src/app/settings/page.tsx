"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Save, Loader2 } from "lucide-react";
import type { SkillLevel } from "@/lib/db/players";
import type { NotificationPreferences } from "@/lib/types";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { MyVisitRequests } from "@/components/clubs/MyVisitRequests";

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-animated-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-animated-gradient px-4 py-8 pb-24">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-8 text-2xl font-bold text-zinc-900">Settings</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            Settings saved
          </div>
        )}

        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label
              htmlFor="display-name"
              className="mb-2 block text-sm font-medium text-zinc-600"
            >
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
              placeholder="Your display name"
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600">
              Skill Level
            </label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSkillLevel(level.value)}
                  className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                    skillLevel === level.value
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                  }`}
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {/* Divider */}
          <div className="border-t border-zinc-200" />

          {/* Visit Requests */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600">
              My Visit Requests
            </label>
            <MyVisitRequests />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200" />

          {/* Notification Preferences */}
          <NotificationSettings preferences={notifPrefs} />

          {/* Divider */}
          <div className="border-t border-zinc-200" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 min-h-[44px] transition-colors"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
