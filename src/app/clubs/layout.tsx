import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Lawn Bowling Club Near You | LawnBowl",
  description:
    "Browse 165+ lawn bowling clubs across 3 countries. Find clubs near you, read reviews, and connect with your local bowling community.",
  openGraph: {
    title: "Find a Lawn Bowling Club Near You | LawnBowl",
    description:
      "Browse 165+ lawn bowling clubs across 3 countries. Find clubs near you, read reviews, and connect with your local bowling community.",
    url: "https://www.lawnbowling.app/clubs",
  },
};

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
