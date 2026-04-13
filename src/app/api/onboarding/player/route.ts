import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    display_name?: string;
    bio?: string | null;
    avatar_url?: string | null;
    experience_level?: string;
    years_playing?: number | null;
    preferred_position?: string;
    home_club_name?: string | null;
    bowling_formats?: string[];
  };

  // Normalize preferred_position to what the current DB check constraint accepts.
  // Prod DB allows: lead, second, third, skip. UI offers: lead, second, vice, skip, any.
  // "vice" and "third" are the same position — map accordingly.
  const normalizedPosition = (() => {
    const raw = body.preferred_position;
    if (!raw || raw === "any") return null;
    if (raw === "vice") return "third";
    return raw;
  })();

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { data, error } = await admin
    .from("players")
    .update({
      display_name: body.display_name,
      bio: body.bio ?? null,
      avatar_url: body.avatar_url ?? null,
      experience_level: body.experience_level,
      years_playing: body.years_playing ?? null,
      preferred_position: normalizedPosition,
      home_club_name: body.home_club_name ?? null,
      bowling_formats: body.bowling_formats ?? [],
      onboarding_completed: true,
    })
    .eq("user_id", user.id)
    .select("id, onboarding_completed")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, player: data });
}
