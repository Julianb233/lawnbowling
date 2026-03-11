import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToPlayer } from "@/lib/push";
import { sendEmail } from "@/lib/email/send";
import { getClubById } from "@/lib/clubs-data";
import type { BowlsPosition, SkillLevel } from "@/lib/types";

const VALID_SKILLS: SkillLevel[] = ["beginner", "intermediate", "advanced"];
const VALID_POSITIONS: BowlsPosition[] = ["skip", "vice", "second", "lead"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { club_id, requested_date, skill_level, preferred_positions, message } = body;

    // Validate required fields
    if (!club_id || !requested_date || !skill_level) {
      return NextResponse.json(
        { error: "club_id, requested_date, and skill_level are required" },
        { status: 400 }
      );
    }

    // Validate club exists
    const club = getClubById(club_id);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Validate skill level
    if (!VALID_SKILLS.includes(skill_level)) {
      return NextResponse.json({ error: "Invalid skill level" }, { status: 400 });
    }

    // Validate positions
    if (preferred_positions && Array.isArray(preferred_positions)) {
      for (const pos of preferred_positions) {
        if (!VALID_POSITIONS.includes(pos)) {
          return NextResponse.json({ error: `Invalid position: ${pos}` }, { status: 400 });
        }
      }
    }

    // Validate date is in the future
    const reqDate = new Date(requested_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reqDate < today) {
      return NextResponse.json({ error: "Requested date must be in the future" }, { status: 400 });
    }

    // Get the player record for the current user
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }

    // Check for duplicate pending request
    const { data: existing } = await supabase
      .from("visit_requests")
      .select("id")
      .eq("club_id", club_id)
      .eq("player_id", player.id)
      .eq("requested_date", requested_date)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending visit request for this date" },
        { status: 409 }
      );
    }

    // Insert the visit request
    const { data: visitRequest, error: insertError } = await supabase
      .from("visit_requests")
      .insert({
        club_id,
        player_id: player.id,
        requested_date,
        skill_level,
        preferred_positions: preferred_positions || [],
        message: message || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create visit request:", insertError);
      return NextResponse.json({ error: "Failed to create visit request" }, { status: 500 });
    }

    // Notify club admin(s) via push or email fallback
    if (club.venueId) {
      // Find admin players for this venue
      const { data: admins } = await supabase
        .from("players")
        .select("id")
        .eq("venue_id", club.venueId)
        .eq("role", "admin");

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await sendPushToPlayer(admin.id, "partner_request", {
            title: "New Visit Request",
            body: `A bowler wants to visit ${club.name} on ${requested_date}`,
            url: `/clubs/manage?tab=visits`,
          });
        }
      }
    } else if (club.email) {
      // Email fallback for unclaimed clubs
      await sendEmail({
        to: club.email,
        subject: `Visit Request for ${club.name}`,
        html: `
          <h2>New Visit Request</h2>
          <p>A bowler has requested to visit ${club.name} on ${requested_date}.</p>
          <p><strong>Skill Level:</strong> ${skill_level}</p>
          ${preferred_positions?.length ? `<p><strong>Preferred Positions:</strong> ${preferred_positions.join(", ")}</p>` : ""}
          ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
          <p>Log in to manage this request.</p>
        `,
      });
    }

    return NextResponse.json(visitRequest, { status: 201 });
  } catch (error) {
    console.error("Visit request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("club_id");

    // Get the player record
    const { data: player } = await supabase
      .from("players")
      .select("id, role, venue_id")
      .eq("user_id", user.id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    let query = supabase.from("visit_requests").select("*");

    if (clubId) {
      // Club-specific view (for admins)
      query = query.eq("club_id", clubId);
    } else {
      // My visit requests
      query = query.eq("player_id", player.id);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch visit requests:", error);
      return NextResponse.json({ error: "Failed to fetch visit requests" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Visit request GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
