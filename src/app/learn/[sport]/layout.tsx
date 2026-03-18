import type { Metadata } from "next";

const LAWN_BOWLING_SLUGS = new Set(["lawn_bowling"]);

interface Props {
  params: Promise<{ sport: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;

  if (!LAWN_BOWLING_SLUGS.has(sport)) {
    return {
      robots: { index: false, follow: false },
    };
  }

  // Enhanced SEO metadata for the "lawn bowling" keyword target page
  return {
    title:
      "Lawn Bowling | What Is Lawn Bowling? Complete Beginner's Guide | Lawnbowling",
    description:
      "Discover lawn bowling — the centuries-old sport of precision and strategy. Learn what lawn bowling is, how it works, its rich history, why people love it, and how to get started at a club near you.",
    keywords: [
      "lawn bowling",
      "what is lawn bowling",
      "lawn bowls",
      "how to play lawn bowling",
      "lawn bowling for beginners",
      "lawn bowling near me",
      "lawn bowling clubs",
      "lawn bowling rules",
      "bowls sport",
      "lawn bowling guide",
    ],
    alternates: { canonical: "/learn/lawn_bowling" },
    openGraph: {
      title: "Lawn Bowling | The Complete Beginner's Guide",
      description:
        "Everything you need to know about lawn bowling — history, how to play, equipment, and how to find a club near you.",
      url: "https://lawnbowl.app/learn/lawn_bowling",
      type: "article",
      siteName: "Lawnbowling",
    },
    twitter: {
      card: "summary_large_image",
      title: "Lawn Bowling | Complete Beginner's Guide",
      description:
        "Discover lawn bowling — the centuries-old sport of precision, strategy, and community. Learn how to play and find a club near you.",
    },
  };
}

export default function SportLayout({ children }: Props) {
  return <>{children}</>;
}
