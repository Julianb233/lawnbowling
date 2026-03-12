"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, ChevronRight, Leaf, Globe, Map as MapIcon, List, Home } from "lucide-react";
import { ClubLogo, getClubCoverImage } from "@/components/clubs/ClubLogo";
import {
  SURFACE_LABELS,
  type ClubData,
} from "@/lib/clubs-data";

// Cover images now sourced from ClubLogo module (region-aware rotation)

const ClubMapLazy = lazy(() =>
  import("@/components/clubs/ClubMap").then((m) => ({ default: m.ClubMap }))
);

interface StatePageClientProps {
  clubs: ClubData[];
  stateName: string;
  stateCode: string;
}

export default function StatePageClient({ clubs, stateName, stateCode }: StatePageClientProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <>
      {/* Header */}
      <header className="border-b border-[#0A2E12]/10 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
            <Link href="/" className="hover:text-[#0A2E12] transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/clubs" className="hover:text-[#0A2E12] transition-colors">
              Club Directory
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#0A2E12]">{stateName}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0A2E12] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                Lawn Bowls Clubs in {stateName}
              </h1>
              <p className="mt-1 text-sm text-[#3D5A3E]">
                {clubs.length} club{clubs.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#0A2E12] shadow-sm"
                      : "text-[#3D5A3E]"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    viewMode === "map"
                      ? "bg-white text-[#0A2E12] shadow-sm"
                      : "text-[#3D5A3E]"
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Map
                </button>
              </div>
              <Link
                href="/clubs/claim"
                className="hidden shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 sm:block"
                style={{ backgroundColor: "#1B5E20" }}
              >
                + Add Club
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {viewMode === "map" ? (
          <Suspense
            fallback={
              <div className="aspect-video rounded-2xl bg-[#0A2E12]/5 animate-pulse" />
            }
          >
            <ClubMapLazy fullScreen={false} hideFilters stateFilter={stateCode} />
          </Suspense>
        ) : (
          <div className="space-y-3">
            {clubs.map((club) => (
              <ClubListCard key={club.id} club={club} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-dashed border-[#0A2E12]/10 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-[#0A2E12]">
            Know a club in {stateName} we&apos;re missing?
          </h3>
          <p className="mt-1 text-sm text-[#3D5A3E]">
            Help us build the most complete lawn bowls directory
          </p>
          <Link
            href="/clubs/claim"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#1B5E20" }}
          >
            <MapPin className="h-4 w-4" />
            Add Your Club
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/clubs"
            className="text-sm font-medium text-[#3D5A3E] hover:text-[#0A2E12]:text-[#3D5A3E] transition-colors"
          >
            &larr; Back to Club Directory
          </Link>
        </div>
      </main>
    </>
  );
}

function ClubListCard({ club }: { club: ClubData }) {
  const photo = getClubCoverImage(club.id, club.region);
  return (
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
          <div className="flex-1 min-w-0 p-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors truncate">
                {club.name}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {club.city}, {club.stateCode}
                </span>
                {club.founded && (
                  <>
                    <span className="text-[#0A2E12]/20">·</span>
                    <span>Est. {club.founded}</span>
                  </>
                )}
              </div>

              {club.description && (
                <p className="mt-2 text-sm text-[#3D5A3E] line-clamp-2">
                  {club.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {club.memberCount && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                    <Users className="h-3 w-3" />
                    {club.memberCount} members
                  </span>
                )}
                {club.greens && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1B5E20]/5 px-2.5 py-1 text-xs font-medium text-[#2E7D32]">
                    <Leaf className="h-3 w-3" />
                    {club.greens} {club.greens === 1 ? "green" : "greens"}
                    {club.rinks && ` · ${club.rinks} rinks`}
                  </span>
                )}
                {club.surfaceType !== "unknown" && (
                  <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-medium text-[#3D5A3E]">
                    {SURFACE_LABELS[club.surfaceType]}
                  </span>
                )}
                {club.website && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0A2E12]/5 px-2.5 py-1 text-xs font-medium text-[#3D5A3E]">
                    <Globe className="h-3 w-3" />
                    Website
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#0A2E12]/20 group-hover:text-[#1B5E20] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
