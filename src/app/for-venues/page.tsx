import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Timer,
  Shield,
  BarChart3,
  DollarSign,
  Smartphone,
  Settings,
  Rocket,
  CheckCircle,
  Zap,
  Building2,
  ClipboardCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Venues | Pick a Partner",
  description:
    "Modernize your rec center with Pick a Partner. Digital player boards, automated court management, built-in waivers, and insurance revenue — all in one platform.",
};

export default function ForVenuesPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-emerald"
        style={{ top: "-5%", right: "-5%", width: "500px", height: "500px" }}
      />
      <div
        className="orb orb-blue"
        style={{
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
        }}
      />
      <div
        className="orb orb-amber"
        style={{ top: "50%", left: "5%", width: "300px", height: "300px" }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900">
              Pick a Partner
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              About
            </Link>
            <Link
              href="/insurance"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Insurance
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500 hover:shadow-emerald-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              For Venues
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Modernize Your{" "}
            <span className="text-gradient">Rec Center</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            Replace clipboard sign-up sheets with a digital player board.
            Reduce wait times, automate waivers, track analytics, and earn
            insurance revenue — all from one platform.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Set Up Your Venue
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/(public)/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-8 py-4 text-lg font-semibold text-zinc-700 backdrop-blur transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Everything Your Venue Needs
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            One platform to manage players, courts, and operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Timer,
              title: "Reduce Wait Times",
              desc: "Fair rotation and real-time court status eliminate arguments and keep games flowing.",
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/15",
            },
            {
              icon: ClipboardCheck,
              title: "Digital Waivers",
              desc: "Players sign waivers on check-in. Logged, timestamped, and stored — no more paper.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/15",
            },
            {
              icon: BarChart3,
              title: "Real-Time Analytics",
              desc: "See peak hours, popular sports, player counts, and court utilization at a glance.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/15",
            },
            {
              icon: DollarSign,
              title: "Insurance Revenue",
              desc: "Earn a commission when players purchase Daily Event Insurance through your venue.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/15",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How Setup Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            How Setup Works
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Go live in under 30 minutes
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Settings,
              title: "Sign Up",
              desc: "Create your venue account and enter your facility details. Add your logo, address, hours of operation, and supported sports.",
            },
            {
              step: "02",
              icon: Smartphone,
              title: "Configure Courts",
              desc: "Define your courts and their sport types. Set match durations, rotation rules, and kiosk display preferences.",
            },
            {
              step: "03",
              icon: Rocket,
              title: "Launch",
              desc: "Put an iPad at the front desk in kiosk mode. Share the link with your members. Players start checking in immediately.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="glass rounded-2xl p-8">
                <span className="text-5xl font-black text-emerald-500/20">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                Built for Venue Operators
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Everything you need to run a modern recreation facility — without
                the complexity of enterprise software.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: Smartphone,
                  title: "iPad Kiosk Mode",
                  desc: "Turn any iPad into a shared check-in station with full-screen kiosk mode.",
                },
                {
                  icon: Shield,
                  title: "Liability Protection",
                  desc: "Digital waivers are signed before play. Every signature is logged and time-stamped.",
                },
                {
                  icon: BarChart3,
                  title: "Admin Dashboard",
                  desc: "Track peak hours, sport popularity, court utilization, and player demographics.",
                },
                {
                  icon: Zap,
                  title: "Automatic Rotation",
                  desc: "Match timers and automatic court assignment keep games moving fairly.",
                },
                {
                  icon: Users,
                  title: "Multi-Sport Support",
                  desc: "Run pickleball, tennis, lawn bowling, and more — all on a single platform.",
                },
                {
                  icon: DollarSign,
                  title: "Revenue Share",
                  desc: "Earn commissions on insurance policies purchased through your venue.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <feature.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-900">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-zinc-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Simple Pricing
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Start free, upgrade when you&apos;re ready
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "Free",
              period: "",
              desc: "Perfect for small venues getting started",
              features: [
                "Up to 4 courts",
                "Player board & check-in",
                "Basic match timers",
                "Digital waivers",
                "Community support",
              ],
              cta: "Get Started",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "$49",
              period: "/month",
              desc: "For active venues with multiple sports",
              features: [
                "Unlimited courts",
                "All Starter features",
                "Admin analytics dashboard",
                "iPad kiosk mode",
                "Insurance revenue share",
                "Priority support",
              ],
              cta: "Start Free Trial",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              desc: "For multi-location organizations",
              features: [
                "Everything in Pro",
                "Multi-venue management",
                "Custom branding",
                "API access",
                "Dedicated account manager",
                "SSO / SAML",
              ],
              cta: "Contact Sales",
              highlighted: false,
            },
          ].map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
                  : "border-zinc-200 bg-white shadow-sm"
              }`}
            >
              {tier.highlighted && (
                <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-zinc-900">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-zinc-500">{tier.period}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-zinc-600">{tier.desc}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-zinc-700"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.name === "Enterprise" ? "/(public)/contact" : "/signup"}
                className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition active:scale-[0.98] ${
                  tier.highlighted
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-500"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to Modernize Your Venue?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Join hundreds of recreation centers already using Pick a Partner to
            manage players, courts, and waivers digitally.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Set Up Your Venue
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/(public)/contact"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-zinc-2000 hover:bg-zinc-100 active:scale-[0.98]"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Pick a Partner</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="/insurance"
              className="hover:text-zinc-700 transition"
            >
              Insurance
            </Link>
            <Link href="/about" className="hover:text-zinc-700 transition">
              About
            </Link>
            <Link href="/faq" className="hover:text-zinc-700 transition">
              FAQ
            </Link>
            <Link
              href="/(public)/terms"
              className="hover:text-zinc-700 transition"
            >
              Terms
            </Link>
            <Link
              href="/(public)/privacy"
              className="hover:text-zinc-700 transition"
            >
              Privacy
            </Link>
          </div>
          <span className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Pick a Partner
          </span>
        </div>
      </footer>
    </div>
  );
}
