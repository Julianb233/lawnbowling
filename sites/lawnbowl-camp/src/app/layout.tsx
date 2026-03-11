import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawnBowl Camp | Per-Session Insurance for Lawn Bowlers",
  description:
    "The only per-session insurance designed for lawn bowlers. Covers injuries, liability, equipment damage, and emergency transport. No annual commitment. From $3/session.",
  keywords: [
    "lawn bowling insurance",
    "lawn bowls insurance",
    "per-session sports insurance",
    "lawn bowling liability",
    "bowling green insurance",
    "lawn bowls coverage",
  ],
  openGraph: {
    title: "LawnBowl Camp | Per-Session Insurance for Lawn Bowlers",
    description:
      "Affordable per-session lawn bowling insurance from $3/player. No forms, no annual commitment.",
    url: "https://lawnbowl.camp",
    siteName: "LawnBowl Camp",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LawnBowl Camp | Per-Session Insurance",
    description: "Per-session lawn bowling insurance from $3/player.",
  },
  metadataBase: new URL("https://lawnbowl.camp"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
