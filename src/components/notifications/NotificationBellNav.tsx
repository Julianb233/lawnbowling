"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Compact notification bell for the bottom nav.
 * Polls for unread count on mount and shows a badge.
 */
export function NotificationBellNav({ active }: { active?: boolean }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications?limit=1");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setUnreadCount(data.unreadCount ?? 0);
        }
      } catch {
        // Silently fail -- user may not be logged in
      }
    }

    fetchCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchCount, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Link
      href="/board"
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-[11px] transition-colors min-h-[44px]",
        active
          ? "text-[#1B5E20] dark:text-emerald-400 font-semibold"
          : "text-zinc-500 dark:text-zinc-400"
      )}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <div className="relative">
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1B5E20] px-0.5 text-[9px] font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </div>
      <span>Alerts</span>
    </Link>
  );
}
