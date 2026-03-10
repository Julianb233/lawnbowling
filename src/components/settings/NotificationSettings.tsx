"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { NotificationPreferences } from "@/lib/types";

interface NotificationSettingsProps {
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
        checked ? "bg-emerald-500" : "bg-zinc-700"
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

export function NotificationSettings({ preferences }: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState(preferences);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(key: keyof NotificationPreferences, value: boolean) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    startTransition(async () => {
      await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const sections = [
    {
      title: "Push Notifications",
      items: [
        { key: "push_partner_requests" as const, label: "Partner requests" },
        { key: "push_match_ready" as const, label: "Match ready" },
        { key: "push_friend_checkin" as const, label: "Friend check-ins" },
        { key: "push_scheduled_reminder" as const, label: "Game reminders" },
      ],
    },
    {
      title: "Email Notifications",
      items: [
        { key: "email_weekly_summary" as const, label: "Weekly summary" },
        { key: "email_upcoming_games" as const, label: "Upcoming games" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl glass px-4 py-3"
              >
                <span className="text-sm text-zinc-200">{item.label}</span>
                <Toggle
                  checked={prefs[item.key] as boolean}
                  onChange={(v) => update(item.key, v)}
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {saved && (
        <p className="text-xs text-emerald-400 text-center">Settings saved</p>
      )}
    </div>
  );
}
