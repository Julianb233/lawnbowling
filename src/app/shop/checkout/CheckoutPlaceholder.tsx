"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  Truck,
  Shield,
} from "lucide-react";
import { useCart } from "@/lib/shop/cart";

const ESTIMATED_SHIPPING = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;

export function CheckoutPlaceholder() {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL params for success/cancel
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isSuccess = params?.get("success") === "true";
  const isCancelled = params?.get("cancelled") === "true";

  const shippingCost =
    totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : ESTIMATED_SHIPPING;
  const orderTotal = totalPrice + shippingCost;

  // Handle successful payment
  if (isSuccess) {
    // Clear cart after successful payment
    if (items.length > 0) {
      clearCart();
    }
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-[#1B5E20]" />
        <h1 className="text-2xl font-bold text-gray-900">
          Order Confirmed!
        </h1>
        <p className="mt-2 text-gray-600">
          Thank you for your order. Your items will be printed and shipped
          within 1-2 weeks. You will receive a confirmation email with tracking
          information.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0D3B12]"
          >
            <ShoppingBag className="size-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Handle cancelled payment
  if (isCancelled) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <XCircle className="mx-auto mb-4 size-16 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-900">
          Checkout Cancelled
        </h1>
        <p className="mt-2 text-gray-600">
          Your order was not completed. No charges were made. Your cart items
          are still saved.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
        >
          <ChevronLeft className="size-4" /> Return to Shop
        </Link>
      </div>
    );
  }

  // Handle empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 size-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">
          Your Cart is Empty
        </h1>
        <p className="mt-2 text-gray-600">
          Add some items to your cart before checking out.
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

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.productName,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variantLabel: item.variantLabel,
            productId: item.productId,
            variantId: item.variantId,
          })),
          shippingCost: shippingCost > 0 ? shippingCost : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Order Summary */}
        <div className="md:col-span-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <ul className="divide-y">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.variantLabel}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="md:col-span-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Payment
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-[#1B5E20] font-medium">FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {totalPrice < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-gray-400">
                  Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
                </p>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5E20] py-3 text-base font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <CreditCard className="size-5" />
                  Pay with Stripe
                </>
              )}
            </button>

            {/* Trust signals */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="size-4 text-[#1B5E20]" />
                <span>Secure payment via Stripe</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck className="size-4 text-[#1B5E20]" />
                <span>Ships in 1-2 weeks (printed on demand)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
