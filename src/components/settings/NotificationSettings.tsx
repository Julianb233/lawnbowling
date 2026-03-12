"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { usePushSubscription } from "@/lib/hooks/usePushSubscription";
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
        checked ? "bg-emerald-500" : "bg-[#0A2E12]/10"
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
  const { permission, isSubscribed, subscribe, unsubscribe } = usePushSubscription();

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

  async function handlePushToggle(enabled: boolean) {
    if (enabled) { await subscribe(); } else { await unsubscribe(); }
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
      title: "Events & Tournaments",
      items: [
        { key: "event_reminders" as const, label: "Event reminders" },
        { key: "new_events" as const, label: "New events at your club" },
        { key: "tournament_results" as const, label: "Tournament results" },
      ],
    },
    {
      title: "Chat & Announcements",
      items: [
        { key: "chat_messages" as const, label: "Chat messages (Premium)" },
        { key: "club_announcements" as const, label: "Club announcements" },
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
      {permission !== "unsupported" && (
        <div>
          <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-3">Browser Push</h3>
          <div className="flex items-center justify-between rounded-xl glass px-4 py-3">
            <div>
              <span className="text-sm text-[#2D4A30]">Enable push notifications</span>
              {permission === "denied" && <p className="text-xs text-red-400 mt-0.5">Blocked in browser settings</p>}
            </div>
            <Toggle checked={isSubscribed} onChange={handlePushToggle} disabled={permission === "denied"} />
          </div>
        </div>
      )}
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl glass px-4 py-3"
              >
                <span className="text-sm text-[#2D4A30]">{item.label}</span>
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
