/**
 * Shopping cart utilities — localStorage-backed, framework-agnostic.
 *
 * Usage in React client components:
 *   const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCart();
 */

"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Product, ProductVariant } from "./products";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  price: number;
  image: string;
  quantity: number;
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lawnbowl-shop-cart";

// ---------------------------------------------------------------------------
// In-memory mirror + broadcast
// ---------------------------------------------------------------------------

let _items: CartItem[] = [];
const _listeners = new Set<() => void>();

function emit() {
  for (const fn of _listeners) fn();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(_items));
  } catch {
    // quota exceeded or SSR — silently ignore
  }
  emit();
}

function hydrate() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) _items = JSON.parse(raw) as CartItem[];
  } catch {
    _items = [];
  }
  emit();
}

// Listen for changes in other tabs
if (typeof window !== "undefined") {
  hydrate();
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) hydrate();
  });
}

// ---------------------------------------------------------------------------
// Mutators
// ---------------------------------------------------------------------------

function addItem(product: Product, variant: ProductVariant, qty = 1) {
  const existing = _items.find(
    (i) => i.productId === product.id && i.variantId === variant.id
  );
  if (existing) {
    existing.quantity += qty;
  } else {
    _items = [
      ..._items,
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantId: variant.id,
        variantLabel: variant.label,
        price: product.price,
        image: product.image,
        quantity: qty,
      },
    ];
  }
  persist();
}

function removeItem(productId: string, variantId: string) {
  _items = _items.filter(
    (i) => !(i.productId === productId && i.variantId === variantId)
  );
  persist();
}

function updateQuantity(productId: string, variantId: string, qty: number) {
  if (qty < 1) return removeItem(productId, variantId);
  const item = _items.find(
    (i) => i.productId === productId && i.variantId === variantId
  );
  if (item) {
    item.quantity = qty;
    persist();
  }
}

function clearCart() {
  _items = [];
  persist();
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

function subscribe(cb: () => void) {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

function getSnapshot(): CartItem[] {
  return _items;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Ensure hydration on mount
  useEffect(() => {
    hydrate();
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return {
    items,
    addItem: useCallback(addItem, []),
    removeItem: useCallback(removeItem, []),
    updateQuantity: useCallback(updateQuantity, []),
    clearCart: useCallback(clearCart, []),
    totalItems,
    totalPrice,
  };
}
