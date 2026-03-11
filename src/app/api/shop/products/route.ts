import { NextResponse } from "next/server";
import { getProductCatalog } from "@/lib/shop/sync";

/**
 * GET /api/shop/products
 *
 * Returns the product catalog. Uses Printify API if configured,
 * otherwise falls back to mock product data.
 */
export async function GET() {
  try {
    const products = await getProductCatalog();
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("[shop/products] Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}
