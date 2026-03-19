"use client";

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, MapPin, Users, ChevronRight, ChevronDown, Globe, Leaf, Map as MapIcon, List, CircleDot, CheckCircle, Navigation, Home, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "@/components/board/BottomNav";
import { ClubLogo, getClubCoverImage } from "@/components/clubs/ClubLogo";
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

// Cover images now sourced from ClubLogo module (region-aware rotation)

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
  const [locationFiltersOpen, setLocationFiltersOpen] = useState(false);
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
    <div className="min-h-screen bg-[#FEFCF9] pb-20 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#0A2E12]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <nav className="mb-2 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
            <Link href="/" className="hover:text-[#0A2E12] transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#0A2E12]">Club Directory</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Find a Club</h1>
              <p className="text-sm text-[#3D5A3E]">{stats.totalClubs} clubs{stats.totalCountries > 1 ? ` across ${stats.totalCountries} countries` : " across the USA"}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-0.5">
                <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-white text-[#0A2E12] shadow-sm" : "text-[#3D5A3E]"}`}>
                  <List className="h-3.5 w-3.5" />List
                </button>
                <button onClick={() => setViewMode("map")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${viewMode === "map" ? "bg-white text-[#0A2E12] shadow-sm" : "text-[#3D5A3E]"}`}>
                  <MapIcon className="h-3.5 w-3.5" />Map
                </button>
              </div>
              <Link href="/clubs/manage" className="rounded-xl border border-[#0A2E12]/10 bg-white px-3 py-2.5 text-sm font-medium text-[#2D4A30] transition-colors hover:bg-[#0A2E12]/[0.03] min-h-[44px] touch-manipulation hidden sm:flex items-center">Manage Club</Link>
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

        {/* Search + Near Me */}
        <div className="relative mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3D5A3E]" />
            <input type="text" placeholder="Search clubs by name, city, or state..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-2xl border border-[#0A2E12]/10 bg-white py-3.5 pl-12 pr-4 text-base text-[#0A2E12] placeholder:text-[#3D5A3E] focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20" />
          </div>
          <button
            onClick={handleNearMe}
            disabled={geoLoading}
            className={`shrink-0 flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-colors touch-manipulation min-h-[48px] ${
              nearMeActive
                ? "border-[#1B5E20] bg-[#1B5E20] text-white shadow-lg shadow-[#1B5E20]/20"
                : "border-[#1B5E20] bg-[#1B5E20] text-white hover:bg-[#145218] shadow-md shadow-[#1B5E20]/15"
            } ${geoLoading ? "opacity-60" : ""}`}
          >
            <Navigation className="h-5 w-5" />
            <span>{geoLoading ? "Locating..." : "Near Me"}</span>
          </button>
        </div>

        {/* Collapsible location filters */}
        <div className="mb-4">
          <button
            onClick={() => setLocationFiltersOpen(!locationFiltersOpen)}
            className="flex w-full items-center justify-between rounded-2xl border border-[#0A2E12]/10 bg-white px-4 py-3 text-sm font-medium text-[#3D5A3E] transition-colors hover:bg-[#0A2E12]/[0.03] touch-manipulation min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter by location
              {(activeCountry !== "all" || activeRegion !== "all" || activeState !== "all") && (
                <span className="rounded-full bg-[#1B5E20] px-2 py-0.5 text-xs font-bold text-white">
                  {[activeCountry !== "all" && COUNTRIES[activeCountry as CountryCode]?.name, activeRegion !== "all" && REGION_LABELS[activeRegion as USRegion]?.label, activeState !== "all" && activeState].filter(Boolean).join(" / ")}
                </span>
              )}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${locationFiltersOpen ? "rotate-180" : ""}`} />
          </button>

          {locationFiltersOpen && (
            <div className="mt-2 space-y-2 rounded-2xl border border-[#0A2E12]/10 bg-white p-4">
              {/* Country tabs */}
              {stats.totalCountries > 1 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">Country</p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <FilterPill active={activeCountry === "all"} onClick={() => { setActiveCountry("all"); setActiveRegion("all"); setActiveState("all"); }} label={`All (${stats.totalClubs})`} />
                    {(Object.keys(COUNTRIES) as CountryCode[]).filter((c) => allClubs.some((cl) => (cl.country ?? cl.countryCode ?? "US") === c)).map((c) => {
                      const count = allClubs.filter((cl) => (cl.country ?? cl.countryCode ?? "US") === c).length;
                      return <FilterPill key={c} active={activeCountry === c} onClick={() => { setActiveCountry(c); setActiveRegion("all"); setActiveState("all"); }} label={`${COUNTRIES[c].flag} ${COUNTRIES[c].name} (${count})`} />;
                    })}
                  </div>
                </div>
              )}

              {/* Region filters (US-only) */}
              {(activeCountry === "all" || activeCountry === "US") && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">Region</p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <FilterPill active={activeRegion === "all"} onClick={() => { setActiveRegion("all"); setActiveState("all"); }} label="All Regions" />
                    {(Object.keys(REGION_LABELS) as USRegion[]).map((r) => (
                      <FilterPill key={r} active={activeRegion === r} onClick={() => { setActiveRegion(r); setActiveState("all"); }} label={REGION_LABELS[r].label} />
                    ))}
                  </div>
                </div>
              )}

              {/* State/Province filter */}
              {(activeCountry === "all" || activeCountry === "US") && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]">State</p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <FilterPill active={activeState === "all"} onClick={() => setActiveState("all")} label="All States" />
                    {availableStates.map((s) => (
                      <FilterPill key={s} active={activeState === s} onClick={() => setActiveState(s)} label={s} />
                    ))}
                  </div>
                </div>
              )}

              {/* Clear location filters */}
              {(activeCountry !== "all" || activeRegion !== "all" || activeState !== "all") && (
                <button
                  onClick={() => { setActiveCountry("all"); setActiveRegion("all"); setActiveState("all"); }}
                  className="text-xs font-medium text-[#1B5E20] hover:underline"
                >
                  Clear location filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Activity filters — horizontally scrollable on one line */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterPill active={activeActivity === "all"} onClick={() => setActiveActivity("all")} label="All Activities" small />
          {activities.map((a) => (
            <FilterPill key={a} active={activeActivity === a} onClick={() => setActiveActivity(a)} label={a} small />
          ))}
        </div>

        {viewMode === "map" ? (
          <Suspense fallback={<div className="aspect-video rounded-2xl bg-[#0A2E12]/5 animate-pulse" />}>
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
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0A2E12]/5">
              <MapPin className="h-8 w-8 text-[#3D5A3E]" />
            </div>
            <h3 className="text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>No clubs found</h3>
            <p className="mt-1 text-sm text-[#3D5A3E]">Try adjusting your search or filters</p>
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 rounded-2xl border border-dashed border-[#0A2E12]/10 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>Don&apos;t see your club?</h3>
          <p className="mt-1 text-sm text-[#3D5A3E]">Help us build the most complete lawn bowls directory in the world</p>
          <Link href="/clubs/claim" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px]">
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
    <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="mt-1 text-2xl font-black text-[#B8860B] tabular-nums font-display" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      <p className="text-xs font-medium text-[#3D5A3E]">{label}</p>
    </div>
  );
}

function FilterPill({ active, onClick, label, small }: { active: boolean; onClick: () => void; label: string; small?: boolean }) {
  return (
    <button onClick={onClick} className={`shrink-0 rounded-full border px-4 font-medium transition-colors touch-manipulation min-h-[44px] ${small ? "py-2 text-xs" : "py-2.5 text-sm"} ${active ? "border-[#1B5E20] bg-[#1B5E20] text-white" : "border-[#0A2E12]/10 bg-white text-[#3D5A3E] hover:border-[#0A2E12]/10 hover:bg-[#0A2E12]/[0.03]"}`}>
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
          <h2 className="text-lg font-black text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>{stateName}</h2>
          <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-0.5 text-xs font-bold text-[#3D5A3E] tabular-nums">{clubs.length}</span>
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
  const photo = getClubCoverImage(club.id, club.region);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/clubs/${club.stateCode.toLowerCase()}/${club.id}`}>
        <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white overflow-hidden transition-all hover:border-[#0A2E12]/20 hover:shadow-sm">
          <div className="flex">
            <div className="relative w-28 sm:w-36 shrink-0">
              <Image src={photo} alt={club.name} fill className="object-cover" sizes="(max-width: 640px) 112px, 144px" />
              {/* Club logo overlay on thumbnail */}
              <div className="absolute bottom-1.5 right-1.5 ring-2 ring-white rounded-full shadow-md">
                <ClubLogo name={club.name} stateCode={club.stateCode} country={club.country ?? club.countryCode} logoUrl={club.logoUrl} size="xs" />
              </div>
            </div>
            <div className="flex-1 min-w-0 p-5 sm:p-6 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors truncate">{club.name}</h3>
                  {distanceMi != null && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 tabular-nums">
                      {distanceMi < 1 ? "<1" : Math.round(distanceMi)} mi
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {club.city}, {club.stateCode}
                    {(club.country ?? club.countryCode) && (club.country ?? club.countryCode) !== "US" && (
                      <> {COUNTRIES[(club.country ?? club.countryCode) as CountryCode]?.flag}</>
                    )}
                  </span>
                  {club.founded && <span className="text-[#0A2E12]/20">·</span>}
                  {club.founded && <span>Est. {club.founded}</span>}
                </div>
                {club.description && <p className="mt-2 text-sm text-[#3D5A3E] line-clamp-2">{club.description}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {club.memberCount && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                      <Users className="h-3 w-3" />{club.memberCount} members
                    </span>
                  )}
                  {club.greens && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                      <Leaf className="h-3 w-3" />{club.greens} {club.greens === 1 ? "green" : "greens"}{club.rinks && ` · ${club.rinks} rinks`}
                    </span>
                  )}
                  {club.surfaceType !== "unknown" && (
                    <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-medium text-[#3D5A3E]">{SURFACE_LABELS[club.surfaceType]}</span>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${club.status === "claimed" ? "bg-blue-50 text-[#2E7D32]" : club.status === "active" ? "bg-[#1B5E20]/5 text-[#2E7D32]" : club.status === "seasonal" ? "bg-amber-50 text-amber-700" : "bg-[#0A2E12]/5 text-[#3D5A3E]"}`}>
                    {club.status === "claimed" ? "Verified" : club.status === "active" ? "Active" : club.status === "seasonal" ? "Seasonal" : club.status}
                  </span>
                </div>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#0A2E12]/20 group-hover:text-[#1B5E20] transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
