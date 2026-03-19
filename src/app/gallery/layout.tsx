import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Club Gallery | LawnBowl",
  description:
    "Photos from lawn bowling clubs, tournaments, and events across the community.",
  openGraph: {
    title: "Club Gallery | LawnBowl",
    description:
      "Photos from lawn bowling clubs, tournaments, and events across the community.",
    url: "https://www.lawnbowling.app/gallery",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
