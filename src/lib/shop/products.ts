/**
 * Mock product catalog for Print-on-Demand shop.
 *
 * This file is designed as a drop-in data source.  When the Printify API key
 * is available, replace the exports here with fetchers that hit the Printify
 * API — the rest of the shop UI consumes these types and helpers unchanged.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductCategory = "t-shirts" | "hats" | "mugs" | "accessories";

export interface ProductVariant {
  id: string;
  label: string; // e.g. "S / White"
  size?: string;
  color?: string;
  /** Hex code for swatch */
  colorHex?: string;
  inStock: boolean;
  /** SKU from Printify (when synced) */
  sku?: string;
  /** Printify variant ID (when synced) */
  printifyVariantId?: number;
  /** Cost in cents from Printify (when synced) */
  costCents?: number;
  /** Per-variant retail price with markup (when synced) */
  retailPrice?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  /** Base cost (not shown) — retail = baseCost * 1.4 */
  baseCost: number;
  /** Retail price customers see */
  price: number;
  image: string;
  variants: ProductVariant[];
  featured?: boolean;
  tags?: string[];
  /** Printify product ID (when synced from Printify) */
  printifyProductId?: string;
  /** Printify blueprint ID (product template) */
  printifyBlueprintId?: number;
  /** Printify print provider ID */
  printifyProviderId?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 40 % markup rounded to nearest .99 */
function markup(base: number): number {
  const raw = base * 1.4;
  return Math.ceil(raw) - 0.01;
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

export const CATEGORIES: { key: ProductCategory; label: string; icon: string }[] = [
  { key: "t-shirts", label: "T-Shirts", icon: "Shirt" },
  { key: "hats", label: "Hats", icon: "HardHat" },
  { key: "mugs", label: "Mugs", icon: "Coffee" },
  { key: "accessories", label: "Accessories", icon: "ShoppingBag" },
];

// ---------------------------------------------------------------------------
// Colour palette shared across variants
// ---------------------------------------------------------------------------

const COLORS = {
  white: { label: "White", hex: "#FFFFFF" },
  black: { label: "Black", hex: "#1A1A1A" },
  green: { label: "Green", hex: "#1B5E20" },
  navy: { label: "Navy", hex: "#1A237E" },
  grey: { label: "Grey", hex: "#757575" },
  natural: { label: "Natural", hex: "#F5F0E1" },
};

const SIZES = ["S", "M", "L", "XL", "2XL"] as const;

function teeVariants(): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const color of [COLORS.white, COLORS.black, COLORS.green, COLORS.navy] as const) {
    for (const size of SIZES) {
      variants.push({
        id: `${color.label.toLowerCase()}-${size.toLowerCase()}`,
        label: `${size} / ${color.label}`,
        size,
        color: color.label,
        colorHex: color.hex,
        inStock: true,
      });
    }
  }
  return variants;
}

function hatVariants(): ProductVariant[] {
  return [COLORS.white, COLORS.black, COLORS.green, COLORS.navy].map((c) => ({
    id: `hat-${c.label.toLowerCase()}`,
    label: c.label,
    color: c.label,
    colorHex: c.hex,
    inStock: true,
  }));
}

function mugVariants(): ProductVariant[] {
  return [
    { id: "mug-11oz", label: "11 oz", size: "11oz", inStock: true },
    { id: "mug-15oz", label: "15 oz", size: "15oz", inStock: true },
  ];
}

function accessoryVariants(type: "sticker" | "tote" | "towel" | "pin"): ProductVariant[] {
  switch (type) {
    case "sticker":
      return [
        { id: "sticker-3", label: '3"', size: '3"', inStock: true },
        { id: "sticker-5", label: '5"', size: '5"', inStock: true },
      ];
    case "tote":
      return [
        { id: "tote-natural", label: "Natural", color: "Natural", colorHex: COLORS.natural.hex, inStock: true },
        { id: "tote-black", label: "Black", color: "Black", colorHex: COLORS.black.hex, inStock: true },
      ];
    case "towel":
      return [
        { id: "towel-white", label: "White", color: "White", colorHex: COLORS.white.hex, inStock: true },
        { id: "towel-green", label: "Green", color: "Green", colorHex: COLORS.green.hex, inStock: true },
      ];
    case "pin":
      return [{ id: "pin-one", label: "One Size", inStock: true }];
  }
}

