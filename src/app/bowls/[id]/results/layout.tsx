import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: tournament } = await supabase
      .from("tournaments")
      .select("name, format, created_at")
      .eq("id", id)
      .single();

    if (!tournament) {
      return { title: "Tournament Results" };
    }

    const title = `${tournament.name} - Results`;
    const description = `See the final standings from ${tournament.name}. View results, player rankings, and shot differences.`;
    const shareCardUrl = `/api/bowls/${id}/share-card`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: shareCardUrl,
            width: 1080,
            height: 1080,
            alt: `${tournament.name} Results`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [shareCardUrl],
      },
    };
  } catch {
    return { title: "Tournament Results" };
  }
}

export default function ResultsLayout({ children }: Props) {
  return <>{children}</>;
}
