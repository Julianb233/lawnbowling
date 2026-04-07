"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Home,
  Filter,
  Trophy,
  Sun,
  Star,
  CalendarDays,
  List,
  Check,
  Lock,
  Crown,
  Loader2,
  Plus,
} from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { getClubById } from "@/lib/clubs-data";
import type { ClubEvent, ClubEventType } from "@/lib/types";

type EventCategory = ClubEventType | "all";

const CATEGORY_CONFIG: Record<ClubEventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  tournament: { label: "Tournament", color: "text-amber-700", bg: "bg-amber-50", icon: <Trophy className="h-3.5 w-3.5" /> },
  social: { label: "Social", color: "text-[#2E7D32]", bg: "bg-[#1B5E20]/5", icon: <Sun className="h-3.5 w-3.5" /> },
  meeting: { label: "Meeting", color: "text-blue-700", bg: "bg-blue-50", icon: <Star className="h-3.5 w-3.5" /> },
  practice: { label: "Practice", color: "text-purple-700", bg: "bg-purple-50", icon: <Users className="h-3.5 w-3.5" /> },
  other: { label: "Other", color: "text-rose-700", bg: "bg-rose-50", icon: <Calendar className="h-3.5 w-3.5" /> },
};

// Enriched event with club info from static data
interface EnrichedEvent extends ClubEvent {
  club_name: string;
  club_state: string;
  club_city: string;
}

