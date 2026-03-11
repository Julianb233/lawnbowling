import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Users,
  Leaf,
  ChevronRight,
  ExternalLink,
  Building2,
  Calendar,
  Map,
} from "lucide-react";
import {
  CLUBS,
  US_STATES,
  SURFACE_LABELS,
  getClubById,
  getClubsByState,
  type ClubData,
} from "@/lib/clubs-data";
import {
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  jsonLd,
} from "@/lib/schema";
import { SingleClubMap } from "@/components/clubs/SingleClubMap";

interface ClubPageProps {
  params: Promise<{ state: string; slug: string }>;
}

export async function generateStaticParams() {
  return CLUBS.map((club) => ({
    state: club.stateCode.toLowerCase(),
    slug: club.id,
  }));
}

export async function generateMetadata({
  params,
}: ClubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubById(slug);
  if (!club) return { title: "Club Not Found" };

  const title = `${club.name} — Lawn Bowls in ${club.city}, ${club.stateCode}`;
  const description =
    club.description ??
    `${club.name} is a lawn bowls club in ${club.city}, ${club.state}. Find address, contact info, surface type, and more.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/clubs/${club.stateCode.toLowerCase()}/${club.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lawnbowl.app/clubs/${club.stateCode.toLowerCase()}/${club.id}`,
      type: "website",
      ...(club.coverImageUrl && { images: [{ url: club.coverImageUrl }] }),
    },
    twitter: {
      card: club.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(club.coverImageUrl && { images: [club.coverImageUrl] }),
    },
  };
}

