import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Trophy,
  Shield,
  Smartphone,
  MapPin,
  Star,
  CheckCircle,
  BookOpen,
  Zap,
  CircleDot,
  ArrowRight,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { HomeNav } from "@/components/home/HomeNav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Navigation — overlays hero */}
      <HomeNav />

      {/* Hero — Full-bleed emotional image */}
      <section className="relative">
        <div className="relative h-[75vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
          <Image
            src="/images/hero-friends-wide.png"
            alt="Friends laughing together on a bowling green at golden hour"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/90 via-[#0A2E12]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E12]/40 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
            <FadeIn>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#A8D5BA] sm:mb-4 sm:text-base">
                The #1 Lawn Bowling Platform
              </p>
              <h1
                className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Where friendships{" "}
                <span className="italic text-[#A8D5BA]">roll.</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:mt-6 sm:text-lg md:text-xl">
                Tournament management, live scoring, and club tools — all from the clubhouse iPad.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-2xl transition-all hover:bg-[#F0FFF4] hover:shadow-3xl active:scale-[0.97]"
                >
                  Start Free{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/clubs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10 active:scale-[0.97]"
                >
                  <MapPin className="h-4 w-4" /> Find a Club
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 md:py-28">
        <FadeIn>
          <div className="mb-8 text-center md:mb-12">
            <h2
              className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Trusted by Clubs Across America
            </h2>
            <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
              Join the community making lawn bowling simple
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-8 md:mb-12">
          {[
            { value: "100+", label: "Clubs Listed" },
            { value: "50", label: "US States" },
            { value: "80+", label: "Glossary Terms" },
            { value: "4.9", label: "Rating", icon: Star },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-4 text-center shadow-sm sm:rounded-2xl sm:p-6">
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="text-2xl font-extrabold text-[#0A2E12] sm:text-3xl md:text-4xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {stat.value}
                  </span>
                  {stat.icon && (
                    <stat.icon className="h-5 w-5 text-amber-500 fill-amber-500 sm:h-6 sm:w-6" />
                  )}
                </div>
                <span className="mt-1 block text-sm font-medium text-[#3D5A3E] sm:text-base">
                  {stat.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Image + Text: Community */}
      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          <FadeIn variant="slide-right">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl sm:rounded-3xl">
              <Image
                src="/images/community-bonding.png"
                alt="Lawn bowlers sharing a moment on the green"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
          <FadeIn variant="slide-left" delay={0.2}>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
                More than a game
              </p>
              <h2
                className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Community on the green
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#3D5A3E] sm:text-lg">
                Lawn bowling is about the people as much as the sport. From social roll-ups to competitive tournaments,
                every session ends with a handshake and a story.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <FadeIn>
          <div className="mb-8 text-center md:mb-12">
            <h2
              className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything Your Club Needs
            </h2>
            <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
              Built for lawn bowling clubs, designed for bowlers
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <StaggerItem key={feature.title}>
              <div className="group rounded-xl border border-[#0A2E12]/10 bg-white p-5 transition-all hover:shadow-lg sm:rounded-2xl sm:p-6">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#3D5A3E] sm:text-base">
                  {feature.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28"
      >
        <FadeIn>
          <div className="mb-10 text-center md:mb-16">
            <h2
              className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How It Works
            </h2>
            <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
              Tournament day, simplified
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
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
            <StaggerItem key={item.step}>
              <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-5 sm:rounded-2xl sm:p-8">
                <span
                  className="text-4xl font-black text-[#1B5E20]/15 sm:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.step}
                </span>
                <div className="mt-3 flex items-center gap-3 sm:mt-4">
                  <item.icon className="h-5 w-5 text-[#1B5E20]" />
                  <h3 className="text-lg font-bold text-[#0A2E12] sm:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#3D5A3E] sm:mt-3 sm:text-base">
                  {item.desc}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Image + Text: Golden Hour */}
      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          <FadeIn variant="slide-right" className="order-2 md:order-1">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
                The clubhouse experience
              </p>
              <h2
                className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Golden hour on the green
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#3D5A3E] sm:text-lg">
                There&apos;s nothing quite like the late afternoon light across a freshly-cut bowling green.
                Lawnbowling helps clubs focus on what matters — the game and the company.
              </p>
            </div>
          </FadeIn>
          <FadeIn variant="slide-left" delay={0.2} className="order-1 md:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl sm:rounded-3xl">
              <Image
                src="/images/clubhouse-golden.png"
                alt="Clubhouse at golden hour"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <FadeIn>
          <div className="mb-8 text-center md:mb-12">
            <h2
              className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What Bowlers Say
            </h2>
          </div>
        </FadeIn>
        <StaggerContainer className="grid gap-4 sm:gap-6 md:grid-cols-3">
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
            <StaggerItem key={testimonial.name}>
              <div className="rounded-xl border border-[#0A2E12]/10 bg-white p-5 sm:rounded-2xl sm:p-6">
                <div className="mb-3 flex gap-1 sm:mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-[#2D4A30] italic sm:text-base">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#0A2E12]">
                      {testimonial.name}
                    </span>
                    <span className="block text-sm text-[#3D5A3E]">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Device Showcase */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <FadeIn>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:rounded-3xl sm:p-8 md:p-12">
            <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:mb-4 sm:px-4">
                  <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                  <span className="text-sm font-medium text-[#1B5E20]">
                    Works Everywhere
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  iPad Kiosk.{" "}
                  <span className="text-[#3D5A3E]/40">Phone Personal.</span>
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#3D5A3E] sm:mt-4 sm:text-lg">
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
                      className="flex items-center gap-2.5 text-sm text-[#2D4A30] sm:gap-3 sm:text-base"
                    >
                      <CheckCircle className="h-4 w-4 text-[#1B5E20] shrink-0 sm:h-5 sm:w-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="h-52 w-64 rounded-2xl border border-[#0A2E12]/15 bg-[#FEFCF9] p-2.5 shadow-2xl sm:h-64 sm:w-80 sm:p-3 md:h-72 md:w-96">
                    <div className="flex h-full flex-col rounded-xl bg-white">
                      <div className="flex items-center gap-2 border-b border-[#0A2E12]/10 px-3 py-1.5 sm:px-4 sm:py-2">
                        <span className="text-xs font-bold text-[#1B5E20]">
                          Lawnbowling
                        </span>
                        <span className="ml-auto flex items-center gap-1">
                          <span className="live-dot" />
                          <span className="text-xs text-[#3D5A3E]">Live</span>
                        </span>
                      </div>
                      <div className="flex-1 p-2 sm:p-3">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-[#0A2E12]/10 bg-[#FEFCF9] p-1.5 sm:p-2"
                            >
                              <div className="mx-auto mb-1 h-5 w-5 rounded-full bg-[#0A2E12]/10 sm:h-6 sm:w-6" />
                              <div className="mx-auto h-1 w-8 rounded-full bg-[#0A2E12]/10 sm:h-1.5 sm:w-10" />
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
        </FadeIn>
      </section>

      {/* Club CTA */}
      <section className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 md:pb-28">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl p-6 text-center shadow-2xl shadow-emerald-500/20 sm:rounded-3xl sm:p-8 md:p-16">
            {/* Background image CTA */}
            <Image
              src="/images/celebration-win.png"
              alt="Celebration on the green"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E12]/90 to-[#1B5E20]/85" />
            <div className="relative z-10">
              <h2
                className="text-2xl font-bold text-white sm:text-3xl md:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
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
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#FEFCF9]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 sm:py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B5E20]">
              <CircleDot className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#3D5A3E] sm:gap-x-6">
            <Link href="/clubs" className="hover:text-[#0A2E12] transition">
              Clubs
            </Link>
            <Link href="/learn" className="hover:text-[#0A2E12] transition">
              Learn
            </Link>
            <Link href="/shop" className="hover:text-[#0A2E12] transition">
              Shop
            </Link>
            <Link href="/blog" className="hover:text-[#0A2E12] transition">
              Blog
            </Link>
            <Link href="/insurance" className="hover:text-[#0A2E12] transition">
              Insurance
            </Link>
            <Link href="/about" className="hover:text-[#0A2E12] transition">
              About
            </Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">
              Privacy
            </Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
