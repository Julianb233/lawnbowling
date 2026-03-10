import { createClient } from "@/lib/supabase/server";
import type { PlayerReview } from "@/lib/types";

export async function getPlayerReviews(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reviews")
    .select("*, reviewer:players!reviewer_id(*)")
    .eq("reviewed_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PlayerReview[];
}

export async function getPlayerAverageRating(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reviews")
    .select("rating")
    .eq("reviewed_id", playerId);

  if (error) throw error;
  if (!data || data.length === 0) return { average: 0, count: 0 };

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / data.length, count: data.length };
}

export async function createReview(review: {
  reviewer_id: string;
  reviewed_id: string;
  match_id?: string;
  rating: number;
  comment?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data as PlayerReview;
}
