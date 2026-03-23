import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import { listCourts, createCourt, updateCourt, deleteCourt } from "@/lib/db/courts";
import { validateBody, isValidationError } from "@/lib/schemas/validate";
import { courtCreateSchema, courtUpdateSchema, courtDeleteSchema } from "@/lib/schemas";

async function requireAdminUser() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, error: "Unauthorized", status: 401 as const };
  const admin = await isAdmin(user.id);
  if (!admin) return { user: null, error: "Forbidden", status: 403 as const };
  return { user, error: null, status: null };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status! });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venue_id") || undefined;
    const courts = await listCourts(venueId);
    return NextResponse.json({ courts });
  } catch (error) {
    console.error("List courts error:", error);
    return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status! });
    }

    const result = await validateBody(request, courtCreateSchema);
    if (isValidationError(result)) return result;

    const court = await createCourt(result);
    return NextResponse.json({ court }, { status: 201 });
  } catch (error) {
    console.error("Create court error:", error);
    return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status! });
    }

    const result = await validateBody(request, courtUpdateSchema);
    if (isValidationError(result)) return result;

    const { id, ...updates } = result;
    const court = await updateCourt(id, updates);
    return NextResponse.json({ court });
  } catch (error) {
    console.error("Update court error:", error);
    return NextResponse.json({ error: "Failed to update court" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminUser();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status! });
    }

    const result = await validateBody(request, courtDeleteSchema);
    if (isValidationError(result)) return result;

    await deleteCourt(result.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete court error:", error);
    return NextResponse.json({ error: "Failed to delete court" }, { status: 500 });
  }
}