// ---------------------------------------------------------------------------
// Product data — placeholder images use solid color blocks via data-uri
// ---------------------------------------------------------------------------

const placeholderImage = (bg: string, text: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'><rect fill='${bg}' width='600' height='600'/><text x='50%' y='45%' fill='white' font-size='36' font-family='system-ui,sans-serif' text-anchor='middle' dominant-baseline='middle'>${text}</text><text x='50%' y='58%' fill='rgba(255,255,255,0.6)' font-size='18' font-family='system-ui,sans-serif' text-anchor='middle' dominant-baseline='middle'>Lawn Bowling Shop</text></svg>`
  )}`;

const BASE_TEE = 18;
const BASE_HAT = 14;
const BASE_MUG = 10;
const BASE_STICKER = 3;
const BASE_TOTE = 12;
const BASE_TOWEL = 9;
const BASE_PIN = 5;

export const PRODUCTS: Product[] = [
  // ── T-Shirts ──────────────────────────────────────────────────────────
  {
    id: "tee-jack-high",
    slug: "jack-high-tee",
    name: "Jack High Tee",
    description:
      "For the bowler who always lands it perfectly. Soft ring-spun cotton with our signature lawn bowling graphic on the chest.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: placeholderImage("#1B5E20", "Jack High Tee"),
    variants: teeVariants(),
    featured: true,
    tags: ["best-seller"],
  },
  {
    id: "tee-draw-shot",
    slug: "draw-shot-tee",
    name: "The Draw Shot",
    description:
      "A beautiful curve — on the green and on this shirt. Features a minimalist bowl-path design that any bowler will recognise.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: placeholderImage("#2E7D32", "The Draw Shot"),
    variants: teeVariants(),
    tags: ["new"],
  },
  {
    id: "tee-toucher",
    slug: "toucher-tee",
    name: "Toucher! Tee",
    description:
      "Celebrate that perfect shot. Bold typographic design reads \"TOUCHER!\" across the chest — fellow bowlers will know.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: placeholderImage("#388E3C", "Toucher! Tee"),
    variants: teeVariants(),
  },
  {
    id: "tee-bias-life",
    slug: "bias-is-life-tee",
    name: "Bias Is Life Tee",
    description:
      "Philosophy meets sport. This conversation-starter tee features a witty design about the beautiful bias of lawn bowls.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: placeholderImage("#43A047", "Bias Is Life"),
    variants: teeVariants(),
  },

  // ── Hats ──────────────────────────────────────────────────────────────
  {
    id: "hat-greenkeeper",
    slug: "greenkeeper-cap",
    name: "The Greenkeeper Cap",
    description:
      "Keep the sun off with this classic 6-panel cap. Embroidered lawn bowl icon on the front. Adjustable strap fits all.",
    category: "hats",
    baseCost: BASE_HAT,
    price: markup(BASE_HAT),
    image: placeholderImage("#1565C0", "Greenkeeper Cap"),
    variants: hatVariants(),
    featured: true,
  },
  {
    id: "hat-skip-bucket",
    slug: "skip-bucket-hat",
    name: "Skip's Bucket Hat",
    description:
      "Channel your inner skip with this wide-brim bucket hat. UPF 50+ protection for those long sunny afternoons on the green.",
    category: "hats",
    baseCost: BASE_HAT + 2,
    price: markup(BASE_HAT + 2),
    image: placeholderImage("#0D47A1", "Skip Bucket Hat"),
    variants: hatVariants(),
  },
  {
    id: "hat-bowls-club",
    slug: "bowls-club-visor",
    name: "Bowls Club Visor",
    description:
      "Classic sport visor with \"Bowls Club\" embroidery. Moisture-wicking headband keeps you cool during competition.",
    category: "hats",
    baseCost: BASE_HAT,
    price: markup(BASE_HAT),
    image: placeholderImage("#1976D2", "Bowls Club Visor"),
    variants: hatVariants(),
  },

  // ── Mugs ──────────────────────────────────────────────────────────────
  {
    id: "mug-morning-end",
    slug: "morning-end-mug",
    name: "Morning End Mug",
    description:
      "Start every morning with a perfect end. Ceramic mug featuring a scenic bowling green illustration. Dishwasher safe.",
    category: "mugs",
    baseCost: BASE_MUG,
    price: markup(BASE_MUG),
    image: placeholderImage("#6D4C41", "Morning End Mug"),
    variants: mugVariants(),
    featured: true,
  },
  {
    id: "mug-measure-up",
    slug: "measure-up-mug",
    name: "Measure Up Mug",
    description:
      "\"Does it measure up?\" — a question for your bowls and your coffee. Fun measuring tape graphic wraps the mug.",
    category: "mugs",
    baseCost: BASE_MUG,
    price: markup(BASE_MUG),
    image: placeholderImage("#5D4037", "Measure Up Mug"),
    variants: mugVariants(),
  },
  {
    id: "mug-keep-calm",
    slug: "keep-calm-bowl-on-mug",
    name: "Keep Calm & Bowl On",
    description:
      "The quintessential bowler's mug. Clean typographic design that's a perfect gift for your bowling partner.",
    category: "mugs",
    baseCost: BASE_MUG,
    price: markup(BASE_MUG),
    image: placeholderImage("#4E342E", "Keep Calm & Bowl On"),
    variants: mugVariants(),
    tags: ["gift-idea"],
  },

  // ── Accessories ───────────────────────────────────────────────────────
  {
    id: "acc-bowl-sticker",
    slug: "lawn-bowl-sticker-pack",
    name: "Lawn Bowl Sticker Pack",
    description:
      "Six die-cut vinyl stickers featuring bowls, jacks, and cheeky bowling phrases. Waterproof and UV-resistant.",
    category: "accessories",
    baseCost: BASE_STICKER,
    price: markup(BASE_STICKER),
    image: placeholderImage("#F57C00", "Sticker Pack"),
    variants: accessoryVariants("sticker"),
    tags: ["gift-idea"],
  },
  {
    id: "acc-green-tote",
    slug: "on-the-green-tote",
    name: "On the Green Tote Bag",
    description:
      "Carry your essentials to the club in style. Heavyweight cotton canvas tote with bowling green illustration.",
    category: "accessories",
    baseCost: BASE_TOTE,
    price: markup(BASE_TOTE),
    image: placeholderImage("#E65100", "Green Tote"),
    variants: accessoryVariants("tote"),
  },
  {
    id: "acc-bowl-towel",
    slug: "bowlers-towel",
    name: "Bowler's Towel",
    description:
      "Keep your bowls clean and your hands dry. Microfiber towel with embroidered bowl icon. Clips to your bag.",
    category: "accessories",
    baseCost: BASE_TOWEL,
    price: markup(BASE_TOWEL),
    image: placeholderImage("#BF360C", "Bowler's Towel"),
    variants: accessoryVariants("towel"),
  },
  {
    id: "acc-enamel-pin",
    slug: "lawn-bowl-enamel-pin",
    name: "Lawn Bowl Enamel Pin",
    description:
      "A tiny bowl of joy for your hat, bag, or jacket. Hard enamel pin with butterfly clasp. 30 mm diameter.",
    category: "accessories",
    baseCost: BASE_PIN,
    price: markup(BASE_PIN),
    image: placeholderImage("#D84315", "Enamel Pin"),
    variants: accessoryVariants("pin"),
    tags: ["gift-idea"],
  },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(cat: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getAllSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}
