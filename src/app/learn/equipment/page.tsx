import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Circle,
  ShoppingBag,
  Footprints,
  Briefcase,
  Ruler,
  Sparkles,
  DollarSign,
  Star,
} from "lucide-react";
import { LearnNav } from "@/components/learn/LearnNav";
import { LearnFooter } from "@/components/learn/LearnFooter";
import { LearnBreadcrumb } from "@/components/learn/LearnBreadcrumb";
import { getArticleSchema, getBreadcrumbSchema, jsonLd } from "@/lib/schema";

export const metadata: Metadata = {
  title:
    "Lawn Bowling Equipment Buying Guide | Bowls, Shoes, Bags & Accessories",
  description:
    "Complete buying guide for lawn bowling equipment. Compare bowls from Henselite, Drakes Pride, Taylor, and Aero. Find the right size, bias, shoes, bags, and accessories for your level.",
  alternates: {
    canonical: "/learn/equipment",
  },
  openGraph: {
    title: "Lawn Bowling Equipment Buying Guide (2026)",
    description:
      "Everything you need to know about buying lawn bowling equipment. Bowls, shoes, bags, and accessories compared.",
    url: "https://lawnbowl.app/learn/equipment",
    type: "article",
  },
};

const equipmentSchema = getArticleSchema({
  title: "Lawn Bowling Equipment Buying Guide",
  description:
    "Complete lawn bowling equipment guide. Bowls, shoes, bags, and accessories with expert buying tips.",
  url: "/learn/equipment",
});

const equipmentBreadcrumbs = getBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Learn", url: "/learn" },
  { name: "Equipment", url: "/learn/equipment" },
]);

