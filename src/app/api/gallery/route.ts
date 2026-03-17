import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import {
  getApprovedSubmissions,
  submitGalleryPhoto,
} from "@/lib/db/gallery-submissions";

export const dynamic = "force-dynamic";

/** GET /api/gallery — Get approved community submissions */
export async function GET() {
  try {
    const submissions = await getApprovedSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch gallery submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}

/** POST /api/gallery — Submit a photo for review */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const player = await getPlayerByUserId(user.id);
  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, category, image_url } = body;

  if (!title?.trim() || !category || !image_url) {
    return NextResponse.json(
      { error: "title, category, and image_url are required" },
      { status: 400 }
    );
  }

  const validCategories = [
    "Action Shots",
    "Greens & Venues",
    "Equipment",
    "Vintage & Heritage",
    "Social & Community",
    "Art & Illustrations",
  ];

  if (!validCategories.includes(category)) {
    return NextResponse.json(
      { error: "Invalid category" },
      { status: 400 }
    );
  }

  try {
    const submission = await submitGalleryPhoto({
      player_id: player.id,
      title: title.trim(),
      description: description?.trim(),
      category,
      image_url,
    });
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Failed to submit gallery photo:", error);
    return NextResponse.json(
      { error: "Failed to submit photo" },
      { status: 500 }
    );
  }
}
