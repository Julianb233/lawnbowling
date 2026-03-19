import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = Date.now();

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          version: "0.1.0",
          timestamp,
          database: "unreachable",
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ok",
      version: "0.1.0",
      timestamp,
      database: "connected",
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        version: "0.1.0",
        timestamp,
        database: "unreachable",
      },
      { status: 503 }
    );
  }
}
