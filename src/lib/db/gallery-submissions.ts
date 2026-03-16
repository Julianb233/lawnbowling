import { createClient } from "@/lib/supabase/server";

export interface GallerySubmission {
  id: string;
  player_id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  player?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

/** Get approved gallery submissions */
export async function getApprovedSubmissions(limit = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_submissions")
    .select(
      "*, player:players(id, display_name, avatar_url)"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as GallerySubmission[];
}

/** Get submissions by a specific player */
export async function getPlayerSubmissions(playerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_submissions")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GallerySubmission[];
}

/** Submit a new gallery photo */
export async function submitGalleryPhoto(submission: {
  player_id: string;
  title: string;
  description?: string;
  category: string;
  image_url: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_submissions")
    .insert({
      player_id: submission.player_id,
      title: submission.title,
      description: submission.description ?? null,
      category: submission.category,
      image_url: submission.image_url,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as GallerySubmission;
}

/** Get all pending submissions (admin) */
export async function getPendingSubmissions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_submissions")
    .select(
      "*, player:players(id, display_name, avatar_url)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GallerySubmission[];
}

/** Approve or reject a submission (admin) */
export async function moderateSubmission(
  submissionId: string,
  status: "approved" | "rejected"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gallery_submissions")
    .update({ status })
    .eq("id", submissionId);

  if (error) throw error;
}
