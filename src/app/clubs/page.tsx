"use client";

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Users, ChevronRight, Globe, Leaf, Map as MapIcon, List, CircleDot, CheckCircle, Navigation } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import {
  getAllClubs,
  COUNTRIES,
  US_STATES,
  REGION_LABELS,
  SURFACE_LABELS,
  getClubStats,
  searchClubs,
  haversineDistance,
  type ClubData,
  type USRegion,
  type CountryCode,
} from "@/lib/clubs-data";

const ClubMapLazy = lazy(() => import("@/components/clubs/ClubMap").then((m) => ({ default: m.ClubMap })));

const STATE_ORDER: string[] = Object.keys(US_STATES);

export default function ClubDirectoryPage() {
  const [query, setQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState<CountryCode | "all">("all");
  const [activeRegion, setActiveRegion] = useState<USRegion | "all">("all");
  const [activeState, setActiveState] = useState<string | "all">("all");
  const [activeActivity, setActiveActivity] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const stats = getClubStats();

  const allClubs = useMemo(() => getAllClubs(), []);

  const handleNearMe = useCallback(() => {
    if (nearMeActive) {
      setNearMeActive(false);
      return;
    }
    if (userLocation) {
      setNearMeActive(true);
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMeActive(true);
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
      }
    );
  }, [nearMeActive, userLocation]);

  const distanceMap = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const club of allClubs) {
      if (club.lat != null && club.lng != null) {
        map.set(club.id, haversineDistance(userLocation.lat, userLocation.lng, club.lat, club.lng));
      }
    }
    return map;
  }, [allClubs, userLocation]);

  const filteredClubs = useMemo(() => {
    let clubs = query.length > 1 ? searchClubs(query) : [...allClubs];
    if (activeCountry !== "all") {
      clubs = clubs.filter((c) => (c.country ?? c.countryCode ?? "US") === activeCountry);
    }
    if (activeRegion !== "all") {
      clubs = clubs.filter((c) => c.region === activeRegion);
    }
    if (activeState !== "all") {
      clubs = clubs.filter((c) => c.stateCode === activeState);
    }
    if (activeActivity !== "all") {
      clubs = clubs.filter((c) => c.activities.includes(activeActivity));
    }
    if (nearMeActive && userLocation) {
      clubs = clubs
        .filter((c) => distanceMap.has(c.id))
        .sort((a, b) => (distanceMap.get(a.id) ?? Infinity) - (distanceMap.get(b.id) ?? Infinity));
    }
    return clubs;
  }, [allClubs, query, activeCountry, activeRegion, activeState, activeActivity, nearMeActive, userLocation, distanceMap]);

  const availableStates = useMemo(() => {
    if (activeRegion === "all") return STATE_ORDER;
    return STATE_ORDER.filter((s) => US_STATES[s]?.region === activeRegion);
  }, [activeRegion]);

  const clubsByState = useMemo(() => {
    const grouped: Record<string, ClubData[]> = {};
    for (const club of filteredClubs) {
      if (!grouped[club.stateCode]) grouped[club.stateCode] = [];
      grouped[club.stateCode].push(club);
    }
    return Object.entries(grouped).sort(([a], [b]) => {
      const idxA = STATE_ORDER.indexOf(a as string);
      const idxB = STATE_ORDER.indexOf(b as string);
      return idxA - idxB;
    });
  }, [filteredClubs]);

  const activities = useMemo(() => {
    const set = new Set<string>();
    allClubs.forEach((c) => c.activities.forEach((a) => set.add(a)));
    return [...set].sort();
  }, [allClubs]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-[#1a3d28]/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Club Directory</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stats.totalClubs} clubs{stats.totalCountries > 1 ? ` across ${stats.totalCountries} countries` : " across the USA"}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-0.5">
                <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}>
                  <List className="h-3.5 w-3.5" />List
                </button>
                <button onClick={() => setViewMode("map")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${viewMode === "map" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 dark:text-zinc-400"}`}>
                  <MapIcon className="h-3.5 w-3.5" />Map
                </button>
              </div>
              <Link href="/clubs/manage" className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 min-h-[44px] touch-manipulation hidden sm:flex items-center">Manage Club</Link>
              <Link href="/clubs/claim" className="rounded-xl bg-[#1B5E20] px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#145218] min-h-[44px] touch-manipulation flex items-center">
                <span className="hidden sm:inline">+ Add Your Club</span>
                <span className="sm:hidden">+ Add</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard value={stats.totalClubs} label="Clubs Listed" icon={<CircleDot className="w-6 h-6 text-[#1B5E20]" strokeWidth={1.5} />} />
          <StatCard value={stats.totalCountries > 1 ? stats.totalCountries : stats.totalStates} label={stats.totalCountries > 1 ? "Countries" : "States"} icon={<Globe className="w-6 h-6 text-[#1B5E20]" strokeWidth={1.5} />} />
          <StatCard value={stats.totalMembers.toLocaleString()} label="Total Members" icon={<Users className="w-6 h-6 text-[#1B5E20]" strokeWidth={1.5} />} />
          <StatCard value={stats.activeClubs} label="Active Clubs" icon={<CheckCircle className="w-6 h-6 text-[#1B5E20]" strokeWidth={1.5} />} />
        </motion.div>

        <div className="relative mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Search clubs by name, city, or state..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 py-3.5 pl-12 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20" />
          </div>
          <button
            onClick={handleNearMe}
            disabled={geoLoading}
            className={`shrink-0 flex items-center gap-1.5 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-colors touch-manipulation ${
              nearMeActive
                ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-white/5"
            } ${geoLoading ? "opacity-60" : ""}`}
          >
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">{geoLoading ? "Locating..." : "Near Me"}</span>
          </button>
        </div>

        {/* Country tabs */}
        {stats.totalCountries > 1 && (
          <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <FilterPill active={activeCountry === "all"} onClick={() => { setActiveCountry("all"); setActiveRegion("all"); setActiveState("all"); }} label={`All (${stats.totalClubs})`} />
            {(Object.keys(COUNTRIES) as CountryCode[]).filter((c) => allClubs.some((cl) => (cl.country ?? cl.countryCode ?? "US") === c)).map((c) => {
              const count = allClubs.filter((cl) => (cl.country ?? cl.countryCode ?? "US") === c).length;
              return <FilterPill key={c} active={activeCountry === c} onClick={() => { setActiveCountry(c); setActiveRegion("all"); setActiveState("all"); }} label={`${COUNTRIES[c].flag} ${COUNTRIES[c].name} (${count})`} />;
            })}
          </div>
        )}

        {/* Region filters (US-only) */}
        {(activeCountry === "all" || activeCountry === "US") && (
          <div className="mb-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <FilterPill active={activeRegion === "all"} onClick={() => { setActiveRegion("all"); setActiveState("all"); }} label="All Regions" />
            {(Object.keys(REGION_LABELS) as USRegion[]).map((r) => (
              <FilterPill key={r} active={activeRegion === r} onClick={() => { setActiveRegion(r); setActiveState("all"); }} label={REGION_LABELS[r].label} />
            ))}
          </div>
        )}

        {/* State/Province filter */}
        {(activeCountry === "all" || activeCountry === "US") && (
          <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
            <FilterPill active={activeState === "all"} onClick={() => setActiveState("all")} label="All States" />
            {availableStates.map((s) => (
              <FilterPill key={s} active={activeState === s} onClick={() => setActiveState(s)} label={s} />
            ))}
          </div>
        )}

        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterPill active={activeActivity === "all"} onClick={() => setActiveActivity("all")} label="All Activities" small />
          {activities.map((a) => (
            <FilterPill key={a} active={activeActivity === a} onClick={() => setActiveActivity(a)} label={a} small />
          ))}
        </div>

        {viewMode === "map" ? (
          <Suspense fallback={<div className="aspect-video rounded-2xl bg-zinc-100 animate-pulse" />}>
            <ClubMapLazy
              fullScreen={false}
              hideFilters
              region={activeRegion}
              stateFilter={activeState}
              activity={activeActivity}
              searchQuery={query}
            />
          </Suspense>
        ) : filteredClubs.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <MapPin className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No clubs found</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Try adjusting your search or filters</p>
          </div>
        ) : nearMeActive && userLocation ? (
          <div className="space-y-3">
            {filteredClubs.map((club, i) => (
              <ClubCard key={club.id} club={club} index={i} distanceMi={distanceMap.get(club.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {clubsByState.map(([stateCode, clubs]) => (
              <StateSection key={stateCode} stateCode={stateCode} clubs={clubs} distanceMap={distanceMap} />
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white dark:bg-[#1a3d28] p-8 text-center">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Don&apos;t see your club?</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Help us build the most complete lawn bowls directory in the world</p>
          <Link href="/clubs/claim" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#1B5E20] transition-colors">
            <MapPin className="h-4 w-4" />
            Add Your Club
          </Link>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="mt-1 text-2xl font-black text-zinc-900 tabular-nums">{value}</p>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}

function FilterPill({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full border px-4 font-medium transition-colors touch-manipulation min-h-[44px] ${small ? "py-2 text-xs" : "py-2.5 text-sm"} ${active ? "border-[#1B5E20] bg-[#1B5E20] text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-white/5"}`}>
      {label}
    </button>
  );
}

function StateSection({ stateCode, clubs, distanceMap }: { stateCode: string; clubs: ClubData[]; distanceMap?: Map<string, number> }) {
  const state = US_STATES[stateCode];
  const stateName = state?.name ?? stateCode;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">{stateName}</h2>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-500 tabular-nums">{clubs.length}</span>
        </div>
        <Link href={`/clubs/${stateCode.toLowerCase()}`} className="text-sm font-medium text-[#1B5E20] hover:text-[#1B5E20]">View all →</Link>
      </div>
      <div className="space-y-3">
        {clubs.map((club, i) => (
          <ClubCard key={club.id} club={club} index={i} distanceMi={distanceMap?.get(club.id)} />
        ))}
      </div>
    </section>
  );
}

function ClubCard({ club, index, distanceMi }: { club: ClubData; index: number; distanceMi?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/clubs/${club.stateCode.toLowerCase()}/${club.id}`}>
        <div className="group rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition-all hover:border-zinc-300 hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#1B5E20] transition-colors truncate">{club.name}</h3>
                {distanceMi != null && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 tabular-nums">
                    {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {club.city}, {club.stateCode}
                  {(club.country ?? club.countryCode) && (club.country ?? club.countryCode) !== "US" && (
                    <> {COUNTRIES[(club.country ?? club.countryCode) as CountryCode]?.flag}</>
                  )}
                </span>
                {club.founded && <span className="text-zinc-300">·</span>}
                {club.founded && <span>Est. {club.founded}</span>}
              </div>
              {club.description && <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{club.description}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {club.memberCount && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                    <Users className="h-3 w-3" />{club.memberCount} members
                  </span>
                )}
                {club.greens && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                    <Leaf className="h-3 w-3" />{club.greens} {club.greens === 1 ? "green" : "greens"}{club.rinks && ` · ${club.rinks} rinks`}
                  </span>
                )}
                {club.surfaceType !== "unknown" && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{SURFACE_LABELS[club.surfaceType]}</span>
                )}
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${club.status === "claimed" ? "bg-blue-50 text-[#2E7D32]" : club.status === "active" ? "bg-[#1B5E20]/5 text-[#2E7D32]" : club.status === "seasonal" ? "bg-amber-50 text-amber-700" : "bg-zinc-100 text-zinc-500 dark:text-zinc-400"}`}>
                  {club.status === "claimed" ? "Verified" : club.status === "active" ? "Active" : club.status === "seasonal" ? "Seasonal" : club.status}
                </span>
                {club.contacts && club.contacts.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    <Users className="h-3 w-3" />{club.contacts.length} contact{club.contacts.length !== 1 ? "s" : ""}
                  </span>
                )}
                {club.website && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    <Globe className="h-3 w-3" />Website
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {club.activities.slice(0, 4).map((a) => (
                  <span key={a} className="rounded-full border border-zinc-100 px-2 py-0.5 text-xs text-zinc-400">{a}</span>
                ))}
                {club.activities.length > 4 && (
                  <span className="rounded-full px-2 py-0.5 text-xs text-zinc-400">+{club.activities.length - 4} more</span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300 group-hover:text-[#1B5E20] transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
