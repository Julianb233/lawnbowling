"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { usePushSubscription } from "@/lib/hooks/usePushSubscription";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "push-prompt-dismissed";
const SHOW_DELAY_MS = 5000; // Show 5s after page load

/**
 * Non-intrusive push notification prompt.
 * Shows once after first login, can be dismissed.
 * Won't show if already subscribed or if permission is denied.
 */
export function PushNotificationPrompt() {
  const { permission, isSubscribed, loading, subscribe } = usePushSubscription();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isSubscribed) return;
    if (permission === "denied" || permission === "unsupported") return;

    // Check if user already dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loading, isSubscribed, permission]);

  if (!visible) return null;

  async function handleEnable() {
    setSubscribing(true);
    const success = await subscribe();
    setSubscribing(false);
    if (success) {
      setVisible(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm",
        "rounded-2xl glass border border-white/20 p-4 shadow-xl",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-400"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-[#1B5E20]/10 p-2">
          <Bell className="h-5 w-5 text-[#1B5E20]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Stay in the game
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Get notified when someone wants to partner up or a court opens.
          </p>
          <button
            onClick={handleEnable}
            disabled={subscribing}
            className={cn(
              "mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium text-white",
              "bg-[#1B5E20] hover:bg-[#1B5E20] transition-colors",
              subscribing && "opacity-50 cursor-not-allowed"
            )}
          >
            {subscribing ? "Enabling..." : "Enable notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}
