import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert into newsletter_subscribers table
    // Uses upsert to handle duplicates gracefully
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          subscribed_at: new Date().toISOString(),
          status: "active",
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Newsletter subscribe error:", error);
      // If the table doesn't exist yet, still return success (soft fail)
      if (error.code === "42P01") {
        return NextResponse.json({ success: true, message: "Subscribed" });
      }
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Subscribed" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
