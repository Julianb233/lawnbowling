import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { error } = await supabase.from("player_reviews").insert({
    reviewer_id: user.id,
    reviewed_id: body.reviewed_id,
    match_id: body.match_id || null,
    rating: body.rating,
    comment: body.comment || null,
  });
  if (error) return apiError(error, "reviews", 400);
  return NextResponse.json({ ok: true });
}