export default function EquipmentGuidePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <LearnNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(equipmentSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(equipmentBreadcrumbs) }}
      />

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
        <LearnBreadcrumb items={[{ label: "Equipment Guide" }]} />

        {/* Page Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
            Equipment{" "}
            <span className="text-[#1B5E20]">Buying Guide</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            From your first borrowed set to a fully kitted-out bag, here is
            everything you need to know about lawn bowling equipment. We cover
            bowls, shoes, bags, and accessories -- with recommendations for
            every budget.
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="mb-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-500">
            On This Page
          </h2>
          <ul className="space-y-2 text-[15px]">
            {[
              { id: "bowls", label: "Bowls -- Your Most Important Purchase" },
              { id: "choosing-size", label: "Choosing the Right Size" },
              { id: "understanding-bias", label: "Understanding Bias" },
              { id: "top-brands", label: "Top Bowl Brands Compared" },
              { id: "new-vs-used", label: "New vs Second-Hand Bowls" },
              { id: "shoes", label: "Shoes" },
              { id: "bags", label: "Bags" },
              { id: "accessories", label: "Accessories" },
              { id: "beginners-budget", label: "Beginner's Budget" },
            ].map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-[#1B5E20] hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-16">
          {/* Bowls */}
          <section id="bowls">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Circle className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Bowls -- Your Most Important Purchase
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Lawn bowls are precision-engineered balls made of{" "}
                <strong>composite resin</strong>. They are not perfectly round
                -- each bowl is slightly <strong>asymmetrical</strong>, which
                creates the <strong>bias</strong> (curve) that defines the
                sport. A set consists of <strong>4 matched bowls</strong> with
                identical markings.
              </p>
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <h3 className="mb-3 font-bold text-[#1B5E20]">
                  Do You Need Your Own Bowls to Start?
                </h3>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  <strong>No.</strong> Every club maintains a set of{" "}
                  <strong>club bowls</strong> in various sizes for members and
                  visitors. Use these while you learn. Once you decide lawn
                  bowls is your sport, your own set makes a meaningful
                  difference -- familiar weight, consistent grip, and faster
                  improvement.
                </p>
              </div>
            </div>
          </section>

          {/* Choosing Size */}
          <section id="choosing-size">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Ruler className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Choosing the Right Size
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Bowls come in <strong>9 standard sizes</strong>, numbered{" "}
                <strong>0000</strong> (smallest) through <strong>5</strong>{" "}
                (largest). The right size depends on the span of your hand.
              </p>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-left text-[15px]">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Size
                      </th>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Typical User
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      {
                        size: "0000 -- 00",
                        user: "Small hands, juniors",
                      },
                      {
                        size: "0 -- 1",
                        user: "Women with smaller hands",
                      },
                      {
                        size: "2 -- 3",
                        user: "Women with larger hands, men with smaller hands",
                      },
                      { size: "3 -- 4", user: "Most men" },
                      { size: "4 -- 5", user: "Men with larger hands" },
                    ].map((row) => (
                      <tr key={row.size}>
                        <td className="px-5 py-3 font-medium text-[#1B5E20]">
                          {row.size}
                        </td>
                        <td className="px-5 py-3 text-zinc-700">{row.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-3 font-bold text-zinc-900">
                  How to Test the Size
                </h3>
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  Hold a bowl in one hand with your fingers underneath and
                  thumb on top. If you can comfortably grip it and turn your
                  hand over without it slipping, the size is right. If you are
                  straining, go smaller. If it feels loose, go larger. The
                  best way to find your size is at a club where you can try
                  different options.
                </p>
              </div>
            </div>
          </section>

          {/* Understanding Bias */}
          <section id="understanding-bias">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Sparkles className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Understanding Bias
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Different bowl models have different amounts of bias -- the
                degree of curve in the bowl's path. This is the most important
                technical decision when buying bowls.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "Narrow Bias",
                    desc: "Relatively straight path with a gentle curve at the end. Preferred by leads and for fast greens.",
                    color: "text-blue-600",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: "Medium Bias",
                    desc: "Versatile middle ground. Best choice for beginners and most club players.",
                    color: "text-[#1B5E20]",
                    bg: "bg-[#1B5E20]/10",
                  },
                  {
                    label: "Wide Bias",
                    desc: "Pronounced curved path. Preferred by skips who need to draw around obstacles.",
                    color: "text-amber-600",
                    bg: "bg-amber-500/10",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <p className={`text-sm font-semibold ${item.color}`}>
                      {item.label}
                    </p>
                    <p className="mt-2 text-[14px] leading-relaxed text-zinc-700">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  <strong>Beginner recommendation:</strong> Start with a{" "}
                  <strong>medium-bias</strong> bowl. This gives you the most
                  flexibility as you learn and allows you to play any position
                  on the team.
                </p>
              </div>
            </div>
          </section>

          {/* Top Brands */}
          <section id="top-brands">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <Star className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Top Bowl Brands Compared
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Four manufacturers dominate the global lawn bowls market. All
                produce competition-grade bowls approved by World Bowls.
              </p>

              {[
                {
                  brand: "Henselite",
                  origin: "Australia",
                  models:
                    "Tiger, Tiger II, Tiger Evo, Tiger Pro, Dreamline XG",
                  price: "$600 -- $650+ per set of 4",
                  known:
                    "Mega Grip technology, 10-year guarantee, largest market share",
                  best: "All levels. Tiger II is an excellent all-around choice for beginners.",
                },
                {
                  brand: "Taylor",
                  origin: "Scotland",
                  models: "Ace, Blaze, Vector VS, International",
                  price: "$400 -- $600 per set of 4",
                  known:
                    "Precision engineering, oldest brand in the sport (est. 1796)",
                  best: "Leads (Ace/Blaze for narrow bias), all-rounders (Vector VS).",
                },
                {
                  brand: "Drakes Pride",
                  origin: "United Kingdom",
                  models: "Professional, XP, Pro-50",
                  price: "$400 -- $550 per set of 4",
                  known:
                    "Consistent performance, preferred supplier for many UK clubs",
                  best: "Club players wanting reliable, mid-range bowls.",
                },
                {
                  brand: "Aero",
                  origin: "Australia",
                  models: "Quantum, GrooVe, Sonic, Optima, Z Scoop",
                  price: "$500 -- $650+ per set of 4",
                  known:
                    "Most grip styles and color options of any brand, innovative designs",
                  best: "Players wanting extensive customization.",
                },
              ].map((b) => (
                <div
                  key={b.brand}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-6"
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-lg font-bold text-zinc-900">
                      {b.brand}
                    </h3>
                    <span className="text-xs font-medium text-zinc-500">
                      {b.origin}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Popular Models
                      </p>
                      <p className="mt-1 text-[14px] text-zinc-700">
                        {b.models}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Price Range
                      </p>
                      <p className="mt-1 text-[14px] text-zinc-700">
                        {b.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Known For
                      </p>
                      <p className="mt-1 text-[14px] text-zinc-700">
                        {b.known}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                        Best For
                      </p>
                      <p className="mt-1 text-[14px] text-zinc-700">
                        {b.best}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* New vs Used */}
          <section id="new-vs-used">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <ShoppingBag className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                New vs Second-Hand Bowls
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                  <h3 className="mb-3 font-bold text-zinc-900">
                    New Bowls
                  </h3>
                  <ul className="space-y-2 text-[15px] text-zinc-700">
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]/60" />
                      $400 -- $650 per set
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]/60" />
                      Choose exact model, size, color, and grip
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]/60" />
                      Manufacturer warranty (up to 10 years)
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E20]/60" />
                      Current bias certification
                    </li>
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                  <h3 className="mb-3 font-bold text-zinc-900">
                    Second-Hand Bowls
                  </h3>
                  <ul className="space-y-2 text-[15px] text-zinc-700">
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                      $100 -- $250 per set
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                      Limited choice of model and color
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                      Check for valid bias stamp
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />
                      Excellent value for beginners
                    </li>
                  </ul>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-3 font-bold text-zinc-900">
                  Tips for Buying Second-Hand
                </h3>
                <ul className="space-y-2 text-[15px] text-zinc-700">
                  {[
                    "Check for a valid bias stamp (stamps expire and bowls can be re-tested).",
                    "Inspect the running surface for wear -- chips or excessive flatting affect performance.",
                    "Ensure all 4 bowls are the same size, weight, and model.",
                    "Test the grip -- heavily polished bowls can become slippery.",
                    "Ask at your local club first -- many clubs sell second-hand sets from departing members.",
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] text-[10px] font-bold text-white mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Shoes */}
          <section id="shoes">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Footprints className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Shoes
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                You <strong>must</strong> wear flat-soled shoes on a bowling
                green. Regular athletic shoes with textured soles will damage
                the turf. &ldquo;Flat-soled&rdquo; means no tread pattern, no
                heels, and no grip texture -- just a smooth, uniform surface.
              </p>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-left text-[15px]">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Type
                      </th>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Price
                      </th>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Best For
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      {
                        type: "Dedicated bowling shoes",
                        price: "$30 -- $120",
                        best: "Regular players",
                      },
                      {
                        type: "Flat-soled sneakers",
                        price: "$20 -- $50",
                        best: "Budget-conscious beginners",
                      },
                      {
                        type: "Club loaner shoes",
                        price: "Free",
                        best: "First-time visitors",
                      },
                    ].map((row) => (
                      <tr key={row.type}>
                        <td className="px-5 py-3 font-medium text-zinc-900">
                          {row.type}
                        </td>
                        <td className="px-5 py-3 text-[#1B5E20] font-medium">
                          {row.price}
                        </td>
                        <td className="px-5 py-3 text-zinc-700">{row.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-3 font-bold text-zinc-900">
                  Popular Shoe Brands
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      brand: "Henselite (Seneca, Pro Flex)",
                      range: "$80 -- $120",
                      tier: "Premium",
                    },
                    {
                      brand: "DEK",
                      range: "$30 -- $50",
                      tier: "Budget",
                    },
                    {
                      brand: "Drakes Pride",
                      range: "$50 -- $90",
                      tier: "Mid-range",
                    },
                    {
                      brand: "Asics Gel Rink Scorcher 4",
                      range: "$80 -- $110",
                      tier: "Athletic crossover",
                    },
                  ].map((s) => (
                    <div
                      key={s.brand}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-zinc-900">
                          {s.brand}
                        </p>
                        <p className="text-xs text-zinc-500">{s.tier}</p>
                      </div>
                      <p className="text-[14px] font-medium text-[#1B5E20]">
                        {s.range}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Bags */}
          <section id="bags">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Bags
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                A set of 4 bowls weighs about <strong>6.5 kg (14 lbs)</strong>,
                so a proper bag matters. Here are your options.
              </p>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-left text-[15px]">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Type
                      </th>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Capacity
                      </th>
                      <th className="px-5 py-3 font-semibold text-zinc-900">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      {
                        type: "2-bowl carrier",
                        cap: "2 bowls",
                        price: "$20 -- $40",
                      },
                      {
                        type: "4-bowl bag (standard)",
                        cap: "4 bowls + accessories",
                        price: "$40 -- $80",
                      },
                      {
                        type: "Trolley bag (wheeled)",
                        cap: "4 bowls + shoes + accessories",
                        price: "$80 -- $200",
                      },
                      {
                        type: "Backpack style",
                        cap: "4 bowls + accessories",
                        price: "$50 -- $100",
                      },
                    ].map((row) => (
                      <tr key={row.type}>
                        <td className="px-5 py-3 font-medium text-zinc-900">
                          {row.type}
                        </td>
                        <td className="px-5 py-3 text-zinc-700">{row.cap}</td>
                        <td className="px-5 py-3 text-[#1B5E20] font-medium">
                          {row.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl border border-[#1B5E20]/20 bg-[#1B5E20]/5 p-6">
                <p className="text-[15px] leading-relaxed text-zinc-700">
                  <strong>Recommendation:</strong> A standard{" "}
                  <strong>4-bowl bag</strong> with a separate accessory
                  compartment is all most players need. Upgrade to a trolley
                  bag if you play frequently or prefer not to carry the weight.
                </p>
              </div>
            </div>
          </section>

          {/* Accessories */}
          <section id="accessories">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Accessories
              </h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-4 font-bold text-zinc-900">
                  Must-Have Accessories
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      name: "Chalk spray or stick",
                      price: "$5 -- $12",
                      desc: "Marks touchers (bowls that have touched the jack). Essential for proper play.",
                    },
                    {
                      name: "Polishing cloth",
                      price: "$5 -- $10",
                      desc: "Wipe bowls before play to remove moisture and ensure consistent grip.",
                    },
                    {
                      name: "Retractable tape measure",
                      price: "$10 -- $20",
                      desc: "Determines closest bowl at the end of each end. Bowls-specific measures lock at the measuring point.",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start justify-between gap-4 rounded-lg border border-zinc-100 bg-white p-4"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 text-[15px]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[13px] text-zinc-600">
                          {item.desc}
                        </p>
                      </div>
                      <span className="shrink-0 text-[14px] font-medium text-[#1B5E20]">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6">
                <h3 className="mb-4 font-bold text-zinc-900">
                  Nice-to-Have Accessories
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Bowl grip/wax", price: "$5 -- $15" },
                    { name: "Bowl polish", price: "$8 -- $15" },
                    { name: "Calipers", price: "$15 -- $35" },
                    { name: "Bowling gloves", price: "$15 -- $25" },
                    { name: "Scorecard holder", price: "$5 -- $30" },
                    { name: "Bowling arm (delivery aid)", price: "$50 -- $150" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white px-4 py-3"
                    >
                      <p className="text-[14px] text-zinc-700">{item.name}</p>
                      <p className="text-[14px] font-medium text-[#1B5E20]">
                        {item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Beginner's Budget */}
          <section id="beginners-budget">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E20]/10">
                <DollarSign className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 md:text-3xl">
                Beginner&apos;s Budget
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[16px] leading-relaxed text-zinc-700">
                Here is a prioritized buying timeline for new players. You do
                not need to buy everything at once -- build your kit as your
                commitment grows.
              </p>

              {[
                {
                  phase: "Before Your First Game",
                  items: [
                    {
                      item: "Nothing. Use club equipment.",
                      cost: "$0",
                    },
                  ],
                  subtotal: "$0",
                },
                {
                  phase: "Month 1 -- 3 (After Joining)",
                  items: [
                    { item: "Flat-soled shoes", cost: "$30 -- $80" },
                    {
                      item: "Bowls (second-hand)",
                      cost: "$100 -- $250",
                    },
                    { item: "4-bowl bag", cost: "$40 -- $80" },
                  ],
                  subtotal: "$170 -- $410",
                },
                {
                  phase: "Month 3 -- 6 (Getting Involved)",
                  items: [
                    { item: "Retractable measure", cost: "$10 -- $20" },
                    { item: "Chalk spray", cost: "$5 -- $12" },
                    { item: "Polishing cloth", cost: "$5 -- $10" },
                  ],
                  subtotal: "$20 -- $42",
                },
                {
                  phase: "Month 6+ (Committed Player)",
                  items: [
                    { item: "Calipers", cost: "$15 -- $35" },
                    { item: "Bowl polish", cost: "$8 -- $15" },
                    {
                      item: "Trolley bag (upgrade)",
                      cost: "$80 -- $200",
                    },
                  ],
                  subtotal: "$103 -- $250",
                },
              ].map((phase) => (
                <div
                  key={phase.phase}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-6"
                >
                  <h3 className="mb-3 font-bold text-zinc-900">
                    {phase.phase}
                  </h3>
                  <div className="space-y-2">
                    {phase.items.map((row) => (
                      <div
                        key={row.item}
                        className="flex items-center justify-between text-[15px]"
                      >
                        <span className="text-zinc-700">{row.item}</span>
                        <span className="font-medium text-zinc-900">
                          {row.cost}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3">
                    <span className="text-[14px] font-semibold text-zinc-500 uppercase tracking-wide">
                      Subtotal
                    </span>
                    <span className="font-bold text-[#1B5E20]">
                      {phase.subtotal}
                    </span>
                  </div>
                </div>
              ))}

              <div className="rounded-xl border-2 border-[#1B5E20]/30 bg-[#1B5E20]/5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1B5E20]">
                    Total Estimated Cost (Fully Equipped)
                  </h3>
                  <span className="text-lg font-bold text-[#1B5E20]">
                    $200 -- $700
                  </span>
                </div>
                <p className="mt-2 text-[14px] text-zinc-600">
                  With second-hand bowls: $200 -- $500. With new bowls: $500 --
                  $900. Spread over 6+ months as your involvement grows.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Learning Hub
          </Link>
          <Link
            href="/blog/lawn-bowling-equipment"
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#1B5E20] hover:underline"
          >
            Read Full Equipment Article
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <LearnFooter />
    </div>
  );
}
