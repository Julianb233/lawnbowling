import { NextRequest, NextResponse } from "next/server";

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const PRINTIFY_BASE = "https://api.printify.com/v1";

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  zip: string;
  country: string;
}

export async function POST(req: NextRequest) {
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    return NextResponse.json(
      { error: "Printify not configured" },
      { status: 503 }
    );
  }

  const { items, shipping, stripeSessionId } = (await req.json()) as {
    items: OrderItem[];
    shipping: ShippingAddress;
    stripeSessionId: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  const printifyOrder = {
    external_id: stripeSessionId,
    line_items: items.map((item) => ({
      product_id: item.productId,
      variant_id: Number(item.variantId),
      quantity: item.quantity,
    })),
    shipping_method: 1,
    address_to: {
      first_name: shipping.first_name,
      last_name: shipping.last_name,
      email: shipping.email,
      address1: shipping.address1,
      address2: shipping.address2 || "",
      city: shipping.city,
      region: shipping.region,
      zip: shipping.zip,
      country: shipping.country,
    },
    send_shipping_notification: true,
  };

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(printifyOrder),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json(
      { error: "Failed to create Printify order", detail: error },
      { status: 502 }
    );
  }

  const order = await res.json();
  return NextResponse.json({ orderId: order.id, status: order.status });
}
