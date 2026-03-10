"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { NotificationPreferences } from "@/lib/types";
import {
  usePushSubscription,
  type PushPermission,
} from "@/lib/hooks/usePushSubscription";

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
        checked ? "bg-emerald-500" : "bg-zinc-300",
        disabled && "opacity-50 cursor-not-allowed"
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

function PushStatusBanner({ permission }: { permission: PushPermission }) {
  if (permission === "denied") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        Push notifications are blocked by your browser. To enable them, update
        notification permissions in your browser settings for this site.
      </div>
    );
  }
  if (permission === "unsupported") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
        Push notifications are not supported in this browser.
      </div>
    );
  }
  return null;
}

export function NotificationSettings({
  preferences,
}: NotificationSettingsProps) {
  const [prefs, setPrefs] = useState(preferences);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const {
    permission,
    isSubscribed,
    loading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  const pushDisabled =
    permission === "denied" || permission === "unsupported";

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

  async function handlePushToggle(
    key: keyof NotificationPreferences,
    value: boolean
  ) {
    if (value && !isSubscribed) {
      // Subscribing: request permission and create push subscription first
      const ok = await subscribe();
      if (!ok) return; // permission denied or error
    }

    // Save the preference
    update(key, value);

    // If all push prefs are being turned off, unsubscribe from push
    if (!value) {
      const pushKeys = [
        "push_partner_requests",
        "push_match_ready",
        "push_friend_checkin",
        "push_scheduled_reminder",
      ] as const;
      const allOff = pushKeys.every((k) =>
        k === key ? !value : !prefs[k]
      );
      if (allOff) {
        await unsubscribe();
      }
    }
  }

  const pushItems = [
    { key: "push_partner_requests" as const, label: "Partner requests" },
    { key: "push_match_ready" as const, label: "Match ready" },
    { key: "push_friend_checkin" as const, label: "Friend check-ins" },
    { key: "push_scheduled_reminder" as const, label: "Game reminders" },
  ];

  const emailItems = [
    { key: "email_weekly_summary" as const, label: "Weekly summary" },
    { key: "email_upcoming_games" as const, label: "Upcoming games" },
  ];

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Push Notifications
        </h3>
        <PushStatusBanner permission={permission} />
        <div className="space-y-1">
          {pushItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl glass px-4 py-3"
            >
              <span className="text-sm text-zinc-700">{item.label}</span>
              <Toggle
                checked={prefs[item.key] as boolean}
                onChange={(v) => handlePushToggle(item.key, v)}
                disabled={isPending || pushLoading || pushDisabled}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Email Notifications */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Email Notifications
        </h3>
        <div className="space-y-1">
          {emailItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-xl glass px-4 py-3"
            >
              <span className="text-sm text-zinc-700">{item.label}</span>
              <Toggle
                checked={prefs[item.key] as boolean}
                onChange={(v) => update(item.key, v)}
                disabled={isPending}
              />
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <p className="text-xs text-emerald-400 text-center">Settings saved</p>
      )}
    </div>
  );
}
