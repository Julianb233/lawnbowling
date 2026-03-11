import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/db/players";
import { getContactPreferences, updateContactPreferences } from "@/lib/db/contact-preferences";

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

    const prefs = await getContactPreferences(player.id);
    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Get contact preferences error:", error);
    return NextResponse.json({ error: "Failed to get contact preferences" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { show_email, show_phone, preferred_contact, email, phone, allow_messages_from } = body;

    const updates: Record<string, unknown> = {};
    if (show_email !== undefined) updates.show_email = show_email;
    if (show_phone !== undefined) updates.show_phone = show_phone;
    if (preferred_contact !== undefined) updates.preferred_contact = preferred_contact;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (allow_messages_from !== undefined) updates.allow_messages_from = allow_messages_from;

    const prefs = await updateContactPreferences(player.id, updates);
    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Update contact preferences error:", error);
    return NextResponse.json({ error: "Failed to update contact preferences" }, { status: 500 });
  }
}
