"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useCart } from "@/lib/shop/cart";

export function CheckoutPlaceholder() {
  const { items, totalPrice, clearCart } = useCart();
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Checkout failed. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    clearCart();
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-[#1B5E20]" />
        <h1 className="text-2xl font-bold text-gray-900">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-gray-600">
          Thank you for your purchase. Your items will be printed and shipped
          shortly. You&apos;ll receive an email with tracking information.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
        >
          <ChevronLeft className="size-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  // Cancelled state
  if (cancelled) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <XCircle className="mx-auto mb-4 size-16 text-red-400" />
        <h1 className="text-2xl font-bold text-gray-900">
          Checkout Cancelled
        </h1>
        <p className="mt-2 text-gray-600">
          Your order was not completed. Your cart items are still saved.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
        >
          <ChevronLeft className="size-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 size-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Cart is Empty</h1>
        <p className="mt-2 text-gray-600">
          Add some items before heading to checkout.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
        >
          <ChevronLeft className="size-4" /> Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {/* Order summary */}
        <div className="my-6 rounded-lg border bg-gray-50 p-4 text-sm">
          <p className="mb-2 font-semibold text-gray-900">Order Summary</p>
          <ul className="space-y-1">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId}`}
                className="flex justify-between text-gray-600"
              >
                <span>
                  {item.productName}{" "}
                  <span className="text-gray-400">
                    ({item.variantLabel})
                  </span>{" "}
                  x{item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t pt-2 font-semibold text-gray-900">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Redirecting to payment...
            </>
          ) : (
            <>
              <CreditCard className="size-5" />
              Pay with Stripe
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          Secure payment powered by Stripe. Your card details never touch our
          servers.
        </p>
      </div>
    </div>
  );
}
