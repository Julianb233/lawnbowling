import { NextResponse } from "next/server";
import {
  isPrintifyConfigured,
  syncProducts,
  PrintifyApiError,
} from "@/lib/printify";

/**
 * GET /api/shop/printify/sync
 *
 * Fetches all visible products from Printify, normalizes them with
 * 40% markup pricing, and returns them in our Product shape.
 *
 * When PRINTIFY_API_KEY is not set, returns 503 with an empty array
 * so the frontend can gracefully fall back to mock products.
 */
export async function GET() {
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      { error: "Printify not configured", products: [] },
      { status: 503 }
    );
  }

  try {
    const products = await syncProducts();
    return NextResponse.json({ products });
  } catch (err) {
    const message =
      err instanceof PrintifyApiError
        ? `Printify API ${err.status}: ${err.body}`
        : "Failed to sync products";

    console.error("[Printify Sync]", message);
    return NextResponse.json(
      { error: message, products: [] },
      { status: 502 }
    );
  }
}
