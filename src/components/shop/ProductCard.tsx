"use client";

import Link from "next/link";
import type { Product } from "@/lib/shop/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#0A2E12]/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#1B5E20] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white"
              >
                {tag.replace("-", " ")}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#1B5E20]">
          {product.category.replace("-", " ")}
        </p>
        <h3 className="font-semibold leading-snug text-[#0A2E12] group-hover:text-[#1B5E20]">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-lg font-bold text-[#0A2E12]">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
