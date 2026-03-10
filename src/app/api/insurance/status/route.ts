import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePlayer } from "@/lib/db/players";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["none", "active", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const player = await updatePlayer(user.id, { insurance_status: status });
    return NextResponse.json({ insurance_status: player.insurance_status });
  } catch (error) {
    console.error("Insurance status update error:", error);
    return NextResponse.json({ error: "Failed to update insurance status" }, { status: 500 });
  }
}
