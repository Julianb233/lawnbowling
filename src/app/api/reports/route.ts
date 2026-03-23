import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { error } = await supabase.from("player_reports").insert({
    reporter_id: user.id,
    reported_id: body.reported_id,
    reason: body.reason,
    details: body.details || null,
  });
  if (error) return apiError(error, "POST /api/reports", 400);
  return NextResponse.json({ ok: true });
}
