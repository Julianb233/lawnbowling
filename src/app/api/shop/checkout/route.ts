import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";

interface CheckoutItem {
  productId: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  price: number;
  image: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const { items, email } = (await req.json()) as {
    items: CheckoutItem[];
    email?: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const line_items = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.productName,
        description: item.variantLabel,
        images: item.image.startsWith("http") ? [item.image] : [],
        metadata: {
          product_id: item.productId,
          variant_id: item.variantId,
        },
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    ...(email ? { customer_email: email } : {}),
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "NZ"],
    },
    success_url: `${req.nextUrl.origin}/shop/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.nextUrl.origin}/shop/checkout?cancelled=true`,
    metadata: {
      source: "shop",
      item_count: String(items.length),
    },
  });

  return NextResponse.json({ url: session.url });
}
