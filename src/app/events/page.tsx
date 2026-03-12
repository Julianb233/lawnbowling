"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Home,
  Filter,
  Trophy,
  Sun,
  Star,
  CalendarDays,
  List,
  Check,
} from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";

type EventCategory = "tournament" | "social" | "open-day" | "league" | "coaching";

interface ClubEvent {
  id: string;
  title: string;
  club: string;
  clubId: string;
  state: string;
  date: string;
  time: string;
  endTime?: string;
  category: EventCategory;
  description: string;
  image: string;
  spotsTotal: number;
  spotsTaken: number;
  price?: string;
  featured?: boolean;
}

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  tournament: { label: "Tournament", color: "text-amber-700", bg: "bg-amber-50", icon: <Trophy className="h-3.5 w-3.5" /> },
  social: { label: "Social Roll-Up", color: "text-[#2E7D32]", bg: "bg-[#1B5E20]/5", icon: <Sun className="h-3.5 w-3.5" /> },
  "open-day": { label: "Open Day", color: "text-blue-700", bg: "bg-blue-50", icon: <Star className="h-3.5 w-3.5" /> },
  league: { label: "League Match", color: "text-purple-700", bg: "bg-purple-50", icon: <Users className="h-3.5 w-3.5" /> },
  coaching: { label: "Coaching Clinic", color: "text-rose-700", bg: "bg-rose-50", icon: <Calendar className="h-3.5 w-3.5" /> },
};

