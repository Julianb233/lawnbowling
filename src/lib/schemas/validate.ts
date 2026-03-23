import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validate a request body against a Zod schema.
 * Returns the parsed data on success, or a NextResponse 400 on failure.
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<T | NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.issues.map(
      (e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`
    );
    return NextResponse.json(
      { error: "Validation failed", details: messages },
      { status: 400 }
    );
  }

  return result.data;
}

/**
 * Type guard: check if validateBody returned an error response.
 */
export function isValidationError(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}
