"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Users, Trophy, MapPin, Calendar, UserCheck, X } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/lib/types";

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  partner_request_received: Users,
  partner_request_accepted: Check,
  partner_request_declined: X,
  partner_request_expired: X,
  match_assigned: Trophy,
  court_assigned: MapPin,
  friend_checked_in: UserCheck,
  game_reminder: Calendar,
  match_completed: Trophy,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  partner_request_received: "bg-blue-500/20 text-blue-600",
  partner_request_accepted: "bg-emerald-500/20 text-emerald-600",
  partner_request_declined: "bg-zinc-500/20 text-zinc-600",
  partner_request_expired: "bg-amber-500/20 text-amber-600",
  match_assigned: "bg-emerald-500/20 text-emerald-600",
  court_assigned: "bg-violet-500/20 text-violet-600",
  friend_checked_in: "bg-blue-500/20 text-blue-600",
  game_reminder: "bg-amber-500/20 text-amber-600",
  match_completed: "bg-emerald-500/20 text-emerald-600",
};

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateStr).toLocaleDateString();
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
  const colorClass = NOTIFICATION_COLORS[notification.type] || "bg-zinc-500/20 text-zinc-600";

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        notification.is_read
          ? "opacity-60 hover:opacity-80"
          : "hover:bg-zinc-50"
      )}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          colorClass
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", notification.is_read ? "text-zinc-500" : "font-medium text-zinc-900")}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{notification.body}</p>
        <p className="mt-1 text-xs text-zinc-400">{formatTimeAgo(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
      )}
    </motion.button>
  );
}

export function NotificationCenter({ playerId }: { playerId: string | null }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications(playerId);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-zinc-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                  <Bell className="mb-2 h-8 w-8" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50 p-1">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
