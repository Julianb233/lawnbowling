import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDot,
  Footprints,
  Briefcase,
  Gem,
  BookOpen,
  ChevronRight,
  Info,
  Star,
  ExternalLink,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title:
    "Lawn Bowling Equipment Buying Guide | What You Need to Get Started | Lawnbowling",
  description:
    "Complete lawn bowling equipment guide. Learn about bowls, shoes, bags, and accessories. Expert buying tips, brand comparisons, and links to authorized retailers.",
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface Product {
  name: string;
  description: string;
  url: string;
  retailer: string;
  priceRange: string;
}

interface EquipmentCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  buyingTips: string[];
  products: Product[];
}

const CATEGORIES: EquipmentCategory[] = [
  {
    key: "bowls",
    label: "Bowls",
    icon: <CircleDot className="size-6" />,
    description:
      "Your bowls are the most important piece of equipment. They come in sizes 00 to 5 with various bias profiles for different playing styles and positions.",
    buyingTips: [
      "Size matters: bowls should feel comfortable in your hand. Visit a pro shop or try club bowls to get fitted before buying.",
      "Bias: narrow-bias bowls suit leads (draw shots), wider bias suits skips (tactical shots around other bowls).",
      "Popular brands: Henselite, Taylor, Drakes Pride, Aero.",
      "New bowlers: consider second-hand bowls until you know your preferred size and bias. Many clubs sell used sets.",
      "Budget $400-$650 for a new set of four bowls. Second-hand sets can be found for $100-$250.",
    ],
    products: [
      {
        name: "Henselite Tiger II",
        description:
          "World's most popular bowl. Medium bias, suitable for all positions and conditions.",
        url: "https://www.henselite.com.au",
        retailer: "Henselite",
        priceRange: "$450-$650",
      },
      {
        name: "Taylor Ace",
        description:
          "Narrow to mid-bias bowl, ideal for leads. Excellent draw line and consistency.",
        url: "https://www.taylorbowls.com",
        retailer: "Taylor Bowls",
        priceRange: "$400-$600",
      },
      {
        name: "Drakes Pride Professional",
        description:
          "Mid-bias bowl suitable for all conditions. A reliable all-rounder at a competitive price.",
        url: "https://www.drakespride.com",
        retailer: "Drakes Pride",
        priceRange: "$350-$550",
      },
      {
        name: "Aero Quantum",
        description:
          "Modern design with ergonomic dimple grip. Mid-to-wide bias for versatile play.",
        url: "https://www.aerobowls.com",
        retailer: "Aero Bowls",
        priceRange: "$500-$700",
      },
    ],
  },
  {
    key: "shoes",
    label: "Shoes",
    icon: <Footprints className="size-6" />,
    description:
      "Flat-soled shoes are required on the green to protect the playing surface. Comfort and grip are essential for long matches.",
    buyingTips: [
      "Flat soles only -- heels and treaded soles damage the green and are not permitted.",
      "White is traditional, but many clubs now accept coloured shoes.",
      "Waterproof options are great for dewy morning games.",
      "Good arch support is essential if you play regularly -- matches can last 2-3 hours.",
    ],
    products: [
      {
        name: "Henselite Pro Sport",
        description:
          "Lightweight with excellent grip. Approved by World Bowls. Available in white and grey.",
        url: "https://www.henselite.com.au",
        retailer: "Henselite",
        priceRange: "$90-$140",
      },
      {
        name: "Drakes Pride Cosmic",
        description:
          "Comfortable everyday bowling shoe with reinforced toe. Great value for beginners.",
        url: "https://www.drakespride.com",
        retailer: "Drakes Pride",
        priceRange: "$60-$90",
      },
      {
        name: "Dek Bowling Shoes",
        description:
          "Budget-friendly flat-sole shoes ideal for casual bowlers getting started.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$30-$50",
      },
    ],
  },
  {
    key: "bags",
    label: "Bags",
    icon: <Briefcase className="size-6" />,
    description:
      "A proper bowls bag protects your investment and keeps gear organized. Sizes range from 2-bowl carry bags to large trolley bags.",
    buyingTips: [
      "Two-bowl bags are great for triples/fours players who carry fewer bowls.",
      "Four-bowl bags with wheels save your back over a long season.",
      "Look for padded dividers to prevent bowl-to-bowl damage.",
      "External pockets for a measure, chalk spray, and towel are essential.",
    ],
    products: [
      {
        name: "Henselite Pro Trolley Bag",
        description:
          "4-bowl trolley bag with telescopic handle and multiple accessory pockets.",
        url: "https://www.henselite.com.au",
        retailer: "Henselite",
        priceRange: "$120-$180",
      },
      {
        name: "Taylor Bowls Midi Bag",
        description: "Compact 2-bowl shoulder bag, perfect for pairs and triples.",
        url: "https://www.taylorbowls.com",
        retailer: "Taylor Bowls",
        priceRange: "$40-$60",
      },
      {
        name: "Drakes Pride Locker Bag",
        description: "Full-size locker bag fits 4 bowls, shoes, and accessories.",
        url: "https://www.drakespride.com",
        retailer: "Drakes Pride",
        priceRange: "$80-$120",
      },
    ],
  },
  {
    key: "accessories",
    label: "Accessories",
    icon: <Gem className="size-6" />,
    description:
      "Essential accessories every bowler needs -- from measures and chalk spray to grip aids and rain gear.",
    buyingTips: [
      "A string measure is required for close shots -- keep one in your bag.",
      "Chalk spray marks touchers (bowls that touch the jack).",
      "A bowls towel keeps your bowls clean and dry between deliveries.",
      "Grip wax helps maintain control in humid or cold conditions.",
    ],
    products: [
      {
        name: "Retractable Bowls Measure",
        description:
          "String measure with belt clip. Essential for determining shot in close situations.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$8-$15",
      },
      {
        name: "Henselite Chalk Spray",
        description:
          "Quick-drying chalk spray for marking touchers. Standard white.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$5-$10",
      },
      {
        name: "Grip Wax & Grip Aids",
        description:
          "Bowling grip wax and aids for better control in all weather conditions.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$8-$20",
      },
    ],
  },
  {
    key: "books",
    label: "Books & Learning",
    icon: <BookOpen className="size-6" />,
    description:
      "Level up your game with instruction books, strategy guides, and lawn bowls history.",
    buyingTips: [
      "Start with a beginner's guide if you are new to the sport.",
      "Strategy books help intermediate players improve shot selection and green reading.",
      "Historical books provide wonderful context and appreciation for the sport's rich heritage.",
    ],
    products: [
      {
        name: "Lawn Bowls: A Beginner's Guide",
        description:
          "Comprehensive introduction covering rules, techniques, etiquette and tips.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$12-$18",
      },
      {
        name: "The Complete Book of Bowls",
        description:
          "In-depth guide covering advanced tactics, green reading, and competitive play.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$20-$30",
      },
    ],
  },
];

