"use client";

import { usePushSubscription } from "@/lib/hooks/usePushSubscription";
import { cn } from "@/lib/utils";

interface PushNotificationManagerProps {
  className?: string;
}

/**
 * Component for managing push notification subscription.
 * Shows subscribe/unsubscribe toggle with status.
 */
export function PushNotificationManager({
  className,
}: PushNotificationManagerProps) {
  const { permission, isSubscribed, loading, subscribe, unsubscribe } =
    usePushSubscription();

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-zinc-200 bg-white p-5", className)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded skeleton" />
            <div className="h-3 w-48 rounded skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (permission === "unsupported") {
    return (
      <div className={cn("rounded-2xl border border-zinc-200 bg-zinc-50 p-5", className)}>
        <p className="text-sm font-medium text-zinc-500">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className={cn("rounded-2xl border border-red-200 bg-red-50 p-5", className)}>
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500 shrink-0"
          >
            <path d="M18.36 6.64A9 9 0 0 1 20.77 15" />
            <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68" />
            <path d="M12 2v4" />
            <path d="m2 2 20 20" />
            <path d="M12 12v4" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">
              Notifications blocked
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Enable notifications in your browser settings to receive tournament updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white p-5", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isSubscribed ? "bg-[#1B5E20]/10" : "bg-zinc-100"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isSubscribed ? "text-[#1B5E20]" : "text-zinc-400"}
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Tournament Notifications
            </p>
            <p className="text-xs text-zinc-500">
              {isSubscribed
                ? "You will receive draw, score, and start alerts"
                : "Get notified about draws, scores, and tournament events"}
            </p>
          </div>
        </div>

        <button
          onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
            isSubscribed
              ? "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              : "bg-[#1B5E20] text-white hover:bg-[#2E7D32]"
          )}
        >
          {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
