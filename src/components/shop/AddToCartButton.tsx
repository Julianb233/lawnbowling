"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/shop/cart";
import type { Product, ProductVariant } from "@/lib/shop/products";

interface Props {
  product: Product;
  variant: ProductVariant | null;
}

export function AddToCartButton({ product, variant }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!variant) return;
    addItem(product, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!variant || !variant.inStock}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
        added
          ? "bg-green-600 text-white"
          : "bg-[#1B5E20] text-white hover:bg-[#0D3B12]"
      }`}
    >
      {added ? (
        <>
          <Check className="size-5" /> Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="size-5" /> Add to Cart
        </>
      )}
    </button>
  );
}