const DEALERS = [
  {
    name: "Henselite",
    url: "https://www.henselite.com.au",
    description: "World's leading manufacturer of lawn bowls and accessories.",
    type: "Manufacturer",
  },
  {
    name: "Taylor Bowls",
    url: "https://www.taylorbowls.com",
    description: "Premium Scottish bowls manufacturer since 1796.",
    type: "Manufacturer",
  },
  {
    name: "Drakes Pride",
    url: "https://www.drakespride.com",
    description: "Quality bowls, clothing and accessories for all levels.",
    type: "Manufacturer",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.com",
    description:
      "Wide selection of bowling accessories, books, and entry-level gear.",
    type: "General Retailer",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EquipmentGuidePage() {
  const articleSchema = getArticleSchema({
    title: "Lawn Bowling Equipment Buying Guide",
    description: "Complete lawn bowling equipment guide. Learn about bowls, shoes, bags, and accessories.",
    url: "/learn/equipment",
  });
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Learn", url: "/learn" },
    { name: "Equipment Guide", url: "/learn/equipment" },
  ]);

  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <LearnNav />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Learning Hub
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-10 pb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
          <span className="text-sm font-medium text-[#1B5E20]">
            Buying Guide
          </span>
        </div>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          Equipment & Gear Guide
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
          Everything you need to get started or upgrade your lawn bowling kit.
          Expert buying tips plus links to trusted retailers.
        </p>
      </section>

      {/* Quick Nav */}
      <div className="mx-auto max-w-4xl px-6 pb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.key}
              href={`#${cat.key}`}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-[#1B5E20] hover:text-[#1B5E20]"
            >
              {cat.icon}
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mx-auto max-w-4xl px-6 pb-16 space-y-14">
        {CATEGORIES.map((cat) => (
          <section key={cat.key} id={cat.key} className="scroll-mt-20">
            {/* Category header */}
            <div className="mb-6 flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#1B5E20]/10 text-[#1B5E20]">
                {cat.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900" style={{ fontFamily: "var(--font-display)" }}>{cat.label}</h2>
                <p className="mt-1 text-[15px] text-zinc-600">
                  {cat.description}
                </p>
              </div>
            </div>

            {/* Buying tips */}
            <div className="mb-6 rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-5">
              <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20]">
                <Info className="size-4" />
                Buying Tips
              </div>
              <ul className="space-y-1.5 text-[15px] text-zinc-700">
                {cat.buyingTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <ChevronRight className="mt-0.5 size-3.5 flex-shrink-0 text-[#1B5E20]" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div className="grid gap-4 sm:grid-cols-2">
              {cat.products.map((product) => (
                <Link
                  key={product.name}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-zinc-900 group-hover:text-[#1B5E20]">
                      {product.name}
                    </h3>
                    <ExternalLink className="size-4 flex-shrink-0 text-zinc-400 group-hover:text-[#1B5E20]" />
                  </div>
                  <p className="mt-1.5 flex-1 text-sm text-zinc-600">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                      {product.retailer}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {product.priceRange}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Authorized Dealers */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="mb-6 text-center text-xl font-bold text-zinc-900" style={{ fontFamily: "var(--font-display)" }}>
          Authorized Dealers & Retailers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEALERS.map((dealer) => (
            <Link
              key={dealer.name}
              href={dealer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-center gap-1">
                <Star className="size-4 text-[#B8860B]" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {dealer.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 group-hover:text-[#1B5E20]">
                {dealer.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-zinc-600">
                {dealer.description}
              </p>
              <span className="mt-3 inline-flex items-center justify-center gap-1 text-sm font-medium text-[#1B5E20]">
                Visit Store <ExternalLink className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mx-auto max-w-4xl px-6 pb-8">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center text-xs text-zinc-500">
          Links on this page may be affiliate links. We may earn a small
          commission at no extra cost to you when you purchase through these
          links. This helps support the Lawnbowling app. Prices shown are
          approximate and may vary by retailer.
        </div>
      </div>

      <LearnFooter />
    </div>
  );
}
