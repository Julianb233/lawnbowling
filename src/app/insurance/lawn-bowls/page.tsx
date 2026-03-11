import type { Metadata } from "next";
import { LawnBowlsInsurancePage } from "./LawnBowlsInsurancePage";

export const metadata: Metadata = {
  title: "Lawn Bowling Insurance | Per-Session Coverage from $3 | Lawnbowling",
  description:
    "Affordable per-session lawn bowling insurance from $3/player. Covers injuries, liability, equipment damage, and emergency transport. No annual commitment. Backed by AIG and Lloyd's of London.",
  keywords: [
    "lawn bowling insurance",
    "lawn bowls insurance",
    "bowls insurance",
    "per-session sports insurance",
    "lawn bowling liability coverage",
    "lawn bowls injury insurance",
    "bowling green insurance",
    "daily event insurance lawn bowls",
  ],
  openGraph: {
    title: "Lawn Bowling Insurance | Per-Session Coverage from $3",
    description:
      "The only per-session insurance designed for lawn bowlers. Covers falls, sprains, bowl-strike injuries, and more. No forms, no annual commitment.",
    type: "website",
  },
};

export default function Page() {
  return <LawnBowlsInsurancePage />;
}
