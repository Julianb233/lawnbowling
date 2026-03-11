"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Users, ChevronRight, Globe, Leaf, Filter } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import {
  CLUBS,
  REGION_LABELS,
  US_STATES,
  SURFACE_LABELS,
  getClubStats,
  getStatesWithClubs,
  searchClubs,
  type USRegion,
  type ClubData,
} from "@/lib/clubs-data";

const REGION_ORDER: USRegion[] = ["west", "south", "east", "midwest"];

export default function ClubDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<USRegion | "all">("all");
  const [activeActivity, setActiveActivity] = useState<string | "all">("all");
  const stats = getClubStats();

  const filteredClubs = useMemo(() => {
    let clubs = query.length > 1 ? searchClubs(query) : [...CLUBS];

    if (activeRegion !== "all") {
      clubs = clubs.filter((c) => c.region === activeRegion);
    }

    if (activeActivity !== "all") {
      clubs = clubs.filter((c) => c.activities.includes(activeActivity));
    }

    return clubs;
  }, [query, activeRegion, activeActivity]);

  // Group by state
  const clubsByState = useMemo(() => {
    const grouped: Record<string, ClubData[]> = {};
    for (const club of filteredClubs) {
      if (!grouped[club.stateCode]) grouped[club.stateCode] = [];
      grouped[club.stateCode].push(club);
    }
    // Sort states alphabetically
    return Object.entries(grouped).sort(([a], [b]) => {
      const stateA = US_STATES[a]?.name ?? a;
      const stateB = US_STATES[b]?.name ?? b;
      return stateA.localeCompare(stateB);
    });
  }, [filteredClubs]);

  const activities = useMemo(() => {
    const set = new Set<string>();
    CLUBS.forEach((c) => c.activities.forEach((a) => set.add(a)));
    return [...set].sort();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Club Directory
              </h1>
              <p className="text-sm text-zinc-500">
                {stats.totalClubs} clubs across {stats.totalStates} states
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/clubs/manage"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 min-h-[44px] touch-manipulation hidden sm:block"
              >
                Manage Club
              </Link>
              <Link
                href="/clubs/claim"
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 min-h-[44px] touch-manipulation hidden sm:block"
              >
                + Add Your Club
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <StatCard value={stats.totalClubs} label="Clubs Listed" icon="🎳" />
          <StatCard value={stats.totalStates} label="States" icon="🗺️" />
          <StatCard value={stats.totalMembers.toLocaleString()} label="Total Members" icon="👥" />
          <StatCard value={stats.activeClubs} label="Year-Round" icon="✅" />
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search clubs by name, city, or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-12 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Region Filters */}
        <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterPill
            active={activeRegion === "all"}
            onClick={() => setActiveRegion("all")}
            label="All Regions"
          />
          {REGION_ORDER.map((r) => (
            <FilterPill
              key={r}
              active={activeRegion === r}
              onClick={() => setActiveRegion(r)}
              label={`${REGION_LABELS[r].emoji} ${REGION_LABELS[r].label}`}
            />
          ))}
        </div>

        {/* Activity Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterPill
            active={activeActivity === "all"}
            onClick={() => setActiveActivity("all")}
            label="All Activities"
            small
          />
          {activities.map((a) => (
            <FilterPill
              key={a}
              active={activeActivity === a}
              onClick={() => setActiveActivity(a)}
              label={a}
              small
            />
          ))}
        </div>

        {/* Results */}
        {clubsByState.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <MapPin className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No clubs found</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {clubsByState.map(([stateCode, clubs]) => (
              <StateSection key={stateCode} stateCode={stateCode} clubs={clubs} />
            ))}
          </div>
        )}

        {/* CTA: Add Club */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center"
        >
          <h3 className="text-lg font-bold text-zinc-900">
            Don&apos;t see your club?
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Help us build the most complete lawn bowling directory in the USA
          </p>
          <Link
            href="/clubs/claim"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Add Your Club
          </Link>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-2xl font-black text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  small,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 font-medium transition-colors touch-manipulation ${
        small ? "py-1.5 text-xs" : "py-2 text-sm"
      } ${
        active
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}

function StateSection({ stateCode, clubs }: { stateCode: string; clubs: ClubData[] }) {
  const state = US_STATES[stateCode];
  const stateName = state?.name ?? stateCode;
  const region = state?.region;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-zinc-900">{stateName}</h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-500 tabular-nums">
            {clubs.length}
          </span>
          {region && (
            <span className="text-xs text-zinc-400">
              {REGION_LABELS[region].emoji} {REGION_LABELS[region].label}
            </span>
          )}
        </div>
        <Link
          href={`/clubs/${stateCode.toLowerCase()}`}
          className="text-sm font-medium text-blue-500 hover:text-blue-600"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {clubs.map((club, i) => (
          <ClubCard key={club.id} club={club} index={i} />
        ))}
      </div>
    </section>
  );
}

function ClubCard({ club, index }: { club: ClubData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/clubs/${club.stateCode.toLowerCase()}/${club.id}`}>
        <div className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {/* Club name & city */}
              <h3 className="text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                {club.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{club.city}, {club.stateCode}</span>
                {club.founded && (
                  <span className="text-zinc-300">·</span>
                )}
                {club.founded && (
                  <span>Est. {club.founded}</span>
                )}
              </div>

              {/* Description */}
              {club.description && (
                <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                  {club.description}
                </p>
              )}

              {/* Tags row */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {/* Members */}
                {club.memberCount && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <Users className="h-3 w-3" />
                    {club.memberCount} members
                  </span>
                )}
                {/* Greens */}
                {club.greens && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Leaf className="h-3 w-3" />
                    {club.greens} {club.greens === 1 ? "green" : "greens"}
                    {club.rinks && ` · ${club.rinks} rinks`}
                  </span>
                )}
                {/* Surface */}
                {club.surfaceType !== "unknown" && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {SURFACE_LABELS[club.surfaceType]}
                  </span>
                )}
                {/* Status */}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    club.status === "claimed"
                      ? "bg-blue-50 text-blue-700"
                      : club.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : club.status === "seasonal"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {club.status === "claimed" ? "Verified" : club.status === "active" ? "Year-Round" : club.status === "seasonal" ? "Seasonal" : club.status}
                </span>
                {/* Website */}
                {club.website && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    <Globe className="h-3 w-3" />
                    Website
                  </span>
                )}
              </div>

              {/* Activities */}
              <div className="mt-2 flex flex-wrap gap-1">
                {club.activities.slice(0, 4).map((a) => (
                  <span key={a} className="rounded-full border border-zinc-100 px-2 py-0.5 text-[11px] text-zinc-400">
                    {a}
                  </span>
                ))}
                {club.activities.length > 4 && (
                  <span className="rounded-full px-2 py-0.5 text-[11px] text-zinc-400">
                    +{club.activities.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
