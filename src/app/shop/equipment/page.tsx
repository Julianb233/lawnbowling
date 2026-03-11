import type { Metadata } from "next";
import Link from "next/link";
import {
  ExternalLink,
  CircleDot,
  Footprints,
  Briefcase,
  Gem,
  BookOpen,
  ChevronRight,
  Star,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Equipment & Gear Guide",
  description:
    "Find the best lawn bowling equipment — bowls, shoes, bags, accessories, and books. Expert buying guide plus links to authorized dealers.",
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  retailer: string;
  priceRange?: string;
}

interface EquipmentCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  buyingTips: string[];
  links: AffiliateLink[];
}

const EQUIPMENT: EquipmentCategory[] = [
  {
    key: "bowls",
    label: "Bowls",
    icon: <CircleDot className="size-6" />,
    description:
      "Your bowls are the most important piece of equipment. They come in various sizes (00 to 5) and bias profiles for different playing styles.",
    buyingTips: [
      "Size matters: bowls should feel comfortable in your hand. Visit a pro shop to get fitted.",
      "Bias: narrow-bias bowls suit leads, wider bias suits skips.",
      "Popular brands: Henselite, Taylor, Drakes Pride, Aero.",
      "New bowlers: consider second-hand bowls until you know your preferred size and bias.",
    ],
    links: [
      {
        name: "Henselite Tiger II",
        description:
          "World's most popular bowl. Medium bias, suitable for all positions. Available in 23+ colours.",
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
      "Flat-soled shoes are required on the green to protect the surface. Look for comfort, grip, and breathability.",
    buyingTips: [
      "Flat soles only — heels and treads damage the green.",
      "White is traditional, but many clubs now accept coloured shoes.",
      "Waterproof options are great for dewy morning games.",
      "Good arch support is essential for long matches.",
    ],
    links: [
      {
        name: "Henselite Pro Sport Shoes",
        description:
          "Lightweight with excellent grip. Approved by World Bowls. Available in white and grey.",
        url: "https://www.henselite.com.au",
        retailer: "Henselite",
        priceRange: "$90-$140",
      },
      {
        name: "Drakes Pride Cosmic Shoe",
        description:
          "Comfortable everyday bowling shoe with reinforced toe. Great value for beginners.",
        url: "https://www.drakespride.com",
        retailer: "Drakes Pride",
        priceRange: "$60-$90",
      },
      {
        name: "Dek Bowling Shoes",
        description: "Budget-friendly flat-sole shoes. Ideal for casual bowlers getting started.",
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
      "A proper bowls bag protects your investment and keeps your gear organised. Sizes range from 2-bowl carry bags to large trolley bags.",
    buyingTips: [
      "Two-bowl bags are great for triples/fours players.",
      "Four-bowl bags with wheels save your back over the season.",
      "Look for padded dividers to prevent bowl damage.",
      "External pockets for measure, chalk, and towel are essential.",
    ],
    links: [
      {
        name: "Henselite Pro Trolley Bag",
        description: "4-bowl trolley bag with telescopic handle. Multiple accessory pockets.",
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
      "Essential accessories every bowler should have — from measures and chalk spray to grip aids and rain gear.",
    buyingTips: [
      "A string measure is required for close shots.",
      "Chalk spray marks touchers — keep one in your bag.",
      "Bowls towel keeps your bowls clean and dry.",
      "Grip wax helps in humid or cold conditions.",
    ],
    links: [
      {
        name: "Drakes Pride Bowls Measure",
        description:
          "Retractable string measure with belt clip. Essential for every bowler's bag.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$8-$15",
      },
      {
        name: "Henselite Chalk Spray",
        description: "Quick-drying chalk spray for marking touchers. Standard white.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$5-$10",
      },
      {
        name: "Aero Bowls Polishing Cloth",
        description: "Microfibre cloth designed for cleaning and polishing lawn bowls.",
        url: "https://www.aerobowls.com",
        retailer: "Aero Bowls",
        priceRange: "$10-$15",
      },
      {
        name: "Grip Wax & Grip Aids",
        description: "Bowling grip wax and aids for better control in all weather conditions.",
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
      "Level up your game with instruction books, strategy guides, and the rich history of lawn bowls.",
    buyingTips: [
      "Start with a beginner's guide if you're new to the sport.",
      "Strategy books help intermediate players improve shot selection.",
      "Historical books provide wonderful context and appreciation for the sport.",
    ],
    links: [
      {
        name: "Lawn Bowls: A Beginner's Guide",
        description:
          "Comprehensive introduction covering rules, techniques, etiquette and tips for new bowlers.",
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
      {
        name: "Bowls: The Thinking Sport",
        description:
          "Mental game strategies and match psychology for competitive bowlers.",
        url: "https://www.amazon.com",
        retailer: "Amazon",
        priceRange: "$15-$25",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EquipmentPage() {
  return (
    <>
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#0A2E12] sm:text-4xl">
          Equipment & Gear Guide
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[#3D5A3E]">
          Everything you need to get started or upgrade your lawn bowling kit.
          Expert buying tips plus links to trusted retailers.
        </p>
      </section>

      {/* Quick nav */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {EQUIPMENT.map((cat) => (
          <a
            key={cat.key}
            href={`#${cat.key}`}
            className="flex items-center gap-1.5 rounded-full border bg-white px-4 py-2 text-sm font-medium text-[#3D5A3E] transition hover:border-[#1B5E20] hover:text-[#1B5E20]"
          >
            {cat.icon}
            {cat.label}
          </a>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-12">
        {EQUIPMENT.map((cat) => (
          <section key={cat.key} id={cat.key} className="scroll-mt-20">
            {/* Category header */}
            <div className="mb-6 flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#1B5E20]/10 text-[#1B5E20]">
                {cat.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0A2E12]">
                  {cat.label}
                </h2>
                <p className="mt-1 text-sm text-[#3D5A3E]">
                  {cat.description}
                </p>
              </div>
            </div>

            {/* Buying tips */}
            <div className="mb-6 rounded-lg border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20]">
                <Info className="size-4" />
                Buying Tips
              </div>
              <ul className="space-y-1 text-sm text-[#3D5A3E]">
                {cat.buyingTips.map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <ChevronRight className="mt-0.5 size-3.5 flex-shrink-0 text-[#1B5E20]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product links */}
            <div className="grid gap-4 sm:grid-cols-2">
              {cat.links.map((link) => (
                <Link
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border bg-white dark:bg-[#1a3d28] p-4 transition hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#0A2E12] group-hover:text-[#1B5E20]">
                      {link.name}
                    </h3>
                    <ExternalLink className="size-4 flex-shrink-0 text-[#3D5A3E]/70 group-hover:text-[#1B5E20]" />
                  </div>
                  <p className="mt-1 flex-1 text-sm text-[#3D5A3E]">
                    {link.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-[#0A2E12]/5 px-2.5 py-0.5 text-xs font-medium text-[#3D5A3E]">
                      {link.retailer}
                    </span>
                    {link.priceRange && (
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#0A2E12]">
                        {link.priceRange}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Authorized dealers */}
      <section className="mt-16">
        <h2 className="mb-6 text-center text-xl font-bold text-[#0A2E12]">
          Authorized Dealers & Retailers
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
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
              description: "Wide selection of bowling accessories, books, and entry-level gear.",
              type: "General Retailer",
            },
          ].map((dealer) => (
            <Link
              key={dealer.name}
              href={dealer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-xl border bg-white dark:bg-[#1a3d28] p-4 text-center transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-center gap-1">
                <Star className="size-4 text-[#B8860B]" />
                <span className="text-xs font-medium uppercase tracking-wider text-[#3D5A3E]">
                  {dealer.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0A2E12] group-hover:text-[#1B5E20]">
                {dealer.name}
              </h3>
              <p className="mt-1 flex-1 text-sm text-[#3D5A3E]">
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
      <div className="mt-12 rounded-lg border bg-[#FEFCF9] p-4 text-center text-xs text-[#3D5A3E]">
        <p>
          Links on this page may be affiliate links. We may earn a small
          commission at no extra cost to you when you purchase through these
          links. This helps support the Lawnbowling app. Prices shown are
          approximate and may vary by retailer.
        </p>
      </div>
    </>
  );
}
