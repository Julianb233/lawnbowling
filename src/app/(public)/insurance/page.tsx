import Link from "next/link";
import {
  Users,
  Shield,
  ShieldCheck,
  ChevronRight,
  Heart,
  DollarSign,
  Clock,
  CheckCircle,
  Zap,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Insurance Coverage | Pick a Partner",
  description:
    "Play protected with Daily Event Insurance. Affordable per-event liability coverage for pickleball, tennis, lawn bowling, and more. Exclusive discounts for Pick a Partner players.",
};

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-[gradientShift_15s_ease_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px] animate-[gradientShift_20s_ease_infinite_reverse]" />
        <div className="absolute top-[50%] left-[40%] h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] animate-[gradientShift_25s_ease_infinite]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Pick a Partner</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 hover:shadow-emerald-500/30"
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
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Official Insurance Partner
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl">
            Play Protected with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Daily Event Insurance
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
            Pick a Partner has teamed up with Daily Event Insurance to bring you
            affordable, per-event liability coverage. Get protected before you
            step on the court — coverage activates when you play and ends when
            you&apos;re done.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Covered Today
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-lg font-semibold text-zinc-300 backdrop-blur transition-all hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white active:scale-[0.98]"
            >
              Sign Up to Play
            </Link>
          </div>
        </div>
      </section>

      {/* Partnership Badge */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="glass rounded-3xl border border-blue-500/10 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                Our Partnership
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Why We Partner with{" "}
                <span className="text-blue-400">Daily Event Insurance</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                At Pick a Partner, player safety is our top priority. We
                partnered with Daily Event Insurance because they offer the most
                flexible, affordable coverage for recreational sports — no
                annual contracts, no medical underwriting, just simple per-event
                protection backed by A-rated carriers like AIG and Lloyd&apos;s
                of London.
              </p>
              <p className="mt-4 text-zinc-400">
                When you sign up through Pick a Partner, your coverage is
                automatically linked to your player profile. Other players can
                see your insured status, giving everyone extra peace of mind on
                the court.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-blue-500/30 bg-zinc-900/80 shadow-2xl shadow-blue-500/10">
                  <div className="text-center">
                    <ShieldCheck className="mx-auto h-14 w-14 text-blue-400" />
                    <p className="mt-2 text-xs font-semibold text-zinc-400">
                      VERIFIED PARTNER
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            How Coverage Works
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Get insured in seconds — no paperwork, no hassle
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              step: "1",
              icon: Users,
              title: "Sign Up",
              desc: "Create your Pick a Partner account and complete your player profile.",
              color: "emerald",
            },
            {
              step: "2",
              icon: Shield,
              title: "Get Offered",
              desc: "After signing your liability waiver, you'll be offered Daily Event Insurance coverage.",
              color: "blue",
            },
            {
              step: "3",
              icon: CheckCircle,
              title: "Activate",
              desc: "Tap 'Get Coverage' to visit Daily Event Insurance. Pick your plan — coverage starts instantly.",
              color: "purple",
            },
            {
              step: "4",
              icon: Zap,
              title: "Play Protected",
              desc: "Your insured status shows on your profile. Coverage activates when you play and turns off when done.",
              color: "amber",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur transition-all hover:border-white/10 hover:bg-zinc-800/50 h-full">
                <span className="text-4xl font-black text-white/5">
                  {item.step}
                </span>
                <div
                  className={`mt-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${
                    item.color === "emerald"
                      ? "from-emerald-500 to-teal-500 shadow-emerald-500/20"
                      : item.color === "blue"
                        ? "from-blue-500 to-indigo-500 shadow-blue-500/20"
                        : item.color === "purple"
                          ? "from-purple-500 to-pink-500 shadow-purple-500/20"
                          : "from-amber-500 to-orange-500 shadow-amber-500/20"
                  } shadow-lg`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Why Players Love It
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Coverage designed for recreational athletes like you
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: DollarSign,
              title: "Affordable Per-Event Pricing",
              desc: "Pay only when you play. No annual commitments or recurring fees. Coverage starts as low as a few dollars per session.",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              icon: Clock,
              title: "Instant Activation",
              desc: "Coverage turns on when your event starts and turns off when it ends. No waiting periods, no paperwork, no medical underwriting.",
              gradient: "from-blue-500 to-indigo-500",
            },
            {
              icon: ShieldCheck,
              title: "A-Rated Carriers",
              desc: "Your coverage is underwritten by the world's top insurance carriers including AIG, Lloyd's of London, and Great American Insurance Group.",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              icon: Heart,
              title: "Injury Protection",
              desc: "Covers medical expenses from accidental injuries during play. Twisted ankle on the pickleball court? You're covered.",
              gradient: "from-rose-500 to-red-500",
            },
            {
              icon: Award,
              title: "Liability Coverage",
              desc: "Protects you if you accidentally injure another player. Play with confidence knowing you won't face unexpected legal costs.",
              gradient: "from-amber-500 to-orange-500",
            },
            {
              icon: Zap,
              title: "Seamless Integration",
              desc: "Your insured status appears right on your player card. Other players can see you're covered, building trust on the court.",
              gradient: "from-cyan-500 to-blue-500",
            },
          ].map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur transition-all hover:border-white/10 hover:bg-zinc-800/50"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg`}
              >
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Discount / Eligibility Section */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Exclusive for Pick a Partner Players
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                You&apos;re Eligible for{" "}
                <span className="text-emerald-400">Partner Discounts</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                As a Pick a Partner member, you automatically qualify for
                discounted coverage through our venue partnership with Daily
                Event Insurance. Your venue has already done the work — all you
                need to do is activate.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Venue Partnership Rate",
                  desc: "Your venue's partnership means lower premiums for all players",
                },
                {
                  label: "No Setup Fees",
                  desc: "Zero cost to join — just pick a plan and you're covered",
                },
                {
                  label: "Bundle with Membership",
                  desc: "Ask your venue about ActiveGuard\u2122 monthly coverage bundled into dues",
                },
                {
                  label: "Family & Group Rates",
                  desc: "Coverage extends to group events and tournaments at the venue",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-zinc-900/50 p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sports Covered */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Coverage for Every Sport
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Daily Event Insurance covers all the sports you play at the venue
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { name: "Pickleball", color: "emerald" },
            { name: "Tennis", color: "amber" },
            { name: "Lawn Bowling", color: "blue" },
            { name: "Badminton", color: "purple" },
            { name: "Racquetball", color: "rose" },
            { name: "Table Tennis", color: "cyan" },
            { name: "Volleyball", color: "orange" },
            { name: "Basketball", color: "red" },
          ].map((sport) => (
            <div
              key={sport.name}
              className={`rounded-full border px-6 py-3 text-base font-medium transition hover:scale-105 ${
                sport.color === "emerald"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : sport.color === "amber"
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                    : sport.color === "blue"
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : sport.color === "purple"
                        ? "border-purple-500/20 bg-purple-500/10 text-purple-400"
                        : sport.color === "rose"
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          : sport.color === "cyan"
                            ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                            : sport.color === "orange"
                              ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                              : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {sport.name}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-3xl px-6 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Common Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Do I have to buy insurance to use Pick a Partner?",
              a: "No. Insurance is completely optional. You can use the app to find partners and play at your venue without coverage. We recommend it for extra peace of mind, but it's your choice.",
            },
            {
              q: "How much does coverage cost?",
              a: "Pricing varies by sport and venue, but coverage typically costs just a few dollars per event. There are no annual fees, no contracts, and no hidden charges. Ask your venue about bundled rates through the ActiveGuard\u2122 program.",
            },
            {
              q: "When does my coverage start and end?",
              a: "Coverage activates when your event starts and deactivates when it ends. It's designed specifically for per-event protection so you only pay for the time you're playing.",
            },
            {
              q: "What does the insurance actually cover?",
              a: "Daily Event Insurance provides liability coverage for accidental injuries during recreational sports activities. This includes medical expenses from injuries you sustain and liability protection if you accidentally injure another player.",
            },
            {
              q: "Who underwrites the insurance?",
              a: "Coverage is underwritten by A-rated carriers including AIG, Lloyd's of London, and Great American Insurance Group — some of the most trusted names in insurance.",
            },
            {
              q: "How do other players know I'm insured?",
              a: "When you activate coverage, a green shield icon appears on your player card and profile. This lets other players know you're covered, building trust when they pick you as a partner.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-white">{faq.q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-32">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center shadow-2xl shadow-blue-500/20 md:p-16">
          <ShieldCheck className="mx-auto h-16 w-16 text-white/80" />
          <h2 className="mt-6 text-3xl font-bold text-white md:text-4xl">
            Ready to Play Protected?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/80">
            Join thousands of recreational athletes who play with the confidence
            of Daily Event Insurance coverage. It takes less than a minute.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Get Coverage Now
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link
              href="/signup"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/50 hover:bg-white/10 active:scale-[0.98]"
            >
              Sign Up First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Pick a Partner</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="/(public)/terms"
              className="transition hover:text-zinc-300"
            >
              Terms
            </Link>
            <Link
              href="/(public)/privacy"
              className="transition hover:text-zinc-300"
            >
              Privacy
            </Link>
            <Link
              href="/(public)/contact"
              className="transition hover:text-zinc-300"
            >
              Contact
            </Link>
            <a
              href="https://dailyeventinsurance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-zinc-300"
            >
              Daily Event Insurance
            </a>
          </div>
          <span className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Pick a Partner
          </span>
        </div>
      </footer>
    </div>
  );
}
