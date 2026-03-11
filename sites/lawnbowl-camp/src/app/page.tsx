const TIERS = [
  {
    name: "Essential",
    price: "$3",
    per: "per player",
    description: "Basic liability coverage for casual play",
    features: [
      "Per-participant liability ($1M)",
      "Activity injury medical ($25K)",
      "Emergency transport coverage",
    ],
    highlight: false,
  },
  {
    name: "Standard",
    price: "$7",
    per: "per player",
    description: "Comprehensive coverage for tournament play",
    features: [
      "Everything in Essential",
      "AD&D coverage ($50K)",
      "Equipment damage ($1K)",
      "Extended medical ($50K)",
      "Club event liability",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "$15",
    per: "per player",
    description: "Full protection for serious bowlers",
    features: [
      "Everything in Standard",
      "Enhanced AD&D ($100K)",
      "Equipment coverage ($2.5K)",
      "Income replacement ($500/week)",
      "Volunteer/official liability",
      "Travel to away matches",
    ],
    highlight: false,
  },
];

const STATS = [
  { label: "Falls cause 54% of lawn bowling injuries", source: "Monash University" },
  { label: "35% of injuries are fractures", source: "MUARC Report 138" },
  { label: "92% of players are over 45 years old", source: "Bowls Australia" },
  { label: "Average ER visit costs $2,500+", source: "AHA 2024" },
];

const FAQS = [
  {
    q: "How does per-session insurance work?",
    a: "Purchase coverage before each session or tournament. No annual commitment, no paperwork. Coverage is active for the duration of your event.",
  },
  {
    q: "What injuries are covered?",
    a: "Falls, sprains, fractures, bowl-strike injuries, overexertion injuries, and emergency transport. All the common lawn bowling injury patterns are covered.",
  },
  {
    q: "Is there an age limit?",
    a: "No age limit. Coverage is available for all ages. Our product was designed with the 55-75 demographic in mind, where injury risk is highest.",
  },
  {
    q: "Can clubs purchase coverage for all players?",
    a: "Yes. Club managers can purchase bulk coverage for tournament participants through the Lawnbowling app. Contact us for volume pricing.",
  },
  {
    q: "Who underwrites the insurance?",
    a: "Coverage is underwritten by AIG and Lloyd's of London through Daily Event Insurance (DEI), a licensed insurance provider.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-700 flex items-center justify-center">
              <span className="text-white text-sm font-black">LC</span>
            </div>
            <span className="text-lg font-bold text-zinc-900">
              LawnBowl<span className="text-emerald-700">.camp</span>
            </span>
          </div>
          <a
            href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
          >
            Get a Quote
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 mb-4">
            Per-Session Insurance
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl leading-[1.1]">
            Lawn bowling insurance{" "}
            <span className="text-emerald-700">from $3/player</span>
          </h1>
          <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Falls cause 54% of lawn bowling injuries. Protect yourself with
            affordable per-session coverage. No annual commitment, no paperwork.
            Backed by AIG and Lloyd&apos;s of London.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              Get Covered Now
            </a>
            <a
              href="https://lawnbowl.app/insurance/lawn-bowls"
              className="rounded-xl border border-zinc-200 px-8 py-4 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-zinc-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-sm font-semibold text-zinc-900">{stat.label}</p>
                <p className="text-xs text-zinc-400 mt-1">{stat.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="py-20" id="pricing">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-zinc-900">
              Coverage Tiers
            </h2>
            <p className="mt-3 text-zinc-500">
              Choose the level of protection that&apos;s right for you
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-emerald-300 bg-emerald-50/50 ring-2 ring-emerald-200"
                    : "border-zinc-200 bg-white"
                }`}
              >
                {tier.highlight && (
                  <span className="inline-block rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-zinc-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-zinc-900">{tier.price}</span>
                  <span className="text-sm text-zinc-400 ml-1">{tier.per}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                      <span className="mt-0.5 text-emerald-600 shrink-0">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                    tier.highlight
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Get a Quote
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black text-zinc-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl bg-white border border-zinc-200 p-6">
                <h3 className="text-base font-bold text-zinc-900">{faq.q}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-black text-zinc-900">
            Play with confidence
          </h2>
          <p className="mt-4 text-zinc-500">
            Join thousands of lawn bowlers who play protected. Coverage starts at $3/player with no annual commitment.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://dailyeventinsurance.com/m/pick-a-partner/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              Get Covered Now
            </a>
            <a
              href="https://lawnbowl.app"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Visit Lawnbowl.app &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} LawnBowl Camp. Powered by{" "}
            <a
              href="https://lawnbowl.app"
              className="text-emerald-600 hover:underline"
            >
              Lawnbowling
            </a>{" "}
            &amp;{" "}
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Daily Event Insurance
            </a>
          </p>
          <div className="flex gap-4 text-xs text-zinc-400">
            <a href="https://lawnbowl.app/privacy" className="hover:text-zinc-600">Privacy</a>
            <a href="https://lawnbowl.app/terms" className="hover:text-zinc-600">Terms</a>
            <a href="https://lawnbowl.app/contact" className="hover:text-zinc-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
