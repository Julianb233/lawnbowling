import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  US_STATES,
  getClubsByState,
  getStatesWithClubs,
} from "@/lib/clubs-data";
import {
  getLocalBusinessSchema,
  getBreadcrumbSchema,
  jsonLd,
} from "@/lib/schema";
import StatePageClient from "./StatePageClient";

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
    <div className="min-h-screen bg-[#FEFCF9]">
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

      <StatePageClient
        clubs={clubs}
        stateName={stateInfo.name}
        stateCode={stateCode}
      />
    </div>
  );
}
