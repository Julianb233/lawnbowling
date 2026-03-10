import { NextResponse } from "next/server";
import { getVenue } from "@/lib/db/venues";

export async function GET() {
  try {
    const venue = await getVenue();
    if (!venue) {
      return NextResponse.json({ error: "No venue found" }, { status: 404 });
    }
    return NextResponse.json(venue);
  } catch (error) {
    console.error("Default venue fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch venue" },
      { status: 500 }
    );
  }
}
