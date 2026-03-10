import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWaiver } from "@/lib/db/waivers";

const DEFAULT_WAIVER_TEXT = `LIABILITY WAIVER AND RELEASE OF CLAIMS

By signing this waiver, I acknowledge and agree to the following:

1. ASSUMPTION OF RISK: I understand that participating in recreational sports activities involves inherent risks of physical injury. I voluntarily assume all risks associated with my participation.

2. RELEASE OF LIABILITY: I hereby release, discharge, and hold harmless the venue, its owners, operators, employees, and agents from any and all claims, demands, or causes of action arising from my participation in activities at this venue.

3. MEDICAL ACKNOWLEDGMENT: I confirm that I am physically fit to participate in recreational sports activities.

4. RULES AND CONDUCT: I agree to follow all posted rules, guidelines, and instructions provided by venue staff.

5. PERSONAL PROPERTY: I understand that the venue is not responsible for lost, stolen, or damaged personal property.

6. PHOTO/VIDEO CONSENT: I consent to being photographed or recorded during activities for venue promotional purposes.`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { player_id } = body;

    if (!player_id) {
      return NextResponse.json({ error: "player_id is required" }, { status: 400 });
    }

    // Verify player belongs to user
    const { data: player } = await supabase
      .from("players")
      .select("id, user_id")
      .eq("id", player_id)
      .single();

    if (!player || player.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const waiver = await createWaiver({
      player_id,
      waiver_text: DEFAULT_WAIVER_TEXT,
      accepted: true,
      ip_address: ip,
      user_agent: userAgent,
      signed_at: new Date().toISOString(),
    });

    return NextResponse.json(waiver, { status: 201 });
  } catch (error) {
    console.error("Sign waiver error:", error);
    return NextResponse.json({ error: "Failed to sign waiver" }, { status: 500 });
  }
}
