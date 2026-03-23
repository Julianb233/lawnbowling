import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, Truck, CheckCircle, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "My Orders — Lawn Bowls Shop",
  description: "View your order history and track shipments.",
};

interface ShopOrder {
  id: string;
  status: string;
  items: { name?: string; quantity?: number; product_id?: string }[];
  total_amount: number;
  currency: string;
  tracking_number: string | null;
  tracking_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Package; color: string; bg: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  paid: {
    label: "Paid",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  fulfilled: {
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  cancelled: {
    label: "Cancelled",
    icon: Package,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/shop/orders");
  }

  // Get player_id for this user
  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let orders: ShopOrder[] = [];

  if (player) {
    const { data } = await supabase
      .from("shop_orders")
      .select(
        "id, status, items, total_amount, currency, tracking_number, tracking_url, created_at, updated_at"
      )
      .eq("player_id", player.id)
      .order("created_at", { ascending: false });

    orders = (data as ShopOrder[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-[#0A2E12]">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-12 text-center">
          <Package className="mx-auto mb-4 size-12 text-[#3D5A3E]/40" />
          <h2 className="mb-2 text-lg font-semibold text-[#0A2E12]">
            No orders yet
          </h2>
          <p className="mb-6 text-sm text-[#3D5A3E]/70">
            Browse our shop and find some great lawn bowling gear!
          </p>
          <a
            href="/shop"
            className="inline-block rounded-lg bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0A2E12]"
          >
            Browse Shop
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;
            const formattedDate = new Date(order.created_at).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" }
            );
            const total = (order.total_amount / 100).toFixed(2);
            const itemCount = Array.isArray(order.items)
              ? order.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
              : 0;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        <Icon className="size-3.5" />
                        {config.label}
                      </span>
                      <span className="text-xs text-[#3D5A3E]/60">
                        {formattedDate}
                      </span>
                    </div>

                    <p className="mb-1 text-sm font-medium text-[#0A2E12]">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#3D5A3E]/70">
                      {itemCount} {itemCount === 1 ? "item" : "items"} &middot;{" "}
                      ${total} {order.currency.toUpperCase()}
                    </p>

                    {order.tracking_number && (
                      <div className="mt-3 flex items-center gap-2">
                        <Truck className="size-4 text-[#3D5A3E]/60" />
                        {order.tracking_url ? (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#1B5E20] hover:underline"
                          >
                            Track: {order.tracking_number}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-[#3D5A3E]/70">
                            Tracking: {order.tracking_number}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
