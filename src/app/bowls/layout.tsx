import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lawn Bowling Tournaments | LawnBowl",
  description:
    "View upcoming tournaments, register to play, and check live scores. Tournament management for lawn bowling clubs.",
  openGraph: {
    title: "Lawn Bowling Tournaments | LawnBowl",
    description:
      "View upcoming tournaments, register to play, and check live scores. Tournament management for lawn bowling clubs.",
    url: "https://www.lawnbowl.app/bowls",
  },
};

export default function BowlsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
