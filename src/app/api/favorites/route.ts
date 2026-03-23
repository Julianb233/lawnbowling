import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerIdFromAuth } from "@/lib/db/get-player-id";
import { apiError } from "@/lib/api-error-handler";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { favoriteSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const result = await validateBody(request, favoriteSchema);
  if (isValidationError(result)) return result;

  const { error } = await supabase
    .from("favorites")
    .upsert({ player_id: playerId, favorite_id: result.favorite_id });
  if (error) return apiError(error, "POST /api/favorites", 400);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playerId = await getPlayerIdFromAuth(supabase, user.id);
  if (!playerId) return NextResponse.json({ error: "Player not found" }, { status: 404 });

  const result = await validateBody(request, favoriteSchema);
  if (isValidationError(result)) return result;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("player_id", playerId)
    .eq("favorite_id", result.favorite_id);
  if (error) return apiError(error, "DELETE /api/favorites", 400);
  return NextResponse.json({ ok: true });
}
