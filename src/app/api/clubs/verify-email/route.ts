import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";

// In-memory store for verification codes (short-lived, per-process).
// For production scale, move to Redis or Supabase table.
const codes = new Map<string, { code: string; expires: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/clubs/verify-email
 * Body: { email } — sends a 6-digit verification code
 * Body: { email, code } — verifies the code
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Valid email is required" },
      { status: 400 },
    );
  }

  // Verify mode: check code
  if (body.code) {
    const entry = codes.get(email);
    if (!entry || Date.now() > entry.expires) {
      return NextResponse.json(
        { error: "Code expired. Request a new one." },
        { status: 400 },
      );
    }
    if (entry.code !== body.code.trim()) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }
    codes.delete(email);
    return NextResponse.json({ verified: true });
  }

  // Send mode: generate and email code
  const code = generateCode();
  codes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 }); // 10 min

  await sendEmail({
    to: email,
    subject: "Your Lawnbowling verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0A2E12; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #3D5A3E; font-size: 14px;">
          Use this code to verify your club contact email on Lawnbowling:
        </p>
        <div style="background: #f0fdf0; border: 2px solid #1B5E20; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1B5E20;">${code}</span>
        </div>
        <p style="color: #3D5A3E; font-size: 12px;">This code expires in 10 minutes.</p>
      </div>
    `,
  });

  return NextResponse.json({ sent: true });
}
