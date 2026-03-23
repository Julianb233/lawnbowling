import { NextResponse } from "next/server";

const GENERIC_MESSAGES: Record<number, string> = {
  400: "Operation failed",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
  500: "Internal server error",
};

/**
 * Returns a safe API error response — logs full details server-side,
 * returns only a generic message to the client.
 */
export function apiError(
  error: unknown,
  context: string,
  status: number = 500
): NextResponse {
  console.error(`[API Error] ${context}:`, error);
  const message = GENERIC_MESSAGES[status] ?? "Operation failed";
  return NextResponse.json({ error: message }, { status });
}
