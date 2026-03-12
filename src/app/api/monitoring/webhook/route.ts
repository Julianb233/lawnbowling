import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Webhook secret for verifying incoming requests
const WEBHOOK_SECRET = process.env.MONITORING_WEBHOOK_SECRET;

type AlertPayload = {
  alert_type: string;
  severity?: "info" | "warning" | "critical";
  message: string;
  metadata?: Record<string, unknown>;
};

/**
 * POST /api/monitoring/webhook
 *
 * Receives alert notifications from Supabase webhooks or external monitoring.
 * Stores them in the monitoring_alerts table for admin review.
 *
 * Expected payload:
 * {
 *   alert_type: "auth_error_spike" | "connection_pool_saturation" | "storage_quota_warning" | string,
 *   severity: "info" | "warning" | "critical",
 *   message: "Human-readable alert description",
 *   metadata: { ...any additional context }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get("authorization");
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as AlertPayload;

    if (!body.alert_type || !body.message) {
      return NextResponse.json(
        { error: "alert_type and message are required" },
        { status: 400 }
      );
    }

    const severity = body.severity || "warning";
    if (!["info", "warning", "critical"].includes(severity)) {
      return NextResponse.json(
        { error: "severity must be info, warning, or critical" },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS for inserting alerts
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("monitoring_alerts").insert({
      alert_type: body.alert_type,
      severity,
      message: body.message,
      metadata: body.metadata || {},
    });

    if (error) {
      console.error("Failed to store alert:", error);
      return NextResponse.json(
        { error: "Failed to store alert" },
        { status: 500 }
      );
    }

    // Log to console for structured logging / Sentry
    console.warn(
      `[ALERT] ${severity.toUpperCase()}: ${body.alert_type} — ${body.message}`
    );

    return NextResponse.json({ success: true, alert_type: body.alert_type });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/webhook
 * Health check endpoint — confirms the webhook is reachable.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "monitoring-webhook",
    accepts: ["auth_error_spike", "connection_pool_saturation", "storage_quota_warning"],
  });
}
