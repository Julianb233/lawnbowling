import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// POST /api/onboarding — full onboarding: create venue, add courts, invite staff
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a player profile
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (existingPlayer?.role === "admin") {
      return NextResponse.json(
        { error: "You already have a venue. Use the admin panel to manage it." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { venue, courts, invitations } = body as {
      venue: {
        name: string;
        address?: string;
        timezone?: string;
        sports?: string[];
        contact_email?: string;
        contact_phone?: string;
        website_url?: string;
        tagline?: string;
      };
      courts?: { name: string; sport: string }[];
      invitations?: { email: string; role?: "admin" | "staff" }[];
    };

    if (!venue?.name?.trim()) {
      return NextResponse.json(
        { error: "Venue name is required" },
        { status: 400 }
      );
    }

    // 1. Create the venue
    const { data: newVenue, error: venueError } = await supabase
      .from("venues")
      .insert({
        name: venue.name.trim(),
        address: venue.address?.trim() || null,
        timezone: venue.timezone || "America/Los_Angeles",
        sports: venue.sports || [],
        contact_email: venue.contact_email?.trim() || null,
        contact_phone: venue.contact_phone?.trim() || null,
        website_url: venue.website_url?.trim() || null,
        tagline: venue.tagline?.trim() || null,
      })
      .select()
      .single();

    if (venueError) {
      logger.error("Create venue error", { route: "onboarding", error: venueError });
      return NextResponse.json(
        { error: "Failed to create venue" },
        { status: 500 }
      );
    }

    // 2. Promote user to admin and associate with venue
    if (existingPlayer) {
      const { error: updateError } = await supabase
        .from("players")
        .update({ role: "admin", venue_id: newVenue.id })
        .eq("id", existingPlayer.id);

      if (updateError) {
        logger.error("Update player role error", { route: "onboarding", error: updateError });
      }
    } else {
      // Create player profile as admin
      const { error: insertError } = await supabase.from("players").insert({
        user_id: user.id,
        display_name:
          user.user_metadata?.name || user.email?.split("@")[0] || "Operator",
        role: "admin",
        venue_id: newVenue.id,
      });

      if (insertError) {
        logger.error("Create player error", { route: "onboarding", error: insertError });
      }
    }

    // 3. Create courts if provided
    if (courts && courts.length > 0) {
      const courtRows = courts
        .filter((c) => c.name?.trim() && c.sport?.trim())
        .map((c) => ({
          venue_id: newVenue.id,
          name: c.name.trim(),
          sport: c.sport.trim(),
          is_available: true,
        }));

      if (courtRows.length > 0) {
        const { error: courtsError } = await supabase
          .from("courts")
          .insert(courtRows);

        if (courtsError) {
          logger.error("Create courts error", { route: "onboarding", error: courtsError });
        }
      }
    }

    // 4. Get the player id for invitations
    const { data: player } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    // 5. Create staff invitations if provided
    if (invitations && invitations.length > 0 && player) {
      const inviteRows = invitations
        .filter((inv) => inv.email?.trim())
        .map((inv) => ({
          venue_id: newVenue.id,
          invited_by: player.id,
          email: inv.email.trim().toLowerCase(),
          role: inv.role || "staff",
        }));

      if (inviteRows.length > 0) {
        const { error: invError } = await supabase
          .from("staff_invitations")
          .insert(inviteRows);

        if (invError) {
          logger.error("Create invitations error", { route: "onboarding", error: invError });
        }
      }
    }

    return NextResponse.json(
      { venue: newVenue, message: "Venue created successfully" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Onboarding error", { route: "onboarding", error });
    return NextResponse.json(
      { error: "Onboarding failed" },
      { status: 500 }
    );
  }
}

// GET /api/onboarding — check onboarding status
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: player } = await supabase
      .from("players")
      .select("id, role, venue_id")
      .eq("user_id", user.id)
      .single();

    if (player?.role === "admin" && player?.venue_id) {
      return NextResponse.json({
        completed: true,
        venue_id: player.venue_id,
      });
    }

    return NextResponse.json({ completed: false });
  } catch (error) {
    logger.error("Onboarding status error", { route: "onboarding", error });
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
