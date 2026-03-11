import { NextResponse } from "next/server";

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_BASE = "https://api.printify.com/v1";

export async function GET() {
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    return NextResponse.json(
      { error: "Printify not configured", products: [] },
      { status: 503 }
    );
  }

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json`,
    {
      headers: { Authorization: `Bearer ${PRINTIFY_API_KEY}` },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Printify", products: [] },
      { status: 502 }
    );
  }

  const data = await res.json();

  // Transform Printify products to our Product shape
  const products = (data.data ?? []).map((p: Record<string, unknown>) => {
    const variants = (
      (p.variants as Array<Record<string, unknown>>) ?? []
    )
      .filter((v) => v.is_enabled)
      .map((v) => ({
        id: String(v.id),
        label: v.title as string,
        inStock: (v.is_available as boolean) ?? true,
      }));

    const images = (p.images as Array<Record<string, unknown>>) ?? [];
    const firstImage =
      images.length > 0 ? (images[0].src as string) : "";

    // 40% markup on Printify base cost (cost is in cents)
    const baseCostCents =
      variants.length > 0
        ? Math.min(
            ...((p.variants as Array<Record<string, unknown>>) ?? [])
              .filter((v) => v.is_enabled)
              .map((v) => (v.cost as number) ?? 0)
          )
        : 0;
    const baseCost = baseCostCents / 100;
    const price = Math.ceil(baseCost * 1.4) - 0.01;

    return {
      id: String(p.id),
      slug: String(p.id),
      name: p.title as string,
      description: (p.description as string) ?? "",
      category: "t-shirts",
      baseCost,
      price,
      image: firstImage,
      variants,
      tags: (p.tags as string[]) ?? [],
    };
  });

  return NextResponse.json({ products });
}
