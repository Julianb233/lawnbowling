import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawnBowl Camp — Per-Session Insurance for Lawn Bowling",
  description:
    "Affordable per-session lawn bowling insurance from $3/player. Covers injuries, liability, equipment damage, and emergency transport. Powered by Daily Event Insurance.",
  metadataBase: new URL("https://lawnbowl.camp"),
  openGraph: {
    title: "LawnBowl Camp — Per-Session Insurance for Lawn Bowling",
    description:
      "The only per-session insurance designed for lawn bowlers. From $3/player. No annual commitment.",
    type: "website",
    url: "https://lawnbowl.camp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-zinc-900">{children}</body>
    </html>
  );
}
