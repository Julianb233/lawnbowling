import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    throw new Error("Sentry test error — this verifies error tracking is active");
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      ok: true,
      message: "Test error sent to Sentry",
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured" : "missing",
    });
  }
}
