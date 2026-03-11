"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Save, Loader2, Sun, Moon, Monitor } from "lucide-react";
import { ContactPreferencesEditor } from "@/components/profile/ContactPreferences";
import { HomeClubSelector } from "@/components/clubs/HomeClubSelector";
import { useTheme } from "@/components/ThemeProvider";
import type { SkillLevel, Sport } from "@/lib/db/players";

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SPORTS: { value: Sport; label: string }[] = [
  { value: "pickleball", label: "Pickleball" },
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Badminton" },
  { value: "table_tennis", label: "Table Tennis" },
  { value: "lawn_bowling", label: "Lawn Bowling" },
];

interface PlayerData {
  display_name: string;
  skill_level: SkillLevel;
  sports: Sport[];
  home_club_id: string | null;
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
  const [sports, setSports] = useState<Sport[]>([]);
  const [homeClubId, setHomeClubId] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  function setThemeMode(mode: "light" | "dark" | "system") {
    if (mode === "system") {
      localStorage.removeItem("lb-color-scheme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(mode);
    }
  }

  const currentMode = (() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("lb-color-scheme");
    if (!stored) return "system";
    return stored as "light" | "dark";
  })();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to load profile");
        const player: PlayerData = await res.json();
        setDisplayName(player.display_name);
        setSkillLevel(player.skill_level);
        setSports(player.sports || []);
        setHomeClubId(player.home_club_id ?? null);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  function toggleSport(sport: Sport) {
    setSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

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
          sports,
          home_club_id: homeClubId,
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
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            Settings saved
          </div>
        )}

        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Appearance
            </label>
            <div className="flex gap-2">
              {([
                { value: "light" as const, label: "Light", Icon: Sun },
                { value: "dark" as const, label: "Dark", Icon: Moon },
                { value: "system" as const, label: "System", Icon: Monitor },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setThemeMode(opt.value)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                    currentMode === opt.value
                      ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10"
                  }`}
                >
                  <opt.Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-white/10" />

          {/* Display Name */}
          <div>
            <label
              htmlFor="display-name"
              className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 min-h-[44px]"
              placeholder="Your display name"
            />
          </div>

          {/* Skill Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Skill Level
            </label>
            <div className="flex gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSkillLevel(level.value)}
                  className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                    skillLevel === level.value
                      ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                      : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sports Preferences */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Sports Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => {
                const active = sports.includes(sport.value);
                return (
                  <button
                    key={sport.value}
                    onClick={() => toggleSport(sport.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                      active
                        ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                        : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/10"
                    }`}
                  >
                    {sport.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Home Club */}
          <HomeClubSelector
            currentClubId={homeClubId}
            onSelect={setHomeClubId}
          />

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
          <div className="border-t border-zinc-200 dark:border-white/10" />

          {/* Contact Preferences */}
          <ContactPreferencesEditor />

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-white/10" />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-800 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 min-h-[44px] transition-colors"
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
