"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/shop/cart";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const { items, totalItems, totalPrice, removeItem, updateQuantity } =
    useCart();

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#1B5E20] px-5 py-3 text-white shadow-lg transition hover:bg-[#0D3B12] active:scale-95"
        aria-label="Open shopping cart"
      >
        <ShoppingCart className="size-5" />
        {totalItems > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1B5E20]">
            {totalItems}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">
            Shopping Cart ({totalItems})
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <ShoppingCart className="mb-4 size-12" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="mt-1 text-sm">
                Browse our shop and add some items!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 rounded-lg border p-3"
                >
                  {/* Thumbnail */}
                  <div className="size-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="font-medium leading-tight">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.variantLabel}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="rounded p-1 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="rounded p-1 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <Link
              href="/shop/checkout"
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg bg-[#1B5E20] py-3 text-center font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98]"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
