"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Truck, RefreshCw, Shield } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/shop/products";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export function ProductDetail({ product }: { product: Product }) {
  // Derive available sizes and colors from variants
  const sizes = useMemo(() => {
    const s = new Set<string>();
    product.variants.forEach((v) => v.size && s.add(v.size));
    return Array.from(s);
  }, [product]);

  const colors = useMemo(() => {
    const map = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.color && v.colorHex) map.set(v.color, v.colorHex);
    });
    return Array.from(map.entries()); // [label, hex][]
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0]?.[0] ?? null
  );

  // Resolve the currently selected variant
  const selectedVariant: ProductVariant | null = useMemo(() => {
    return (
      product.variants.find((v) => {
        if (sizes.length > 0 && v.size !== selectedSize) return false;
        if (colors.length > 0 && v.color !== selectedColor) return false;
        return true;
      }) ?? product.variants[0] ?? null
    );
  }, [product, selectedSize, selectedColor, sizes, colors]);

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#1B5E20]">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-gray-600">{product.description}</p>
          </div>

          <p className="text-3xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>

          {/* Color selector */}
          {colors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Color:{" "}
                <span className="font-normal text-gray-500">
                  {selectedColor}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map(([label, hex]) => (
                  <button
                    key={label}
                    onClick={() => setSelectedColor(label)}
                    className={`size-10 rounded-full border-2 transition ${
                      selectedColor === label
                        ? "border-[#1B5E20] ring-2 ring-[#1B5E20]/30"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: hex }}
                    title={label}
                    aria-label={`Select color ${label}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-[#1B5E20] bg-[#1B5E20] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <AddToCartButton product={product} variant={selectedVariant} />

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-4 rounded-lg border bg-gray-50 p-4 text-center text-xs text-gray-500">
            <div className="flex flex-col items-center gap-1">
              <Truck className="size-5 text-[#1B5E20]" />
              <span>Free shipping over $75</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="size-5 text-[#1B5E20]" />
              <span>30-day returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="size-5 text-[#1B5E20]" />
              <span>Quality guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
