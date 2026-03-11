import { NextResponse } from "next/server";
import { syncProducts } from "@/lib/shop/sync";
import { isPrintifyConfigured } from "@/lib/shop/printify";

/**
 * POST /api/shop/sync
 *
 * Triggers a product sync from Printify API.
 * Admin-only endpoint (should be protected by auth middleware in production).
 *
 * Returns sync results including product count and any errors.
 */
export async function POST() {
  if (!isPrintifyConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Printify is not configured. Set PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const result = await syncProducts();
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("[shop/sync] Sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Product sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shop/sync
 *
 * Returns the current Printify configuration status (without revealing the token).
 */
export async function GET() {
  return NextResponse.json({
    configured: isPrintifyConfigured(),
    shopId: process.env.PRINTIFY_SHOP_ID
      ? `***${process.env.PRINTIFY_SHOP_ID.slice(-4)}`
      : null,
  });
}
