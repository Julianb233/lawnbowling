import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Sanitize a Supabase/database error for client consumption.
 * Logs the full error server-side, returns a generic message to the client.
 */
export function apiError(
  error: unknown,
  route: string,
  status: number = 500
): NextResponse {
  const message = error instanceof Error ? error.message : String(error);

  logger.error(`API error in ${route}`, {
    error: error instanceof Error ? error : new Error(message),
    route,
    status,
  });

  const clientMessage =
    status === 401
      ? "Unauthorized"
      : status === 403
        ? "Forbidden"
        : status === 404
          ? "Not found"
          : "Operation failed";

  return NextResponse.json({ error: clientMessage }, { status });
}
