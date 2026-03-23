import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 300; // 5 minutes

export const metadata: Metadata = {
  title: "Lawn Bowls Rules | Complete Guide to Rules of Lawn Bowling | Lawnbowling",
  description:
    "Complete guide to lawn bowls rules. Learn about the green, the jack, bias, delivery, scoring, and the sequence of play in each end. Perfect for beginners and experienced bowlers.",
  keywords: [
    "lawn bowls rules",
    "lawn bowling rules",
    "rules of lawn bowls",
    "how to play lawn bowls",
    "lawn bowls scoring rules",
    "lawn bowling rules for beginners",
    "bowls rules explained",
    "lawn bowls regulations",
  ],
  alternates: { canonical: "/learn/rules" },
  openGraph: {
    title: "Lawn Bowls Rules | Complete Guide",
    description:
      "Complete guide to lawn bowls rules. The green, the jack, bias, delivery, scoring, and sequence of play explained for beginners.",
    url: "https://lawnbowl.app/learn/rules",
    type: "article",
    siteName: "Lawnbowling",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawn Bowls Rules | Complete Beginner's Guide",
    description:
      "Learn the rules of lawn bowls — the green, jack, bias, delivery, scoring, and more. Perfect for beginners.",
  },
};

export default function LawnBowlsRulesPage() {
  redirect("/learn/rules");
}
