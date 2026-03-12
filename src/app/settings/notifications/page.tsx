"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Bell, Calendar, Trophy, MessageCircle, Megaphone, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePushSubscription } from "@/lib/hooks/usePushSubscription";
import type { NotificationPreferences } from "@/lib/types";

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

/** Senior-friendly toggle with min 48px touch target */
function Toggle({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative flex-shrink-0 h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/40 focus:ring-offset-2",
        "min-h-[48px] min-w-[56px]",
        checked ? "bg-[#1B5E20]" : "bg-[#0A2E12]/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform",
          checked && "translate-x-6"
        )}
      />
    </button>
  );
}

interface NotificationOption {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: typeof Bell;
  paidOnly?: boolean;
}

const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: "event_reminders",
    label: "Event Reminders",
    description: "Get notified 24 hours and 1 hour before events you've RSVP'd to",
    icon: Calendar,
  },
  {
    key: "new_events",
    label: "New Events",
    description: "Know when a new event is posted at your club",
    icon: PartyPopper,
  },
  {
    key: "tournament_results",
    label: "Tournament Results",
    description: "Find out when scores are finalised for your tournaments",
    icon: Trophy,
  },
  {
    key: "chat_messages",
    label: "Chat Messages",
    description: "Get notified when someone sends you a message (Premium members only)",
    icon: MessageCircle,
    paidOnly: true,
  },
  {
    key: "club_announcements",
    label: "Club Announcements",
    description: "Stay informed when your club admin posts to the noticeboard",
    icon: Megaphone,
  },
];

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const { permission, isSubscribed, subscribe, unsubscribe } = usePushSubscription();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings/notifications");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPrefs(data);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

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
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#FEFCF9" }}>
        <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-28" style={{ backgroundColor: "#FEFCF9" }}>
      <div className="mx-auto max-w-lg">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#3D5A3E] hover:text-[#1B5E20] min-h-[48px] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Settings
        </button>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight text-[#0A2E12]"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            Notification Preferences
          </h1>
          <p className="mt-2 text-base text-[#3D5A3E]">
            Choose which notifications you receive. You can change these anytime.
          </p>
        </div>

        {/* Push notifications master toggle */}
        {permission !== "unsupported" && (
          <div className="mb-8 rounded-2xl border border-[#0A2E12]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E20]/10">
                  <Bell className="h-5 w-5 text-[#1B5E20]" />
                </div>
                <div>
                  <p className="text-base font-semibold text-[#0A2E12]">Push Notifications</p>
                  <p className="text-sm text-[#3D5A3E]">
                    {permission === "denied"
                      ? "Blocked in your browser settings"
                      : isSubscribed
                        ? "Enabled on this device"
                        : "Enable to receive alerts on this device"}
                  </p>
                </div>
              </div>
              <Toggle
                checked={isSubscribed}
                onChange={handlePushToggle}
                disabled={permission === "denied"}
                id="push-master-toggle"
              />
            </div>
          </div>
        )}

        {/* Notification type toggles */}
        <div className="space-y-3">
          <h2
            className="text-xl font-semibold text-[#0A2E12] mb-4"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
          >
            What to notify you about
          </h2>

          {NOTIFICATION_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#0A2E12]/10 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 mt-0.5">
                    <Icon className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div className="min-w-0">
                    <label
                      htmlFor={`toggle-${option.key}`}
                      className="text-base font-semibold text-[#0A2E12] cursor-pointer"
                    >
                      {option.label}
                    </label>
                    <p className="mt-0.5 text-sm text-[#3D5A3E] leading-relaxed">
                      {option.description}
                    </p>
                    {option.paidOnly && (
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <Toggle
                  id={`toggle-${option.key}`}
                  checked={prefs[option.key] as boolean}
                  onChange={(v) => update(option.key, v)}
                  disabled={isPending}
                />
              </div>
            );
          })}
        </div>

        {/* Saved indicator */}
        {saved && (
          <div className="mt-4 rounded-xl bg-[#1B5E20]/10 px-4 py-3 text-center text-sm font-medium text-[#1B5E20]">
            Preferences saved
          </div>
        )}

        {/* Reassuring message */}
        <p className="mt-8 text-center text-sm text-[#3D5A3E]/70">
          You can change these preferences anytime from your settings.
        </p>
      </div>
    </div>
  );
}
