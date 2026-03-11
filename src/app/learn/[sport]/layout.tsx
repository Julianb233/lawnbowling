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

  return {};
}

export default function SportLayout({ children }: Props) {
  return <>{children}</>;
}
