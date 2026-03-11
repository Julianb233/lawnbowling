"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, Mail, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/shop/cart";

export function CheckoutPlaceholder() {
  const { items, totalPrice } = useCart();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In the future this would hit an API endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-[#1B5E20]" />
        <h1 className="text-2xl font-bold text-gray-900">
          You&apos;re on the list!
        </h1>
        <p className="mt-2 text-gray-600">
          We&apos;ll email you at <strong>{email}</strong> as soon as checkout
          goes live.
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

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      <div className="rounded-xl border bg-white p-6 text-center shadow-sm sm:p-10">
        <Clock className="mx-auto mb-4 size-14 text-[#1B5E20]/60" />
        <h1 className="text-2xl font-bold text-gray-900">
          Checkout Coming Soon
        </h1>
        <p className="mt-2 text-gray-600">
          We&apos;re putting the finishing touches on our checkout experience.
          Leave your email and we&apos;ll notify you the moment it&apos;s
          ready.
        </p>

        {/* Order summary */}
        {items.length > 0 && (
          <div className="my-6 rounded-lg border bg-gray-50 p-4 text-left text-sm">
            <p className="mb-2 font-semibold text-gray-900">Your Cart</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex justify-between text-gray-600"
                >
                  <span>
                    {item.productName} x{item.quantity}
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
        )}

        {/* Email capture */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-[#1B5E20] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98]"
          >
            <Mail className="size-4" />
            Notify Me
          </button>
        </form>
      </div>
    </div>
  );
}
