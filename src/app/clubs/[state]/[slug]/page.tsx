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
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  UserCircle,
} from "lucide-react";
import {
  CLUBS,
  US_STATES,
  COUNTRIES,
  SURFACE_LABELS,
  getClubById,
  getNearestClubs,
  type ClubData,
  type ClubContact,
  type CountryCode,
} from "@/lib/clubs-data";
import {
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  jsonLd,
} from "@/lib/schema";
import { SingleClubMap } from "@/components/clubs/SingleClubMap";
import { VisitClubButton } from "@/components/clubs/VisitClubButton";
import { VisitorCount } from "@/components/clubs/VisitorCount";
import ClubEventCalendar from "@/components/clubs/ClubEventCalendar";
import { ClubLogo, getClubCoverImage } from "@/components/clubs/ClubLogo";

interface ClubPageProps {
  params: Promise<{ state: string; slug: string }>;
}

export async function generateStaticParams() {
  const { getAllClubs } = await import("@/lib/clubs-data");
  return getAllClubs().map((club) => ({
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

  const stateInfo = US_STATES[club.stateCode] ?? { name: club.province ?? club.state ?? club.stateCode, code: club.stateCode, region: "" as const };
  const countryCode = (club.country ?? club.countryCode ?? "US") as CountryCode;
  const countryInfo = COUNTRIES[countryCode];

  // Nearby clubs: 6 nearest by distance, regardless of state
  const nearbyClubs = club.lat != null && club.lng != null
    ? getNearestClubs(club.lat, club.lng, 6, club.id)
    : [];

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
    <div className="min-h-screen bg-[#FEFCF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clubSchema) }}
      />

      {/* Cover Image Hero — use club's cover or region-aware fallback */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0A2E12]/5 sm:h-60">
        <Image
          src={club.coverImageUrl || getClubCoverImage(club.id, club.region)}
          alt={`${club.name} cover photo`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Header */}
      <header className="border-b border-[#0A2E12]/10 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
            <Link
              href="/clubs"
              className="hover:text-[#0A2E12] transition-colors"
            >
              Clubs
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/clubs/${club.stateCode.toLowerCase()}`}
              className="hover:text-[#0A2E12] transition-colors"
            >
              {stateInfo.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-[#0A2E12] truncate">
              {club.name}
            </span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <ClubLogo
                name={club.name}
                stateCode={club.stateCode}
                country={(club.country ?? club.countryCode) as string | undefined}
                logoUrl={club.logoUrl}
                size="lg"
                className="-mt-10 ring-4 ring-white shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#0A2E12] sm:text-3xl font-display" style={{ fontFamily: "var(--font-display)" }}>
                  {club.name}
                </h1>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#3D5A3E]">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>
                    {club.city}, {club.state}
                  </span>
                  {club.founded && (
                    <>
                      <span className="text-[#3D5A3E]">·</span>
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
                      : "bg-[#0A2E12]/5 text-[#3D5A3E]"
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
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-3 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>About</h2>
                <p className="text-sm leading-relaxed text-[#3D5A3E]">
                  {club.description}
                </p>
              </section>
            )}

            {/* Club Details */}
            <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
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
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                  Activities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {club.activities.map((activity) => (
                    <span
                      key={activity}
                      className="rounded-full border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] px-3 py-1.5 text-sm font-medium text-[#2D4A30]"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Event Calendar */}
            <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
              <ClubEventCalendar clubId={club.id} />
            </section>

            {/* Facilities */}
            {club.facilities.length > 0 && (
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
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
            <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
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
            <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                Contact Info
              </h2>
              <div className="space-y-3">
                {club.address && (
                  <ContactRow
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                  >
                    <span className="text-sm text-[#3D5A3E]">{club.address}</span>
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
                    <p className="text-sm text-[#3D5A3E]">
                      No contact information available yet.
                    </p>
                  )}
              </div>
            </section>

            {/* Club Contacts / Leadership */}
            {club.contacts && club.contacts.length > 0 && (
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                  Leadership
                </h2>
                <div className="space-y-4">
                  {club.contacts.map((contact, i) => (
                    <ContactCard key={i} contact={contact} />
                  ))}
                </div>
              </section>
            )}

            {/* Social Links */}
            {(club.facebookUrl || club.instagramUrl || club.youtubeUrl || club.twitterUrl) && (
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                  Social Media
                </h2>
                <div className="flex flex-wrap gap-2">
                  {club.facebookUrl && (
                    <SocialLink href={club.facebookUrl} icon={<Facebook className="h-4 w-4" />} label="Facebook" color="#1877F2" />
                  )}
                  {club.instagramUrl && (
                    <SocialLink href={club.instagramUrl} icon={<Instagram className="h-4 w-4" />} label="Instagram" color="#E4405F" />
                  )}
                  {club.twitterUrl && (
                    <SocialLink href={club.twitterUrl} icon={<Twitter className="h-4 w-4" />} label="Twitter" color="#1DA1F2" />
                  )}
                  {club.youtubeUrl && (
                    <SocialLink href={club.youtubeUrl} icon={<ExternalLink className="h-4 w-4" />} label="YouTube" color="#FF0000" />
                  )}
                </div>
              </section>
            )}

            {/* Visiting */}
            {(club.status === "active" || club.status === "claimed") && (
              <section className="space-y-3">
                <VisitClubButton clubId={club.id} clubName={club.name} />
                <VisitorCount clubId={club.id} />
              </section>
            )}

            {/* Claim CTA */}
            <section className="rounded-2xl border-2 border-dashed border-[#0A2E12]/10 bg-white p-5 sm:p-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-[#3D5A3E]" />
              <h3 className="mt-3 text-base font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                Is this your club?
              </h3>
              <p className="mt-1 text-sm text-[#3D5A3E]">
                Claim this listing to update info, add photos, and manage your
                club page.
              </p>
              <Link
                href="/clubs/claim"
                className="mt-4 inline-block w-full rounded-xl bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white text-center transition-colors hover:bg-[#145218] min-h-[44px]"
              >
                Join This Club
              </Link>
            </section>

            {/* Tags */}
            {club.tags.length > 0 && (
              <section className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6">
                <h2 className="mb-3 text-sm font-bold text-[#0A2E12]">Tags</h2>
                <div className="flex flex-wrap gap-1.5">
                  {club.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] px-2.5 py-1 text-xs text-[#3D5A3E]"
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
              <h2 className="text-lg font-bold text-[#0A2E12] font-display" style={{ fontFamily: "var(--font-display)" }}>
                Nearby Clubs
              </h2>
              <Link
                href="/clubs"
                className="text-sm font-medium text-[#1B5E20] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyClubs.map((nearby) => (
                <Link
                  key={nearby.id}
                  href={`/clubs/${nearby.stateCode.toLowerCase()}/${nearby.id}`}
                >
                  <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-4 transition-all hover:border-[#0A2E12]/10 hover:shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#0A2E12] group-hover:text-[#1B5E20] transition-colors truncate">
                        {nearby.name}
                      </h3>
                      {"distance" in nearby && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold text-blue-700 tabular-nums">
                          {(nearby as ClubData & { distance: number }).distance < 1 ? "<1" : Math.round((nearby as ClubData & { distance: number }).distance)} mi
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#3D5A3E]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{nearby.city}, {nearby.stateCode}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {nearby.surfaceType !== "unknown" && (
                        <span className="rounded-full bg-[#0A2E12]/5 px-2 py-0.5 text-sm font-medium text-[#3D5A3E]">
                          {SURFACE_LABELS[nearby.surfaceType]}
                        </span>
                      )}
                      {nearby.greens && (
                        <span className="rounded-full bg-[#1B5E20]/5 px-2 py-0.5 text-sm font-medium text-[#1B5E20]">
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
            className="font-medium text-[#3D5A3E] hover:text-[#0A2E12]:text-[#3D5A3E] transition-colors"
          >
            &larr; {stateInfo.name} Clubs
          </Link>
          <span className="text-[#3D5A3E]">|</span>
          <Link
            href="/clubs"
            className="font-medium text-[#3D5A3E] hover:text-[#0A2E12]:text-[#3D5A3E] transition-colors"
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
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2E12]/5 text-[#3D5A3E]">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-[#3D5A3E]">{label}</p>
        <p className="text-sm font-semibold text-[#0A2E12]">{value}</p>
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
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2E12]/5 text-[#3D5A3E]">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-[#3D5A3E]">{label}</p>
        {children}
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: ClubContact }) {
  const hasSocials = contact.linkedinUrl || contact.instagramUrl || contact.facebookUrl || contact.twitterUrl;

  return (
    <div className="rounded-xl border border-[#0A2E12]/10 bg-[#0A2E12]/[0.03] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[#1B5E20]">
          <UserCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#0A2E12]">{contact.name}</p>
          <p className="text-xs text-[#3D5A3E]">{contact.role}</p>
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="mt-1 block text-xs text-[#1B5E20] hover:underline break-all">
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="mt-0.5 block text-xs text-[#3D5A3E] hover:text-[#2D4A30]">
              {contact.phone}
            </a>
          )}
          {hasSocials && (
            <div className="mt-2 flex gap-2">
              {contact.linkedinUrl && (
                <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#3D5A3E] hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {contact.instagramUrl && (
                <a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#3D5A3E] hover:text-[#E4405F] transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {contact.facebookUrl && (
                <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-[#3D5A3E] hover:text-[#1877F2] transition-colors" title="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {contact.twitterUrl && (
                <a href={contact.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-[#3D5A3E] hover:text-[#1DA1F2] transition-colors" title="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2D4A30] transition-all hover:border-[#0A2E12]/10 hover:shadow-sm"
      style={{ color }}
    >
      {icon}
      {label}
    </a>
  );
}
