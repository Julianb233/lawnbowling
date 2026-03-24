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
// Product data — illustrated SVG product images in /public/images/shop/
// ---------------------------------------------------------------------------

const BASE_TEE = 18;
const BASE_HOODIE = 32;
const BASE_HAT = 14;
const BASE_MUG = 10;
const BASE_STICKER = 3;
const BASE_TOTE = 12;
const BASE_TOWEL = 9;
const BASE_PIN = 5;
const BASE_WATER_BOTTLE = 15;
const BASE_POSTER = 12;

function hoodieVariants(): ProductVariant[] {
  const variants: ProductVariant[] = [];
  for (const color of [COLORS.black, COLORS.green, COLORS.navy, COLORS.grey] as const) {
    for (const size of SIZES) {
      variants.push({
        id: `hoodie-${color.label.toLowerCase()}-${size.toLowerCase()}`,
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

function posterVariants(): ProductVariant[] {
  return [
    { id: "poster-12x18", label: '12" x 18"', size: '12x18"', inStock: true },
    { id: "poster-18x24", label: '18" x 24"', size: '18x24"', inStock: true },
    { id: "poster-24x36", label: '24" x 36"', size: '24x36"', inStock: true },
  ];
}

function bottleVariants(): ProductVariant[] {
  return [
    { id: "bottle-white", label: "White", color: "White", colorHex: COLORS.white.hex, inStock: true },
    { id: "bottle-black", label: "Black", color: "Black", colorHex: COLORS.black.hex, inStock: true },
    { id: "bottle-green", label: "Green", color: "Green", colorHex: COLORS.green.hex, inStock: true },
  ];
}

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
    image: "/images/shop/tee-jack-high.svg",
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
    image: "/images/shop/tee-draw-shot.svg",
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
    image: "/images/shop/tee-toucher.svg",
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
    image: "/images/shop/tee-bias-life.svg",
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
    image: "/images/shop/hat-greenkeeper.svg",
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
    image: "/images/shop/hat-skip-bucket.svg",
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
    image: "/images/shop/hat-visor.svg",
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
    image: "/images/shop/mug-morning-end.svg",
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
    image: "/images/shop/mug-measure-up.svg",
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
    image: "/images/shop/mug-keep-calm.svg",
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
    image: "/images/shop/acc-sticker-pack.svg",
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
    image: "/images/shop/acc-tote.svg",
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
    image: "/images/shop/acc-towel.svg",
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
    image: "/images/shop/acc-enamel-pin.svg",
    variants: accessoryVariants("pin"),
    tags: ["gift-idea"],
  },

  // ── Hoodies ─────────────────────────────────────────────────────────
  {
    id: "hoodie-jack-hunter",
    slug: "jack-hunter-hoodie",
    name: "Jack Hunter Hoodie",
    description:
      "Stay warm between ends with this heavyweight pullover hoodie. Features our signature lawn bowl graphic on the chest. Fleece-lined for chilly green mornings.",
    category: "t-shirts",
    baseCost: BASE_HOODIE,
    price: markup(BASE_HOODIE),
    image: "/images/shop/tee-jack-high.svg",
    variants: hoodieVariants(),
    featured: true,
    tags: ["new"],
  },
  {
    id: "hoodie-roll-up",
    slug: "roll-up-hoodie",
    name: "Roll Up Hoodie",
    description:
      "\"Roll Up\" — the call to bowl. Minimalist typographic design on a cozy heavyweight hoodie. Perfect for post-game socialising at the clubhouse.",
    category: "t-shirts",
    baseCost: BASE_HOODIE,
    price: markup(BASE_HOODIE),
    image: "/images/shop/tee-draw-shot.svg",
    variants: hoodieVariants(),
  },

  // ── More T-Shirts ───────────────────────────────────────────────────
  {
    id: "tee-head-green",
    slug: "head-of-the-green-tee",
    name: "Head of the Green Tee",
    description:
      "Show off your skip credentials. Clean design with a bird's-eye view of a perfect head. Conversation starter at any club.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: "/images/shop/tee-toucher.svg",
    variants: teeVariants(),
    tags: ["new"],
  },
  {
    id: "tee-rink-rat",
    slug: "rink-rat-tee",
    name: "Rink Rat Tee",
    description:
      "For the bowler who practically lives at the club. Vintage-style graphic with \"Rink Rat\" badge. You know who you are.",
    category: "t-shirts",
    baseCost: BASE_TEE,
    price: markup(BASE_TEE),
    image: "/images/shop/tee-bias-life.svg",
    variants: teeVariants(),
  },

  // ── More Mugs ───────────────────────────────────────────────────────
  {
    id: "mug-live-on-green",
    slug: "live-on-the-green-mug",
    name: "Live on the Green Mug",
    description:
      "For those who would move a bed onto the bowling green if they could. Beautiful watercolour-style green illustration on both sides.",
    category: "mugs",
    baseCost: BASE_MUG,
    price: markup(BASE_MUG),
    image: "/images/shop/mug-morning-end.svg",
    variants: mugVariants(),
    tags: ["new"],
  },

  // ── Water Bottles ───────────────────────────────────────────────────
  {
    id: "acc-water-bottle",
    slug: "bowlers-water-bottle",
    name: "Bowler's Water Bottle",
    description:
      "Double-wall insulated stainless steel bottle keeps drinks cold for 24 hours or hot for 12. Laser-engraved lawn bowl logo. 500ml.",
    category: "accessories",
    baseCost: BASE_WATER_BOTTLE,
    price: markup(BASE_WATER_BOTTLE),
    image: "/images/shop/acc-towel.svg",
    variants: bottleVariants(),
    featured: true,
    tags: ["new", "gift-idea"],
  },

  // ── Posters ─────────────────────────────────────────────────────────
  {
    id: "acc-green-poster",
    slug: "bowling-green-poster",
    name: "Bowling Green Art Print",
    description:
      "Illustrated overhead view of a classic bowling green at golden hour. Museum-quality giclée print on archival matte paper.",
    category: "accessories",
    baseCost: BASE_POSTER,
    price: markup(BASE_POSTER),
    image: "/images/shop/mug-morning-end.svg",
    variants: posterVariants(),
    tags: ["new", "gift-idea"],
  },
  {
    id: "acc-vintage-poster",
    slug: "vintage-bowls-poster",
    name: "Vintage Bowls Club Poster",
    description:
      "Retro-style travel poster featuring a 1950s lawn bowling scene. \"Join Your Local Bowls Club\" tagline. A must for the clubhouse wall.",
    category: "accessories",
    baseCost: BASE_POSTER,
    price: markup(BASE_POSTER),
    image: "/images/shop/mug-keep-calm.svg",
    variants: posterVariants(),
    tags: ["gift-idea"],
  },

  // ── More Hats ───────────────────────────────────────────────────────
  {
    id: "hat-lawn-legend",
    slug: "lawn-legend-cap",
    name: "Lawn Legend Cap",
    description:
      "\"Lawn Legend\" embroidered in gold thread on a structured 5-panel cap. Because if you have earned it, wear it.",
    category: "hats",
    baseCost: BASE_HAT + 2,
    price: markup(BASE_HAT + 2),
    image: "/images/shop/hat-greenkeeper.svg",
    variants: hatVariants(),
    tags: ["new"],
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