export default async function ClubDetailPage({ params }: ClubPageProps) {
  const { state, slug } = await params;
  const club = getClubById(slug);

  if (!club || club.stateCode.toLowerCase() !== state.toLowerCase()) {
    notFound();
  }

  const stateInfo = US_STATES[club.stateCode];

  // Nearby clubs: same state, excluding current club
  const nearbyClubs = getClubsByState(club.stateCode).filter(
    (c) => c.id !== club.id
  );

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Club Directory", url: "/clubs" },
    { name: stateInfo.name, url: `/clubs/${club.stateCode.toLowerCase()}` },
    {
      name: club.name,
      url: `/clubs/${club.stateCode.toLowerCase()}/${club.id}`,
    },
  ]);

  const clubSchema = getLocalBusinessSchema(club);

  return (
    <div className="min-h-screen bg-zinc-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clubSchema) }}
      />

      {/* Cover Image Hero */}
      {club.coverImageUrl && (
        <div className="relative h-48 w-full overflow-hidden bg-zinc-200 sm:h-60">
          <Image
            src={club.coverImageUrl}
            alt={`${club.name} cover photo`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
            <Link
              href="/clubs"
              className="hover:text-zinc-900 transition-colors"
            >
              Clubs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/clubs/${club.stateCode.toLowerCase()}`}
              className="hover:text-zinc-900 transition-colors"
            >
              {stateInfo.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-zinc-900 truncate">
              {club.name}
            </span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {club.logoUrl && (
                <Image
                  src={club.logoUrl}
                  alt={`${club.name} logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full border border-zinc-200 object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
                  {club.name}
                </h1>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {club.city}, {club.state}
                  </span>
                  {club.founded && (
                    <>
                      <span className="text-zinc-300">·</span>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Est. {club.founded}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                club.status === "claimed"
                  ? "bg-blue-50 text-[#2E7D32]"
                  : club.status === "active"
                    ? "bg-[#1B5E20]/5 text-[#2E7D32]"
                    : club.status === "seasonal"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {club.status === "claimed"
                ? "Verified"
                : club.status === "active"
                  ? "Year-Round"
                  : club.status === "seasonal"
                    ? "Seasonal"
                    : club.status}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content — left 2 cols */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            {club.description && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="mb-3 text-lg font-bold text-zinc-900">About</h2>
                <p className="text-sm leading-relaxed text-zinc-600">
                  {club.description}
                </p>
              </section>
            )}

            {/* Club Details */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">
                Club Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Surface Type */}
                <DetailItem
                  icon={<Leaf className="h-4 w-4" />}
                  label="Surface Type"
                  value={SURFACE_LABELS[club.surfaceType]}
                />
                {/* Greens */}
                {club.greens && (
                  <DetailItem
                    icon={<Map className="h-4 w-4" />}
                    label="Greens"
                    value={`${club.greens} green${club.greens !== 1 ? "s" : ""}${club.rinks ? ` (${club.rinks} rinks)` : ""}`}
                  />
                )}
                {/* Members */}
                {club.memberCount && (
                  <DetailItem
                    icon={<Users className="h-4 w-4" />}
                    label="Members"
                    value={`${club.memberCount} members`}
                  />
                )}
                {/* Founded */}
                {club.founded && (
                  <DetailItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Founded"
                    value={String(club.founded)}
                  />
                )}
              </div>
            </section>

            {/* Activities */}
            {club.activities.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">
                  Activities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {club.activities.map((activity) => (
                    <span
                      key={activity}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Facilities */}
            {club.facilities.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-zinc-900">
                  Facilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {club.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full bg-[#1B5E20]/5 px-3 py-1.5 text-sm font-medium text-[#2E7D32]"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Location Map */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">
                Location
              </h2>
              <SingleClubMap
                lat={club.lat}
                lng={club.lng}
                clubName={club.name}
                address={club.address ?? `${club.city}, ${club.state}`}
              />
            </section>
          </div>

          {/* Sidebar — right col */}
          <div className="space-y-6">
            {/* Contact Card */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-zinc-900">
                Contact Info
              </h2>
              <div className="space-y-3">
                {club.address && (
                  <ContactRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                  >
                    <span className="text-sm text-zinc-600">{club.address}</span>
                  </ContactRow>
                )}
                {club.phone && (
                  <ContactRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                  >
                    <a
                      href={`tel:${club.phone}`}
                      className="text-sm text-[#1B5E20] hover:underline"
                    >
                      {club.phone}
                    </a>
                  </ContactRow>
                )}
                {club.email && (
                  <ContactRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                  >
                    <a
                      href={`mailto:${club.email}`}
                      className="text-sm text-[#1B5E20] hover:underline break-all"
                    >
                      {club.email}
                    </a>
                  </ContactRow>
                )}
                {club.website && (
                  <ContactRow
                    icon={<Globe className="h-4 w-4" />}
                    label="Website"
                  >
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#1B5E20] hover:underline break-all"
                    >
                      {club.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </ContactRow>
                )}
                {!club.address &&
                  !club.phone &&
                  !club.email &&
                  !club.website && (
                    <p className="text-sm text-zinc-400">
                      No contact information available yet.
                    </p>
                  )}
              </div>
            </section>

            {/* Claim CTA */}
            <section className="rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-zinc-400" />
              <h3 className="mt-3 text-base font-bold text-zinc-900">
                Is this your club?
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Claim this listing to update info, add photos, and manage your
                club page.
              </p>
              <Link
                href="/clubs/claim"
                className="mt-4 inline-block w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#1B5E20" }}
              >
                Claim This Club
              </Link>
            </section>

            {/* Tags */}
            {club.tags.length > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-6">
                <h2 className="mb-3 text-sm font-bold text-zinc-900">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {club.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-100 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Nearby Clubs */}
        {nearbyClubs.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900">
                More Clubs in {stateInfo.name}
              </h2>
              <Link
                href={`/clubs/${club.stateCode.toLowerCase()}`}
                className="text-sm font-medium text-[#1B5E20] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyClubs.slice(0, 6).map((nearby) => (
                <Link
                  key={nearby.id}
                  href={`/clubs/${nearby.stateCode.toLowerCase()}/${nearby.id}`}
                >
                  <div className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-[#1B5E20] transition-colors truncate">
                      {nearby.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{nearby.city}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {nearby.surfaceType !== "unknown" && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                          {SURFACE_LABELS[nearby.surfaceType]}
                        </span>
                      )}
                      {nearby.greens && (
                        <span className="rounded-full bg-[#1B5E20]/5 px-2 py-0.5 text-[11px] font-medium text-[#1B5E20]">
                          {nearby.greens} green{nearby.greens !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <Link
            href={`/clubs/${club.stateCode.toLowerCase()}`}
            className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            &larr; {stateInfo.name} Clubs
          </Link>
          <span className="text-zinc-300">|</span>
          <Link
            href="/clubs"
            className="font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            All Clubs
          </Link>
        </div>
      </main>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        {children}
      </div>
    </div>
  );
}
