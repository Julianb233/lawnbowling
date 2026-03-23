import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-error-handler";

/**
 * GET /api/clubs/contacts
 * List contacts for a club.
 *
 * Query params:
 *   club_id - the club UUID (required)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("club_id");

  if (!clubId) {
    return NextResponse.json(
      { error: "club_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("club_contacts")
    .select("*")
    .eq("club_id", clubId)
    .order("name", { ascending: true });

  if (error) {
    return apiError(error, "GET /api/clubs/contacts", 500);
  }

  return NextResponse.json({ contacts: data ?? [] });
}

/**
 * POST /api/clubs/contacts
 * Create a new contact for a club (admin or club manager).
 *
 * Body: { club_id, name, role, email?, phone?, linkedin_url?, instagram_url?, facebook_url?, twitter_url? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (!body.club_id || !body.name || !body.role) {
    return NextResponse.json(
      { error: "club_id, name, and role are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("club_contacts")
    .insert(body)
    .select()
    .single();

  if (error) {
    return apiError(error, "POST /api/clubs/contacts", 400);
  }

  return NextResponse.json({ contact: data }, { status: 201 });
}

/**
 * PATCH /api/clubs/contacts
 * Update a contact by id (admin or club manager).
 *
 * Body: { id, ...fields }
 */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Contact id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("club_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return apiError(error, "PATCH /api/clubs/contacts", 400);
  }

  return NextResponse.json({ contact: data });
}

/**
 * DELETE /api/clubs/contacts
 * Delete a contact by id (admin or club manager).
 *
 * Body: { id }
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Contact id is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("club_contacts")
    .delete()
    .eq("id", id);

  if (error) {
    return apiError(error, "DELETE /api/clubs/contacts", 400);
  }

  return NextResponse.json({ success: true });
}
