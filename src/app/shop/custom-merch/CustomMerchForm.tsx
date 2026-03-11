"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  Upload,
  Palette,
  Users,
  Shirt,
  Mail,
} from "lucide-react";

const PRODUCT_OPTIONS = [
  { id: "polo", label: "Embroidered Polos", icon: "polo" },
  { id: "tshirt", label: "T-Shirts", icon: "tshirt" },
  { id: "hat", label: "Hats & Visors", icon: "hat" },
  { id: "jacket", label: "Jackets", icon: "jacket" },
  { id: "towel", label: "Bowling Towels", icon: "towel" },
  { id: "tote", label: "Tote Bags", icon: "tote" },
  { id: "mug", label: "Club Mugs", icon: "mug" },
  { id: "other", label: "Other / Custom", icon: "other" },
];

const QUANTITY_RANGES = [
  "1-10 items",
  "11-25 items",
  "26-50 items",
  "51-100 items",
  "100+ items",
];

export function CustomMerchForm() {
  const [clubName, setClubName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [clubColors, setClubColors] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to an API endpoint
    // For now, we capture the request
    console.log("[custom-merch] Request submitted:", {
      clubName,
      contactName,
      email,
      phone,
      selectedProducts,
      quantity,
      clubColors,
      notes,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-[#1B5E20]" />
        <h1 className="text-2xl font-bold text-gray-900">
          Request Received!
        </h1>
        <p className="mt-2 text-gray-600">
          Thank you for your custom merchandise request. We will review your
          details and get back to you at <strong>{email}</strong> within 2-3
          business days with a quote and design mockups.
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

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#1B5E20]/10">
          <Shirt className="size-8 text-[#1B5E20]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Custom Club Merchandise
        </h1>
        <p className="mt-2 text-gray-600">
          Get your club logo on premium merchandise. Embroidered polos,
          printed tees, branded hats, and more. No minimum order quantity.
        </p>
      </div>

      {/* Features */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { icon: Upload, label: "Your Logo", desc: "Upload your club logo" },
          { icon: Palette, label: "Your Colors", desc: "Match your club colors" },
          { icon: Users, label: "Any Quantity", desc: "No minimum order" },
        ].map((feat) => (
          <div
            key={feat.label}
            className="flex flex-col items-center rounded-xl border bg-white dark:bg-[#1a3d28] p-4 text-center"
          >
            <feat.icon className="mb-2 size-6 text-[#1B5E20]" />
            <p className="text-sm font-semibold text-gray-900">{feat.label}</p>
            <p className="text-xs text-gray-500">{feat.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-white dark:bg-[#1a3d28] p-6 shadow-sm"
      >
        {/* Club Info */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Club Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="e.g., Santa Monica Lawn Bowling Club"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Club Colors
              </label>
              <input
                type="text"
                value={clubColors}
                onChange={(e) => setClubColors(e.target.value)}
                placeholder="e.g., Green and White"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Contact Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
              />
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            What products are you interested in?
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRODUCT_OPTIONS.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  selectedProducts.includes(product.id)
                    ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {product.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Estimated Quantity
          </h2>
          <div className="flex flex-wrap gap-2">
            {QUANTITY_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setQuantity(range)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  quantity === range
                    ? "border-[#1B5E20] bg-[#1B5E20]/10 text-[#1B5E20]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tell us about your design ideas, special requirements, or any questions..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
          />
        </div>

        {/* Logo upload note */}
        <div className="rounded-lg border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-4">
          <div className="flex items-start gap-3">
            <Upload className="mt-0.5 size-5 text-[#1B5E20]" />
            <div>
              <p className="text-sm font-medium text-[#1B5E20]">
                Club Logo
              </p>
              <p className="text-sm text-gray-600">
                After submitting this form, we will reach out via email to
                collect your club logo and finalize the design. Please have a
                high-resolution version ready (PNG or SVG preferred).
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5E20] py-3 text-base font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98]"
        >
          <Mail className="size-5" />
          Submit Request
        </button>
      </form>
    </div>
  );
}
