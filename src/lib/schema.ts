// Schema.org JSON-LD structured data generators
// See https://schema.org for full specification

import type { ClubData } from "./clubs-data";
import { SITE_URL } from "./site-config";

const BASE_URL = SITE_URL;

/**
 * SportsOrganization schema for the Lawnbowling app itself.
 * Used on the homepage and about page.
 */
export function getSportsOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Lawnbowling",
    alternateName: "Lawn Bowl App",
    url: BASE_URL,
    logo: `${BASE_URL}/icons/icon-512.png`,
    description:
      "Tournament management, club directory, and everything lawn bowling. The modern platform for lawn bowling clubs and players.",
    sport: "Lawn Bowling",
    sameAs: [
      "https://lawnbowling.app",
      "https://lawnbowl.camp",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${BASE_URL}/contact`,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };
}

/**
 * SoftwareApplication schema for the PWA.
 * Used on the homepage and pricing page.
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lawnbowling",
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "SportsApplication",
    description:
      "The all-in-one lawn bowling app. Tournament draws, scoring, club directory, check-in kiosk, and player matchmaking.",
    url: BASE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free for players. Premium plans available for clubs.",
    },
    screenshot: `${BASE_URL}/og-image.png`,
    featureList: [
      "Tournament draw generator",
      "Round-robin bracket maker",
      "Club directory with 90+ USA clubs",
      "QR code venue check-in",
      "Live scoring",
      "Player matchmaking",
      "Kiosk mode for venues",
      "Push notifications",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "120",
      bestRating: "5",
    },
  };
}

/**
 * SportsEvent schema for a tournament.
 * Used on individual tournament pages.
 */
export function getSportsEventSchema(event: {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  url?: string;
  organizer?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.name,
    description: event.description ?? `${event.name} lawn bowling tournament`,
    startDate: event.startDate,
    endDate: event.endDate ?? event.startDate,
    sport: "Lawn Bowling",
    url: event.url ?? `${BASE_URL}/bowls`,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
        }
      : undefined,
    organizer: event.organizer
      ? {
          "@type": "Organization",
          name: event.organizer,
        }
      : {
          "@type": "Organization",
          name: "Lawnbowling",
          url: BASE_URL,
        },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
}

/**
 * LocalBusiness schema for a lawn bowling club.
 * Used on club detail pages and the directory.
 */
export function getLocalBusinessSchema(club: ClubData) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/clubs/${club.stateCode.toLowerCase()}#${club.id}`,
    name: club.name,
    description:
      club.description ??
      `${club.name} is a lawn bowling club in ${club.city}, ${club.state}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: club.address ?? undefined,
      addressLocality: club.city,
      addressRegion: club.stateCode,
      addressCountry: "US",
    },
    geo:
      club.lat && club.lng
        ? {
            "@type": "GeoCoordinates",
            latitude: club.lat,
            longitude: club.lng,
          }
        : undefined,
    url: club.website ?? `${BASE_URL}/clubs/${club.stateCode.toLowerCase()}`,
    telephone: club.phone ?? undefined,
    email: club.email ?? undefined,
    sport: "Lawn Bowling",
    amenityFeature: club.facilities.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: f,
      value: true,
    })),
    foundingDate: club.founded ? String(club.founded) : undefined,
    sameAs: [
      club.website,
      club.facebookUrl,
      club.instagramUrl,
      club.youtubeUrl,
    ].filter(Boolean),
  };
}

/**
 * WebSite schema with SearchAction for sitelinks search box.
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lawnbowling",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/clubs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList schema for navigation.
 */
export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * FAQPage schema for FAQ sections.
 */
export function getFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Article schema for blog posts and educational content.
 */
export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url.startsWith("http")
      ? article.url
      : `${BASE_URL}${article.url}`,
    datePublished: article.datePublished ?? new Date().toISOString(),
    dateModified:
      article.dateModified ?? article.datePublished ?? new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: article.author ?? "Lawnbowling",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Lawnbowling",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icons/icon-512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.url.startsWith("http")
        ? article.url
        : `${BASE_URL}${article.url}`,
    },
  };
}

/**
 * HowTo schema for instructional learn pages.
 */
export function getHowToSchema(howTo: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    step: howTo.steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Helper to render JSON-LD script tag content.
 * Use in a <script type="application/ld+json"> tag.
 */
export function jsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema);
}
