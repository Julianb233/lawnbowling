import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWaiverByPlayerId } from "@/lib/db/waivers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { playerId } = await params;
  const waiver = await getWaiverByPlayerId(playerId);

  return NextResponse.json({
    signed: !!waiver,
    waiver: waiver
      ? {
          signed_at: waiver.signed_at,
          ip_address: waiver.ip_address,
        }
      : null,
  });
}