function enrichEvent(event: ClubEvent): EnrichedEvent {
  const club = getClubById(event.club_id);
  return {
    ...event,
    club_name: club?.name ?? event.club_id,
    club_state: club?.stateCode ?? "",
    club_city: club?.city ?? "",
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${ampm}`;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + "T00:00:00");
  return Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function isCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeCategory, setActiveCategory] = useState<EventCategory>("all");
  const [rsvpSet, setRsvpSet] = useState<Set<string>>(new Set());
  const [isMember, setIsMember] = useState(false);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Fetch membership status
  useEffect(() => {
    async function checkMembership() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const tier = data.membership_tier;
          const expiresAt = data.membership_expires_at;
          if ((tier === "monthly" || tier === "annual") && expiresAt && new Date(expiresAt) > new Date()) {
            setIsMember(true);
          }
        }
      } catch {
        // Not logged in
      }
    }
    checkMembership();
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (viewMode === "calendar") {
        const monthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}`;
        params.set("month", monthStr);
      }
      params.set("limit", "100");

      const res = await fetch(`/api/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        const enriched = (data.events as ClubEvent[]).map(enrichEvent);
        setEvents(enriched);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, viewMode, currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    return [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));
  }, [events]);

  const calendarWeeks = useMemo(() => {
    const grouped: Record<string, EnrichedEvent[]> = {};
    for (const event of filteredEvents) {
      const weekStart = new Date(event.event_date + "T00:00:00");
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - day);
      const key = weekStart.toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(event);
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredEvents]);

  const handleRsvp = (eventId: string) => {
    setRsvpSet((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: m };
    });
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: m };
    });
  };

  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      {/* Header */}
      <header className="border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <nav className="mb-2 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
            <Link href="/" className="hover:text-[#0A2E12] transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#0A2E12]">Events</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
                Upcoming Events
              </h1>
              <p className="text-sm text-[#3D5A3E]">
                {loading ? "Loading events..." : `${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""} coming up`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === "list" ? "bg-white text-[#0A2E12] shadow-sm" : "text-[#3D5A3E]"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />List
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === "calendar" ? "bg-white text-[#0A2E12] shadow-sm" : "text-[#3D5A3E]"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Category filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
              activeCategory === "all"
                ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/20"
            }`}
          >
            <Filter className="h-3.5 w-3.5 inline mr-1.5" />All Events
          </button>
          {(Object.keys(CATEGORY_CONFIG) as ClubEventType[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                  activeCategory === cat
                    ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                    : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/20"
                }`}
              >
                <span className="inline mr-1.5">{cfg.icon}</span>{cfg.label}
              </button>
            );
          })}
        </div>

        {/* Calendar month nav */}
        {viewMode === "calendar" && (
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prevMonth} className="p-2 rounded-lg text-[#3D5A3E] hover:bg-[#0A2E12]/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-[#0A2E12]">{monthName}</span>
            <button onClick={nextMonth} className="p-2 rounded-lg text-[#3D5A3E] hover:bg-[#0A2E12]/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          </div>
        )}

        {/* Events list or calendar */}
        {!loading && viewMode === "list" && (
          <div className="space-y-3">
            {filteredEvents.filter((e) => isMember || isCurrentMonth(e.event_date)).map((event, i) => (
              <EventCard key={event.id} event={event} index={i} rsvpd={rsvpSet.has(event.id)} onRsvp={handleRsvp} />
            ))}

            {/* Soft paywall for future months (free users only) */}
            {!isMember && filteredEvents.some((e) => !isCurrentMonth(e.event_date)) && (
              <MembershipPaywall
                count={filteredEvents.filter((e) => !isCurrentMonth(e.event_date)).length}
                events={filteredEvents.filter((e) => !isCurrentMonth(e.event_date))}
              />
            )}
          </div>
        )}

        {!loading && viewMode === "calendar" && (
          <div className="space-y-8">
            {calendarWeeks.length > 0 ? calendarWeeks.map(([weekStart, weekEvents]) => {
              const start = new Date(weekStart + "T00:00:00");
              const end = new Date(start);
              end.setDate(end.getDate() + 6);
              const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

              return (
                <section key={weekStart}>
                  <h3 className="text-sm font-bold text-[#3D5A3E] uppercase tracking-wider mb-3">{label}</h3>
                  <div className="space-y-3">
                    {weekEvents.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} rsvpd={rsvpSet.has(event.id)} onRsvp={handleRsvp} />
                    ))}
                  </div>
                </section>
              );
            }) : (
              <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-[#3D5A3E] mb-3" />
                <h3 className="text-lg font-bold text-[#0A2E12]">No events this month</h3>
                <p className="mt-1 text-sm text-[#3D5A3E]">Try browsing a different month or category</p>
              </div>
            )}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && viewMode === "list" && (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/5">
              <Calendar className="h-8 w-8 text-[#3D5A3E]" />
            </div>
            <h3 className="text-lg font-bold text-[#0A2E12]">No upcoming events</h3>
            <p className="mt-1 text-sm text-[#3D5A3E]">
              Events will appear here as clubs add them to their calendars
            </p>
            <Link
              href="/clubs"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#1B5E20] px-6 py-3 text-sm font-bold text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white transition-colors"
            >
              Browse Clubs
            </Link>
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 rounded-2xl border border-dashed border-[#0A2E12]/20 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
            Want to list your club&apos;s events?
          </h3>
          <p className="mt-1 text-sm text-[#3D5A3E]">
            Claim your club to start posting tournaments, socials, and open days
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/clubs/claim"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
            >
              <Plus className="h-4 w-4" />
              Claim Your Club
            </Link>
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 px-6 py-3 text-sm font-medium text-[#3D5A3E] hover:bg-[#0A2E12]/5 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Find a Club
            </Link>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

function MembershipPaywall({ count, events }: { count: number; events: EnrichedEvent[] }) {
  return (
    <div className="relative">
      <div className="space-y-3 select-none pointer-events-none" aria-hidden="true">
        {events.slice(0, 3).map((event) => {
          const cfg = CATEGORY_CONFIG[event.event_type];
          return (
            <div
              key={event.id}
              className="rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden blur-[6px] opacity-60"
            >
              <div className="flex">
                <div className="relative w-28 sm:w-36 shrink-0 bg-[#0A2E12]/5 h-28" />
                <div className="flex-1 min-w-0 p-4">
                  <span className={`inline-flex items-center gap-1 rounded-full ${cfg.bg} ${cfg.color} px-2 py-0.5 text-xs font-medium`}>
                    {cfg.icon}{cfg.label}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-[#0A2E12]">{event.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-[#3D5A3E]">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.event_date)}</span>
                    {event.start_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(event.start_time)}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.club_name}{event.club_state && `, ${event.club_state}`}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-2xl border-2 border-[#1B5E20]/20 bg-white/95 backdrop-blur-sm px-8 py-6 text-center shadow-lg max-w-sm mx-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1B5E20]/10">
            <Lock className="h-6 w-6 text-[#1B5E20]" />
          </div>
          <h3
            className="text-xl font-bold text-[#0A2E12] mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {count} more event{count !== 1 ? "s" : ""} ahead
          </h3>
          <p className="text-base text-[#3D5A3E] mb-4">
            Upgrade to see all upcoming events beyond this month
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-base font-bold text-white hover:bg-[#2E7D32] transition-colors min-h-[48px]"
          >
            <Crown className="h-5 w-5" />
            View Membership Plans
          </Link>
          <p className="mt-2 text-sm text-[#3D5A3E]">Starting at $1.25/month</p>
        </div>
      </div>
    </div>
  );
}

function EventCard({
  event,
  index,
  rsvpd,
  onRsvp,
}: {
  event: EnrichedEvent;
  index: number;
  rsvpd: boolean;
  onRsvp: (id: string) => void;
}) {
  const cfg = CATEGORY_CONFIG[event.event_type];
  const daysUntil = getDaysUntil(event.event_date);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden transition-all hover:border-[#0A2E12]/20 hover:shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-full ${cfg.bg} ${cfg.color} px-2 py-0.5 text-xs font-medium`}>
                  {cfg.icon}{cfg.label}
                </span>
                {daysUntil >= 0 && daysUntil <= 3 && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-[#0A2E12]">
                    {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 text-base font-bold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors">
                {event.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#3D5A3E]">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.event_date)}</span>
                {event.start_time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(event.start_time)}
                    {event.end_time && ` – ${formatTime(event.end_time)}`}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <Link
                  href={`/clubs/${event.club_state?.toLowerCase() ?? ""}/${event.club_id}`}
                  className="truncate hover:text-[#1B5E20] hover:underline transition-colors"
                >
                  {event.club_name}{event.club_state && `, ${event.club_state}`}
                </Link>
              </div>
              {event.location && (
                <div className="mt-0.5 ml-5 text-xs text-[#3D5A3E]">
                  {event.location}
                </div>
              )}
              {event.description && (
                <p className="mt-2 text-sm text-[#3D5A3E] line-clamp-2">{event.description}</p>
              )}
            </div>
            <button
              onClick={() => onRsvp(event.id)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[44px] touch-manipulation ${
                rsvpd
                  ? "bg-[#1B5E20] text-white"
                  : "border border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
              }`}
            >
              {rsvpd ? <><Check className="h-3.5 w-3.5 inline mr-1" />Going</> : "RSVP"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
