"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Shirt,
  Star,
  Coffee,
  ShoppingBag,
  Upload,
  CheckCircle2,
  Loader2,
  Users,
  Palette,
  Package,
  MessageSquare,
} from "lucide-react";

const MERCH_OPTIONS = [
  {
    id: "tshirts",
    label: "T-Shirts",
    icon: <Shirt className="size-5" />,
    minQty: 12,
    priceRange: "$18-$28",
    description: "Unisex soft cotton tees with your club logo",
  },
  {
    id: "polos",
    label: "Polo Shirts",
    icon: <Shirt className="size-5" />,
    minQty: 12,
    priceRange: "$25-$38",
    description: "Performance polos for match day",
  },
  {
    id: "hats",
    label: "Caps & Hats",
    icon: <Star className="size-5" />,
    minQty: 12,
    priceRange: "$14-$22",
    description: "Embroidered caps and bucket hats",
  },
  {
    id: "mugs",
    label: "Mugs",
    icon: <Coffee className="size-5" />,
    minQty: 6,
    priceRange: "$10-$16",
    description: "Ceramic mugs with club branding",
  },
  {
    id: "towels",
    label: "Bowler's Towels",
    icon: <ShoppingBag className="size-5" />,
    minQty: 12,
    priceRange: "$9-$15",
    description: "Microfiber towels with embroidered logo",
  },
  {
    id: "bags",
    label: "Tote Bags",
    icon: <ShoppingBag className="size-5" />,
    minQty: 12,
    priceRange: "$12-$20",
    description: "Canvas totes for the clubhouse",
  },
];

interface FormData {
  clubName: string;
  contactName: string;
  email: string;
  phone: string;
  selectedItems: string[];
  estimatedQuantity: string;
  clubColors: string;
  hasLogo: boolean;
  additionalNotes: string;
}

export function CustomMerchForm() {
  const [form, setForm] = useState<FormData>({
    clubName: "",
    contactName: "",
    email: "",
    phone: "",
    selectedItems: [],
    estimatedQuantity: "12-24",
    clubColors: "",
    hasLogo: false,
    additionalNotes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter((i) => i !== id)
        : [...prev.selectedItems, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // In production this would POST to an API endpoint or send an email
    // For now, simulate a short delay
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-[#1B5E20]" />
        <h1 className="text-2xl font-bold text-gray-900">Request Received!</h1>
        <p className="mt-2 text-gray-600">
          Thank you, {form.contactName}! We will get back to{" "}
          <strong>{form.clubName}</strong> within 2 business days with a custom
          quote and mockups for your merchandise.
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
    <div>
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1B5E20]"
      >
        <ChevronLeft className="size-4" />
        Back to Shop
      </Link>

      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Custom Club Merch
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-gray-600">
          Get branded merchandise for your lawn bowling club. Custom t-shirts,
          hats, mugs, and more with your club logo and colors. Minimum orders
          start at just 6 items.
        </p>
      </section>

      {/* Benefits */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: <Users className="size-6" />,
            title: "Club Unity",
            desc: "Build team spirit with matching club gear for members and supporters.",
          },
          {
            icon: <Palette className="size-6" />,
            title: "Your Brand",
            desc: "We print your club logo and colors. Send us your design or we can create one.",
          },
          {
            icon: <Package className="size-6" />,
            title: "No Inventory Risk",
            desc: "Print-on-demand means no unsold stock. Reorder anytime, any quantity.",
          },
        ].map((b) => (
          <div
            key={b.title}
            className="flex flex-col items-center rounded-xl border bg-white p-6 text-center"
          >
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#1B5E20]/10 text-[#1B5E20]">
              {b.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{b.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm sm:p-10"
      >
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Request a Quote
        </h2>

        {/* Club info */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Club Name *
            </label>
            <input
              type="text"
              required
              value={form.clubName}
              onChange={(e) =>
                setForm((p) => ({ ...p, clubName: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              placeholder="e.g. Sunnyvale Lawn Bowls Club"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Contact Name *
            </label>
            <input
              type="text"
              required
              value={form.contactName}
              onChange={(e) =>
                setForm((p) => ({ ...p, contactName: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            />
          </div>
        </div>

        {/* Product selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Items *
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {MERCH_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleItem(opt.id)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                  form.selectedItems.includes(opt.id)
                    ? "border-[#1B5E20] bg-[#1B5E20]/5 ring-1 ring-[#1B5E20]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${
                    form.selectedItems.includes(opt.id)
                      ? "bg-[#1B5E20] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {opt.priceRange}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{opt.description}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Min. {opt.minQty} units
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and details */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Estimated Quantity (per item)
            </label>
            <select
              value={form.estimatedQuantity}
              onChange={(e) =>
                setForm((p) => ({ ...p, estimatedQuantity: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            >
              <option value="6-11">6-11 items</option>
              <option value="12-24">12-24 items</option>
              <option value="25-49">25-49 items</option>
              <option value="50-99">50-99 items</option>
              <option value="100+">100+ items</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Club Colors
            </label>
            <input
              type="text"
              value={form.clubColors}
              onChange={(e) =>
                setForm((p) => ({ ...p, clubColors: e.target.value }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
              placeholder="e.g. Green and gold, #1B5E20"
            />
          </div>
        </div>

        {/* Logo */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Do you have a club logo?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="hasLogo"
                checked={form.hasLogo}
                onChange={() => setForm((p) => ({ ...p, hasLogo: true }))}
                className="accent-[#1B5E20]"
              />
              Yes, I can upload it
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="hasLogo"
                checked={!form.hasLogo}
                onChange={() => setForm((p) => ({ ...p, hasLogo: false }))}
                className="accent-[#1B5E20]"
              />
              No, I need one designed
            </label>
          </div>
          {form.hasLogo && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500">
              <Upload className="size-5 flex-shrink-0" />
              <span>
                Upload your logo after we confirm your quote. We accept PNG, SVG,
                or PDF (min 300 DPI for print).
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-8">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            <MessageSquare className="mr-1 inline size-4" />
            Additional Notes
          </label>
          <textarea
            value={form.additionalNotes}
            onChange={(e) =>
              setForm((p) => ({ ...p, additionalNotes: e.target.value }))
            }
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-[#1B5E20] focus:outline-none focus:ring-1 focus:ring-[#1B5E20]"
            placeholder="Any special requests — text on back, member names, event dates, etc."
          />
        </div>

        <button
          type="submit"
          disabled={
            submitting ||
            !form.clubName ||
            !form.contactName ||
            !form.email ||
            form.selectedItems.length === 0
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#0D3B12] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request a Quote"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          We will reply within 2 business days with pricing, mockups, and next
          steps.
        </p>
      </form>
    </div>
  );
}
