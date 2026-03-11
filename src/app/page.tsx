import Link from "next/link";
import {
  CircleDot,
  Zap,
  Smartphone,
  Trophy,
  MapPin,
  Star,
  CheckCircle,
  Users,
  BookOpen,
} from "lucide-react";
import { LawnBowlingHero } from "@/components/home/LawnBowlingHero";
import { HomeNav } from "@/components/home/HomeNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation — overlays hero */}
      <HomeNav />

      {/* Hero with lawn bowling slideshow */}
      <LawnBowlingHero />

      {/* Social Proof Stats */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 md:py-28">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            Trusted by Clubs Across America
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:mt-4 sm:text-lg">
            Join the community making lawn bowling simple
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-8 md:mb-12">
          {[
            { value: "100+", label: "Clubs Listed" },
            { value: "50", label: "US States" },
            { value: "80+", label: "Glossary Terms" },
            { value: "4.9", label: "Rating", icon: Star },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-center sm:rounded-2xl sm:p-6"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-extrabold text-zinc-900 sm:text-3xl md:text-4xl">
                  {stat.value}
                </span>
                {stat.icon && (
                  <stat.icon className="h-5 w-5 text-amber-500 fill-amber-500 sm:h-6 sm:w-6" />
                )}
              </div>
              <span className="mt-1 block text-sm font-medium text-zinc-600 sm:text-base">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            Everything Your Club Needs
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:mt-4 sm:text-lg">
            Built for lawn bowling clubs, designed for bowlers
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Trophy,
              title: "Tournament Draw",
              desc: "Automatic draw generation for Singles, Pairs, Triples, and Fours. Multiple rotation formats.",
              gradient: "from-[#1B5E20] to-emerald-600",
              glow: "shadow-emerald-500/20",
            },
            {
              icon: Zap,
              title: "Live Scoring",
              desc: "Score entry per end, per rink, in real-time. Results calculated automatically.",
              gradient: "from-blue-600 to-blue-500",
              glow: "shadow-blue-500/20",
            },
            {
              icon: MapPin,
              title: "Club Directory",
              desc: "Browse 100+ lawn bowling clubs across the USA. Find your nearest green.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/20",
            },
            {
              icon: BookOpen,
              title: "Learn to Bowl",
              desc: "Comprehensive guides covering rules, positions, formats, equipment, and glossary.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-zinc-100 bg-white p-5 transition-all hover:shadow-lg sm:rounded-2xl sm:p-6"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 sm:text-base">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28"
      >
        <div className="mb-10 text-center md:mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-base text-zinc-600 sm:mt-4 sm:text-lg">
            Tournament day, simplified
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Check In",
              desc: "Players check in at the clubhouse iPad or on their phone. Select your preferred position.",
              icon: MapPin,
            },
            {
              step: "02",
              title: "Generate Draw",
              desc: "The drawmaster taps one button. Teams are formed, rinks assigned, positions balanced.",
              icon: Users,
            },
            {
              step: "03",
              title: "Play & Score",
              desc: "Enter scores end-by-end on the iPad. Results calculate automatically. Stats update live.",
              icon: Trophy,
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 sm:rounded-2xl sm:p-8">
                <span className="text-4xl font-black text-[#1B5E20]/15 sm:text-5xl">
                  {item.step}
                </span>
                <div className="mt-3 flex items-center gap-3 sm:mt-4">
                  <item.icon className="h-5 w-5 text-[#1B5E20]" />
                  <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 sm:mt-3 sm:text-base">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="mb-8 text-center md:mb-12">
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
            What Bowlers Say
          </h2>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "We replaced the paper draw sheet and everyone loves it. The iPad makes tournament day a breeze.",
              name: "Margaret H.",
              role: "Club Secretary",
              avatarBg: "bg-emerald-100 text-emerald-600",
            },
            {
              quote:
                "Being able to check in on my phone and see my rink assignment right away is brilliant. No more crowding the noticeboard.",
              name: "Bob T.",
              role: "Club Bowler",
              avatarBg: "bg-blue-100 text-blue-600",
            },
            {
              quote:
                "The learning hub helped my grandchildren understand the sport. Now they want to come bowl every weekend!",
              name: "Patricia L.",
              role: "Life Member",
              avatarBg: "bg-amber-100 text-amber-600",
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-zinc-100 bg-white p-5 sm:rounded-2xl sm:p-6"
            >
              <div className="mb-3 flex gap-1 sm:mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-zinc-700 italic sm:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-zinc-900">
                    {testimonial.name}
                  </span>
                  <span className="block text-sm text-zinc-500">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device Showcase */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 sm:rounded-3xl sm:p-8 md:p-12">
          <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:mb-4 sm:px-4">
                <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#1B5E20]">
                  Works Everywhere
                </span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
                iPad Kiosk.{" "}
                <span className="text-zinc-400">Phone Personal.</span>
              </h2>
              <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:mt-4 sm:text-lg">
                Set up an iPad at the clubhouse as a shared check-in kiosk.
                Players can also use their own phones — install the PWA for an
                app-like experience with no download required.
              </p>
              <ul className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
                {[
                  "Install via 'Add to Home Screen'",
                  "Works offline with cached data",
                  "iPad landscape kiosk mode",
                  "iPhone portrait personal mode",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-zinc-700 sm:gap-3 sm:text-base"
                  >
                    <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0 sm:h-5 sm:w-5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-52 w-64 rounded-2xl border border-zinc-200 bg-zinc-100 p-2.5 shadow-2xl sm:h-64 sm:w-80 sm:p-3 md:h-72 md:w-96">
                  <div className="flex h-full flex-col rounded-xl bg-white">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-1.5 sm:px-4 sm:py-2">
                      <span className="text-xs font-bold text-[#1B5E20]">
                        Lawnbowling
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-xs text-zinc-500">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 p-2 sm:p-3">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-zinc-100 bg-zinc-50 p-1.5 sm:p-2"
                          >
                            <div className="mx-auto mb-1 h-5 w-5 rounded-full bg-zinc-300 sm:h-6 sm:w-6" />
                            <div className="mx-auto h-1 w-8 rounded-full bg-zinc-300 sm:h-1.5 sm:w-10" />
                            <div className="mx-auto mt-0.5 h-0.5 w-5 rounded-full bg-emerald-300 sm:mt-1 sm:h-1 sm:w-6" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Club CTA */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="rounded-2xl bg-gradient-to-r from-[#1B5E20] to-emerald-600 p-6 text-center shadow-2xl shadow-emerald-500/20 sm:rounded-3xl sm:p-8 md:p-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Ready to modernize your club?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-emerald-100/80 sm:mt-4 sm:text-lg">
            Lawnbowling replaces the paper draw sheet. No more confusion, no
            more headaches on tournament day.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-zinc-50 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Start Free
            </Link>
            <Link
              href="/clubs"
              className="w-full rounded-xl border-2 border-white/30 px-6 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98] sm:w-auto sm:rounded-2xl sm:px-8 sm:py-4 sm:text-lg"
            >
              Find a Club
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-zinc-600 sm:gap-x-6">
            <Link href="/clubs" className="hover:text-zinc-900 transition">
              Clubs
            </Link>
            <Link href="/learn" className="hover:text-zinc-900 transition">
              Learn
            </Link>
            <Link href="/shop" className="hover:text-zinc-900 transition">
              Shop
            </Link>
            <Link href="/blog" className="hover:text-zinc-900 transition">
              Blog
            </Link>
            <Link href="/insurance" className="hover:text-zinc-900 transition">
              Insurance
            </Link>
            <Link href="/about" className="hover:text-zinc-900 transition">
              About
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-900 transition">
              Privacy
            </Link>
          </div>
          <span className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