const SAMPLE_EVENTS: ClubEvent[] = [
  {
    id: "1",
    title: "Spring Pairs Championship",
    club: "Sun City Lawn Bowls Club",
    clubId: "sun-city-lbc",
    state: "AZ",
    date: "2026-04-12",
    time: "9:00 AM",
    endTime: "4:00 PM",
    category: "tournament",
    description: "Annual pairs championship open to all USLBA-affiliated bowlers. Three 14-end games guaranteed. Prizes for top 3 pairs.",
    image: "/images/heritage-scoreboard.jpg",
    spotsTotal: 32,
    spotsTaken: 24,
    price: "$40/pair",
    featured: true,
  },
  {
    id: "2",
    title: "Saturday Social Roll-Up",
    club: "Laguna Beach Lawn Bowling Club",
    clubId: "laguna-beach-lbc",
    state: "CA",
    date: "2026-03-15",
    time: "10:00 AM",
    endTime: "12:30 PM",
    category: "social",
    description: "Casual weekend roll-up for all skill levels. Equipment provided. Come meet your neighbors on the green!",
    image: "/images/scenery-golden-hour-green.jpg",
    spotsTotal: 24,
    spotsTaken: 12,
  },
  {
    id: "3",
    title: "Newcomers Open Day",
    club: "Central Park LBC",
    clubId: "central-park-lbc",
    state: "NY",
    date: "2026-04-05",
    time: "11:00 AM",
    endTime: "2:00 PM",
    category: "open-day",
    description: "Free introduction to lawn bowling! All equipment and instruction provided. Refreshments included. No experience needed.",
    image: "/images/heritage-clubhouse-tea.jpg",
    spotsTotal: 40,
    spotsTaken: 18,
    featured: true,
  },
  {
    id: "4",
    title: "Twilight League — Week 6",
    club: "Palo Alto Lawn Bowls Club",
    clubId: "palo-alto-lbc",
    state: "CA",
    date: "2026-03-19",
    time: "5:30 PM",
    endTime: "7:30 PM",
    category: "league",
    description: "Weekly twilight league match. Teams of triples compete under the lights. Season runs 10 weeks.",
    image: "/images/scenery-clubhouse-dusk.jpg",
    spotsTotal: 18,
    spotsTaken: 18,
  },
  {
    id: "5",
    title: "Beginner Coaching Clinic",
    club: "Lakeside Lawn Bowling Club",
    clubId: "lakeside-lbc",
    state: "IL",
    date: "2026-04-08",
    time: "9:30 AM",
    endTime: "11:30 AM",
    category: "coaching",
    description: "Two-hour clinic covering delivery technique, draw shots, and basic strategy. Limited to 12 participants for personal attention.",
    image: "/images/heritage-wooden-bench-green.jpg",
    spotsTotal: 12,
    spotsTaken: 7,
    price: "$15",
  },
  {
    id: "6",
    title: "Memorial Day Mixed Triples",
    club: "Clearwater Lawn Bowls",
    clubId: "clearwater-lbc",
    state: "FL",
    date: "2026-05-25",
    time: "8:30 AM",
    endTime: "3:00 PM",
    category: "tournament",
    description: "Memorial Day special event. Mixed triples format with BBQ lunch included. Prizes and trophies for winners.",
    image: "/images/scenery-morning-dew-green.jpg",
    spotsTotal: 36,
    spotsTaken: 20,
    price: "$30/player",
  },
  {
    id: "7",
    title: "Friday Afternoon Social",
    club: "Santa Monica Lawn Bowling Club",
    clubId: "santa-monica-lbc",
    state: "CA",
    date: "2026-03-14",
    time: "1:00 PM",
    endTime: "3:30 PM",
    category: "social",
    description: "Weekly Friday social games. All welcome — flat shoes required. Followed by refreshments at the clubhouse.",
    image: "/images/scenery-overhead-bowls-jack.jpg",
    spotsTotal: 20,
    spotsTaken: 14,
  },
  {
    id: "8",
    title: "Junior Development Day",
    club: "Williamsburg LBC",
    clubId: "williamsburg-lbc",
    state: "VA",
    date: "2026-04-19",
    time: "10:00 AM",
    endTime: "1:00 PM",
    category: "coaching",
    description: "Youth coaching day for ages 10-18. Introduction to the sport with fun games and mini-competitions. All equipment provided.",
    image: "/images/heritage-weathered-bowls-patina.jpg",
    spotsTotal: 20,
    spotsTaken: 5,
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const event = new Date(dateStr + "T00:00:00");
  return Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const [rsvpSet, setRsvpSet] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    let events = [...SAMPLE_EVENTS].sort((a, b) => a.date.localeCompare(b.date));
    if (activeCategory !== "all") {
      events = events.filter((e) => e.category === activeCategory);
    }
    return events;
  }, [activeCategory]);

  const featuredEvents = useMemo(() => SAMPLE_EVENTS.filter((e) => e.featured), []);

  const calendarWeeks = useMemo(() => {
    const events = filteredEvents;
    const grouped: Record<string, ClubEvent[]> = {};
    for (const event of events) {
      const weekStart = new Date(event.date + "T00:00:00");
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
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

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
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} coming up
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
        {/* Featured Events */}
        {activeCategory === "all" && viewMode === "list" && featuredEvents.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-lg font-bold text-[#0A2E12] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Featured Events
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredEvents.map((event) => (
                <FeaturedEventCard key={event.id} event={event} rsvpd={rsvpSet.has(event.id)} onRsvp={handleRsvp} />
              ))}
            </div>
          </motion.div>
        )}

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
          {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => {
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

        {/* Events list or calendar */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {filteredEvents.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} rsvpd={rsvpSet.has(event.id)} onRsvp={handleRsvp} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {calendarWeeks.map(([weekStart, events]) => {
              const start = new Date(weekStart + "T00:00:00");
              const end = new Date(start);
              end.setDate(end.getDate() + 6);
              const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
              return (
                <section key={weekStart}>
                  <h3 className="text-sm font-bold text-[#3D5A3E] uppercase tracking-wider mb-3">{label}</h3>
                  <div className="space-y-3">
                    {events.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} rsvpd={rsvpSet.has(event.id)} onRsvp={handleRsvp} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]/5">
              <Calendar className="h-8 w-8 text-[#3D5A3E]" />
            </div>
            <h3 className="text-lg font-bold text-[#0A2E12]">No events found</h3>
            <p className="mt-1 text-sm text-[#3D5A3E]">Try selecting a different category</p>
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
          <Link
            href="/clubs/claim"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#2E7D32] transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Claim Your Club
          </Link>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

function FeaturedEventCard({
  event,
  rsvpd,
  onRsvp,
}: {
  event: ClubEvent;
  rsvpd: boolean;
  onRsvp: (id: string) => void;
}) {
  const cfg = CATEGORY_CONFIG[event.category];
  const spotsLeft = event.spotsTotal - event.spotsTaken;
  const daysUntil = getDaysUntil(event.date);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group">
      <div className="rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative h-40">
          <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/80 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className={`inline-flex items-center gap-1 rounded-full ${cfg.bg} ${cfg.color} px-2.5 py-1 text-xs font-medium`}>
              {cfg.icon}{cfg.label}
            </span>
            <h3 className="mt-1.5 text-lg font-bold text-white leading-tight">{event.title}</h3>
          </div>
          {daysUntil >= 0 && daysUntil <= 7 && (
            <div className="absolute top-3 right-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-[#0A2E12]">
              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 text-sm text-[#3D5A3E]">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.time}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.club}, {event.state}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {event.price && (
                <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-medium text-[#0A2E12]">{event.price}</span>
              )}
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${spotsLeft === 0 ? "bg-red-50 text-red-700" : spotsLeft <= 5 ? "bg-amber-50 text-amber-700" : "bg-[#1B5E20]/5 text-[#2E7D32]"}`}>
                {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
              </span>
            </div>
            <button
              onClick={() => onRsvp(event.id)}
              disabled={spotsLeft === 0 && !rsvpd}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[36px] touch-manipulation ${
                rsvpd
                  ? "bg-[#1B5E20] text-white"
                  : spotsLeft === 0
                  ? "bg-[#0A2E12]/5 text-[#3D5A3E] cursor-not-allowed"
                  : "border border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
              }`}
            >
              {rsvpd ? <><Check className="h-3.5 w-3.5 inline mr-1" />RSVP&apos;d</> : "RSVP"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EventCard({
  event,
  index,
  rsvpd,
  onRsvp,
}: {
  event: ClubEvent;
  index: number;
  rsvpd: boolean;
  onRsvp: (id: string) => void;
}) {
  const cfg = CATEGORY_CONFIG[event.category];
  const spotsLeft = event.spotsTotal - event.spotsTaken;
  const daysUntil = getDaysUntil(event.date);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden transition-all hover:border-[#0A2E12]/20 hover:shadow-sm">
        <div className="flex">
          <div className="relative w-28 sm:w-36 shrink-0">
            <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(max-width: 640px) 112px, 144px" />
            {daysUntil >= 0 && daysUntil <= 3 && (
              <div className="absolute top-2 left-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-[#0A2E12]">
                {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d`}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 rounded-full ${cfg.bg} ${cfg.color} px-2 py-0.5 text-xs font-medium`}>
                    {cfg.icon}{cfg.label}
                  </span>
                  {event.featured && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Featured</span>
                  )}
                </div>
                <h3 className="mt-1.5 text-base font-bold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors">
                  {event.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#3D5A3E]">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{event.time}{event.endTime && ` – ${event.endTime}`}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.club}, {event.state}</span>
                </div>
                <p className="mt-2 text-sm text-[#3D5A3E] line-clamp-2">{event.description}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {event.price && (
                    <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-medium text-[#0A2E12]">{event.price}</span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${spotsLeft === 0 ? "bg-red-50 text-red-700" : spotsLeft <= 5 ? "bg-amber-50 text-amber-700" : "bg-[#1B5E20]/5 text-[#2E7D32]"}`}>
                    <Users className="h-3 w-3 inline mr-1" />
                    {spotsLeft === 0 ? "Full" : `${spotsLeft} of ${event.spotsTotal} spots left`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRsvp(event.id)}
                disabled={spotsLeft === 0 && !rsvpd}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[36px] touch-manipulation ${
                  rsvpd
                    ? "bg-[#1B5E20] text-white"
                    : spotsLeft === 0
                    ? "bg-[#0A2E12]/5 text-[#3D5A3E] cursor-not-allowed"
                    : "border border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
                }`}
              >
                {rsvpd ? <><Check className="h-3.5 w-3.5 inline mr-1" />Going</> : "RSVP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
