import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Users, ChevronRight, Leaf, Globe } from "lucide-react";
import {
  CLUBS,
  US_STATES,
  SURFACE_LABELS,
  getClubsByState,
  getStatesWithClubs,
  type ClubData,
} from "@/lib/clubs-data";
import {
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  jsonLd,
} from "@/lib/schema";

interface StatePageProps {
  params: Promise<{ state: string }>;
}

function resolveStateCode(stateParam: string): string | null {
  const upper = stateParam.toUpperCase();
  if (US_STATES[upper]) return upper;
  return null;
}

export async function generateStaticParams() {
  const states = getStatesWithClubs();
  return states.map((s) => ({ state: s.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const { state } = await params;
  const stateCode = resolveStateCode(state);
  if (!stateCode) return { title: "State Not Found" };

  const stateInfo = US_STATES[stateCode];
  const clubs = getClubsByState(stateCode);
  const title = `Lawn Bowls Clubs in ${stateInfo.name}`;
  const description = `Find ${clubs.length} lawn bowls club${clubs.length !== 1 ? "s" : ""} in ${stateInfo.name}. Browse clubs by city and surface type. Join your local lawn bowls community.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/clubs/${stateCode.toLowerCase()}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lawnbowl.app/clubs/${stateCode.toLowerCase()}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state } = await params;
  const stateCode = resolveStateCode(state);
  if (!stateCode) notFound();

  const stateInfo = US_STATES[stateCode];
  const clubs = getClubsByState(stateCode);

  if (clubs.length === 0) notFound();

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Club Directory", url: "/clubs" },
    { name: stateInfo.name, url: `/clubs/${stateCode.toLowerCase()}` },
  ]);

  // Build LocalBusiness schema for each club
  const clubSchemas = clubs.map((club) => getLocalBusinessSchema(club));

  return (
    <div className="min-h-screen bg-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      {clubSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
            <Link href="/clubs" className="hover:text-zinc-900 transition-colors">
              Club Directory
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-zinc-900">{stateInfo.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
                Lawn Bowls Clubs in {stateInfo.name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {clubs.length} club{clubs.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <Link
              href="/clubs/onboard"
              className="hidden shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-90 sm:block"
              style={{ backgroundColor: "#1B5E20" }}
            >
              + Add Club
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Club list */}
        <div className="space-y-3">
          {clubs.map((club) => (
            <ClubListCard key={club.id} club={club} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-zinc-900">
            Know a club in {stateInfo.name} we&apos;re missing?
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Help us build the most complete lawn bowls directory
          </p>
          <Link
            href="/clubs/onboard"
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
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            &larr; Back to Club Directory
          </Link>
        </div>
      </main>
    </div>
  );
}

function ClubListCard({ club }: { club: ClubData }) {
  return (
    <Link href={`/clubs/${club.stateCode.toLowerCase()}/${club.id}`}>
      <div className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#1B5E20] transition-colors truncate">
              {club.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {club.city}, {club.stateCode}
              </span>
              {club.founded && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span>Est. {club.founded}</span>
                </>
              )}
            </div>

            {club.description && (
              <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                {club.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {club.memberCount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  <Users className="h-3 w-3" />
                  {club.memberCount} members
                </span>
              )}
              {club.greens && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <Leaf className="h-3 w-3" />
                  {club.greens} {club.greens === 1 ? "green" : "greens"}
                  {club.rinks && ` · ${club.rinks} rinks`}
                </span>
              )}
              {club.surfaceType !== "unknown" && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  {SURFACE_LABELS[club.surfaceType]}
                </span>
              )}
              {club.website && (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                  <Globe className="h-3 w-3" />
                  Website
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300 group-hover:text-[#1B5E20] transition-colors" />
        </div>
      </div>
    </Link>
  );
}
