import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import {
  getPlayerPhotos,
  addPlayerPhoto,
  deletePlayerPhoto,
  updatePhotoCaption,
  uploadGalleryPhoto,
} from "@/lib/db/gallery";

const MAX_PHOTOS = 12;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const photos = await getPlayerPhotos(player.id);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json({ error: "Failed to get gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = await getPlayerByUserId(user.id);
    if (!player) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existing = await getPlayerPhotos(player.id);
    if (existing.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
    }

    const url = await uploadGalleryPhoto(player.id, file);
    const photo = await addPlayerPhoto(player.id, url, caption ?? undefined);

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Upload gallery photo error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { photoId, caption } = body as { photoId: string; caption: string };

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const photo = await updatePhotoCaption(photoId, caption);
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Update photo error:", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    await deletePlayerPhoto(photoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
