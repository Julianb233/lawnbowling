import { NextResponse } from "next/server";
import { expireStaleRequests } from "@/lib/db/partner-requests";

export async function POST() {
  try {
    const expired = await expireStaleRequests();

    return NextResponse.json({
      expired: expired.length,
      ids: expired.map((r) => r.id),
    });
  } catch (error) {
    console.error("Expire requests error:", error);
    return NextResponse.json(
      { error: "Failed to expire stale requests" },
      { status: 500 }
    );
  }
}
