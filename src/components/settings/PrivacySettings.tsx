"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { NotificationPreferences } from "@/lib/types";

interface PrivacySettingsProps {
  preferences: NotificationPreferences;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-[#1B5E20]" : "bg-zinc-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export function PrivacySettings({ preferences }: PrivacySettingsProps) {
  const [prefs, setPrefs] = useState(preferences);
  const [isPending, startTransition] = useTransition();

  function update(key: "profile_public" | "stats_public", value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    startTransition(async () => {
      await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    });
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Privacy
      </h3>
      <div className="space-y-1">
        <div className="flex items-center justify-between rounded-xl glass px-4 py-3">
          <div>
            <p className="text-sm text-zinc-700">Public Profile</p>
            <p className="text-xs text-zinc-500">
              Other players can see your profile
            </p>
          </div>
          <Toggle
            checked={prefs.profile_public}
            onChange={(v) => update("profile_public", v)}
            disabled={isPending}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl glass px-4 py-3">
          <div>
            <p className="text-sm text-zinc-700">Public Stats</p>
            <p className="text-xs text-zinc-500">
              Show your win/loss record to others
            </p>
          </div>
          <Toggle
            checked={prefs.stats_public}
            onChange={(v) => update("stats_public", v)}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
