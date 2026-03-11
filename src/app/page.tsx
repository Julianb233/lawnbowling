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
  QrCode,
  ClipboardList,
  BookOpen,
  ShoppingBag,
  BarChart3,
  Globe,
  ChevronRight,
  CircleDot,
  ArrowRight,
  Play,
  Zap,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { LawnBowlingHero } from "@/components/home/LawnBowlingHero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#1B5E20]/5 bg-[#FEFCF9]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E20]">
              <CircleDot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/clubs" className="hidden md:block rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12] hover:bg-[#1B5E20]/5">
              Clubs
            </Link>
            <Link href="/learn" className="hidden md:block rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12] hover:bg-[#1B5E20]/5">
              Learn
            </Link>
            <Link href="/bowls" className="hidden md:block rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12] hover:bg-[#1B5E20]/5">
              Tournaments
            </Link>
            <Link href="/shop" className="hidden lg:block rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12] hover:bg-[#1B5E20]/5">
              Shop
            </Link>
            <Link href="/login" className="hidden sm:block rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12]">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25 active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Illustrated slideshow */}
      <LawnBowlingHero />

      {/* Social proof strip */}
      <section className="border-b border-[#1B5E20]/5 bg-white py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn variant="fade-in">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12 md:gap-x-16">
              {[
                { value: "100+", label: "Clubs Listed" },
                { value: "24", label: "States" },
                { value: "Free", label: "Forever" },
                { value: "PWA", label: "No Download" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-[#1B5E20] sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    {stat.value}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-[#3D5A3E]/60 sm:text-sm">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How It Works — with action bowl image */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <FadeIn variant="slide-right">
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
                  How it works
                </p>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0A2E12] sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Tournament day,{" "}
                  <span className="italic text-[#2E7D32]">simplified.</span>
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]/80 sm:mt-6">
                  From arrival to first bowl in under 2 minutes. No paper draw sheets,
                  no manual scoring, no headaches.
                </p>

                <div className="mt-8 space-y-6 sm:mt-10">
                  {[
                    {
                      num: "01",
                      title: "Check In",
                      desc: "Players scan the QR code or tap their name on the kiosk. Select your position — Skip, Lead, or Vice.",
                      icon: QrCode,
                    },
                    {
                      num: "02",
                      title: "Generate Draw",
                      desc: "One tap. Teams balanced by position and skill. Rinks assigned instantly.",
                      icon: ClipboardList,
                    },
                    {
                      num: "03",
                      title: "Play & Score",
                      desc: "Live scoring per end, per rink. Results calculated automatically. Multi-round ready.",
                      icon: Trophy,
                    },
                  ].map((step) => (
                    <div key={step.num} className="group flex gap-4 sm:gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E20]/5 text-[#1B5E20] transition-colors group-hover:bg-[#1B5E20] group-hover:text-white">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0A2E12]">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#3D5A3E]/70 sm:text-base">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn variant="slide-left" delay={0.2}>
              <div className="relative">
                <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F5E9] via-[#C8E6C9] to-[#A5D6A7] shadow-2xl shadow-[#1B5E20]/10">
                  {/* Illustrated bowling green with bowls */}
                  <div className="absolute inset-0 p-8 sm:p-12">
                    {/* Green surface */}
                    <div className="absolute bottom-[15%] left-[10%] right-[10%] top-[30%] rounded-xl bg-[#2E7D32]/20">
                      {/* Rink markers */}
                      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#1B5E20]/15" />
                      <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#1B5E20]/15" />
                    </div>
                    {/* Jack (small yellow ball) */}
                    <div className="absolute left-1/2 top-[42%] h-4 w-4 -translate-x-1/2 rounded-full bg-[#F5C89A] shadow-md sm:h-5 sm:w-5" />
                    {/* Bowls approaching */}
                    <div className="absolute left-[35%] top-[48%] h-8 w-8 rounded-full border-3 border-[#1B5E20]/50 bg-[#1B5E20]/10 shadow-md sm:h-10 sm:w-10" />
                    <div className="absolute left-[35%] top-[48%] h-8 w-8 sm:h-10 sm:w-10">
                      <div className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#1B5E20]/40" />
                    </div>
                    <div className="absolute left-[55%] top-[45%] h-8 w-8 rounded-full border-3 border-[#C62828]/40 bg-[#C62828]/10 shadow-md sm:h-10 sm:w-10" />
                    <div className="absolute left-[55%] top-[45%] h-8 w-8 sm:h-10 sm:w-10">
                      <div className="absolute right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#C62828]/30" />
                    </div>
                    {/* More bowls scattered */}
                    <div className="absolute bottom-[25%] left-[25%] h-7 w-7 rounded-full border-2 border-[#1B5E20]/30 bg-[#1B5E20]/5 sm:h-9 sm:w-9" />
                    <div className="absolute bottom-[30%] right-[25%] h-7 w-7 rounded-full border-2 border-[#C62828]/30 bg-[#C62828]/5 sm:h-9 sm:w-9" />
                    {/* Curved delivery path */}
                    <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 100 100" fill="none">
                      <path d="M50 90 Q 35 70, 40 50" stroke="#1B5E20" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                  </div>
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-4 -left-4 rounded-2xl border border-[#1B5E20]/10 bg-white/95 p-4 shadow-xl backdrop-blur-sm sm:-bottom-6 sm:-left-6 sm:p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20] sm:h-12 sm:w-12">
                      <Zap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#3D5A3E]/60 sm:text-sm">Draw generated</p>
                      <p className="text-lg font-bold text-[#0A2E12] sm:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                        in 2 seconds
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Community band — illustrated, no photos */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2E12] via-[#1B5E20] to-[#0A2E12]">
        <div className="relative py-20 sm:py-28 lg:py-32">
          {/* Illustrated bowling green pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
            {/* Green lines representing rinks */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-white" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
            <div className="absolute inset-x-0 bottom-1/3 h-px bg-white/60" />
            {/* Scattered bowls */}
            <div className="absolute right-[10%] top-[20%] h-16 w-16 rounded-full border-4 border-white sm:h-24 sm:w-24" />
            <div className="absolute right-[30%] bottom-[15%] h-12 w-12 rounded-full border-3 border-white sm:h-16 sm:w-16" />
            <div className="absolute right-[15%] bottom-[30%] h-4 w-4 rounded-full bg-white sm:h-6 sm:w-6" />
            <div className="absolute left-[60%] top-[15%] h-10 w-10 rounded-full border-3 border-white sm:h-14 sm:w-14" />
          </div>
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <FadeIn variant="fade-up">
                <div className="max-w-lg">
                  <h2
                    className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Every age. Every skill level.{" "}
                    <span className="italic text-[#A8D5BA]">One green.</span>
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-white/75 sm:mt-6 sm:text-lg">
                    Lawn bowling is one of the most inclusive sports on earth. From newcomers
                    to national champions, from 18 to 88 — everyone belongs on the green.
                  </p>
                  <Link
                    href="/learn"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:mt-8"
                  >
                    Start learning <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>
              <FadeIn variant="fade-up" delay={0.2}>
                <div className="flex justify-center gap-6 sm:gap-8">
                  {[
                    { age: "18", label: "Newcomer" },
                    { age: "45", label: "Weekender" },
                    { age: "72", label: "Champion" },
                  ].map((person) => (
                    <div key={person.age} className="text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#A8D5BA]/40 bg-white/10 backdrop-blur-sm sm:h-20 sm:w-20">
                        <span className="text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                          {person.age}
                        </span>
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider text-[#A8D5BA]/70 sm:text-sm">
                        {person.label}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-12 max-w-2xl sm:mb-16">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
                Platform
              </p>
              <h2
                className="text-3xl font-bold tracking-tight text-[#0A2E12] sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Everything your club needs.{" "}
                <span className="text-[#3D5A3E]/40">Nothing it doesn&apos;t.</span>
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5" staggerDelay={0.08}>
            {[
              {
                icon: QrCode,
                title: "QR Check-In",
                desc: "Scan to check in. No accounts needed. Position selection built in.",
                accent: "from-[#1B5E20] to-[#2E7D32]",
              },
              {
                icon: ClipboardList,
                title: "Smart Draw",
                desc: "One-tap generation. Fours, Triples, Pairs, Singles. Balanced by position.",
                accent: "from-[#1565C0] to-[#42A5F5]",
              },
              {
                icon: BarChart3,
                title: "Live Scoring",
                desc: "Enter scores per end on the iPad. Real-time updates across all rinks.",
                accent: "from-[#E65100] to-[#FF9800]",
              },
              {
                icon: Globe,
                title: "Club Directory",
                desc: "100+ clubs searchable by state. Claim and manage your listing.",
                accent: "from-[#1B5E20] to-[#4CAF50]",
              },
              {
                icon: Shield,
                title: "Insurance",
                desc: "Per-session coverage from $3/player. Integrated at check-in.",
                accent: "from-[#4A148C] to-[#7B1FA2]",
              },
              {
                icon: BookOpen,
                title: "Learn & Blog",
                desc: "Rules, glossary, positions, formats. 10+ articles targeting top keywords.",
                accent: "from-[#BF360C] to-[#E64A19]",
              },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="group relative rounded-2xl border border-[#0A2E12]/5 bg-[#FEFCF9] p-6 transition-all hover:border-[#1B5E20]/15 hover:shadow-lg hover:shadow-[#1B5E20]/5 sm:p-7">
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[#0A2E12] sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#3D5A3E]/70">
                    {feature.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Clubhouse section — illustrated */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <FadeIn variant="slide-right">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F5E9] via-[#C8E6C9] to-[#A5D6A7] p-8 shadow-2xl shadow-[#1B5E20]/10 sm:p-12">
                {/* Illustrated clubhouse scene */}
                <div className="relative mx-auto aspect-square max-w-[280px] sm:max-w-[320px]">
                  {/* Bowling green */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 rounded-xl bg-[#2E7D32]/30" />
                  <div className="absolute bottom-[10%] left-[15%] right-[15%] h-px bg-[#1B5E20]/30" />
                  {/* Clubhouse building */}
                  <div className="absolute bottom-[30%] left-[10%] h-[40%] w-[45%] rounded-t-lg bg-[#FEFCF9] shadow-lg">
                    <div className="absolute -top-3 left-0 right-0 h-6 rounded-t-lg bg-[#8D6E63]" />
                    <div className="mt-4 flex justify-center gap-2 px-3">
                      <div className="h-6 w-5 rounded-sm bg-[#1B5E20]/20" />
                      <div className="h-8 w-6 rounded-t-lg bg-[#1B5E20]/30" />
                      <div className="h-6 w-5 rounded-sm bg-[#1B5E20]/20" />
                    </div>
                  </div>
                  {/* Bowls on the green */}
                  <div className="absolute bottom-[12%] right-[20%] h-6 w-6 rounded-full border-2 border-[#1B5E20]/40 bg-[#1B5E20]/10" />
                  <div className="absolute bottom-[8%] right-[30%] h-5 w-5 rounded-full border-2 border-[#1B5E20]/40 bg-[#1B5E20]/10" />
                  <div className="absolute bottom-[15%] right-[25%] h-3 w-3 rounded-full bg-[#F5C89A]" />
                  {/* Flag */}
                  <div className="absolute right-[15%] top-[20%]">
                    <div className="h-16 w-0.5 bg-[#1B5E20]/40" />
                    <div className="absolute -right-4 top-0 h-4 w-4 rounded-sm bg-[#1B5E20]/30" />
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn variant="slide-left" delay={0.2}>
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
                  Club Directory
                </p>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0A2E12] sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Find your{" "}
                  <span className="italic text-[#2E7D32]">home green.</span>
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]/80 sm:mt-6">
                  Browse 100+ lawn bowling clubs across the USA. Filter by state,
                  see club details, and find your nearest green.
                </p>
                <ul className="mt-6 space-y-3 sm:mt-8">
                  {[
                    "Searchable by state and region",
                    "Club hours, contact info, and photos",
                    "Claim and manage your club listing",
                    "New clubs added weekly",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#3D5A3E]/80">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1B5E20]" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/clubs"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/20 transition-all hover:bg-[#2E7D32] hover:shadow-xl active:scale-[0.97]"
                >
                  Explore Directory <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0A2E12] py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="mb-12 text-center sm:mb-16">
              <h2
                className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Loved by bowlers.
              </h2>
              <p className="mt-3 text-base text-[#A8D5BA]/80 sm:text-lg">
                Real feedback from real clubs.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid gap-5 sm:gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {[
              {
                quote: "We ditched the paper draw sheet and our tournament days run 30 minutes faster. The automatic team balancing is spot on.",
                name: "Margaret W.",
                role: "Drawmaster, Santa Monica LBC",
              },
              {
                quote: "I love the QR check-in. Our older members just scan the code — no passwords, no apps to download. It just works.",
                name: "Robert K.",
                role: "Club Secretary, Sun City LBC",
              },
              {
                quote: "Finally, an app that understands lawn bowling positions. Skip, Lead, Vice — it balances the draw properly every time.",
                name: "Patricia L.",
                role: "Tournament Director, Laguna Beach LBC",
              },
            ].map((t) => (
              <StaggerItem key={t.name}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
                  <div className="mb-4 flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-[#F5C89A] text-[#F5C89A]" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E20] text-sm font-bold text-white">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-[#A8D5BA]/60">{t.role}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Celebration section — PWA */}
      <section className="py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <FadeIn variant="slide-right" className="order-2 lg:order-1">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/10 bg-[#1B5E20]/5 px-4 py-1.5">
                  <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1B5E20]">
                    Progressive Web App
                  </span>
                </div>
                <h2
                  className="text-3xl font-bold tracking-tight text-[#0A2E12] sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  iPad in the clubhouse.{" "}
                  <span className="text-[#3D5A3E]/40">Phone in your pocket.</span>
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-[#3D5A3E]/80 sm:mt-6">
                  Set up an iPad as a shared kiosk. Members use their phones too.
                  No app store, no download — just open the link.
                </p>
                <ul className="mt-6 space-y-3 sm:mt-8">
                  {[
                    "Install via 'Add to Home Screen'",
                    "Works offline with cached data",
                    "56pt+ touch targets for all ages",
                    "WCAG AAA accessible",
                    "Push notifications for draw announcements",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#3D5A3E]/80">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#1B5E20]" />
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn variant="slide-left" delay={0.2} className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] p-8 shadow-2xl shadow-[#1B5E20]/10 sm:p-12">
                {/* Illustrated devices */}
                <div className="relative mx-auto aspect-square max-w-[280px] sm:max-w-[320px]">
                  {/* iPad */}
                  <div className="absolute left-[5%] top-[10%] h-[60%] w-[55%] rounded-2xl border-4 border-[#0A2E12]/20 bg-white shadow-xl">
                    <div className="m-2 h-[85%] rounded-lg bg-[#1B5E20]/10 p-2">
                      <div className="h-2 w-12 rounded bg-[#1B5E20]/30" />
                      <div className="mt-2 space-y-1.5">
                        <div className="h-4 w-full rounded bg-[#1B5E20]/15" />
                        <div className="h-4 w-full rounded bg-[#1B5E20]/10" />
                        <div className="h-4 w-3/4 rounded bg-[#1B5E20]/15" />
                      </div>
                    </div>
                    <div className="mx-auto mt-0.5 h-1 w-8 rounded-full bg-[#0A2E12]/15" />
                  </div>
                  {/* Phone */}
                  <div className="absolute bottom-[8%] right-[10%] h-[50%] w-[28%] rounded-2xl border-3 border-[#0A2E12]/20 bg-white shadow-xl">
                    <div className="mx-auto mt-1.5 h-1 w-6 rounded-full bg-[#0A2E12]/10" />
                    <div className="m-1.5 h-[80%] rounded-lg bg-[#1B5E20]/10 p-1.5">
                      <div className="h-1.5 w-8 rounded bg-[#1B5E20]/30" />
                      <div className="mt-1.5 space-y-1">
                        <div className="h-3 w-full rounded bg-[#1B5E20]/15" />
                        <div className="h-3 w-full rounded bg-[#1B5E20]/10" />
                      </div>
                    </div>
                  </div>
                  {/* Checkmark badge */}
                  <div className="absolute right-[5%] top-[15%] flex h-12 w-12 items-center justify-center rounded-full bg-[#1B5E20] shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid gap-4 sm:gap-5 md:grid-cols-3" staggerDelay={0.1}>
            {[
              {
                href: "/clubs",
                icon: Globe,
                title: "Find a Club",
                desc: "100+ lawn bowling clubs across the USA. Filter by state or region.",
                cta: "Explore Directory",
              },
              {
                href: "/learn",
                icon: BookOpen,
                title: "Learn Lawn Bowling",
                desc: "Rules, positions, formats, and an 85+ term glossary.",
                cta: "Start Learning",
              },
              {
                href: "/bowls",
                icon: Trophy,
                title: "Run a Tournament",
                desc: "Check-in, draw generation, live scoring, and results.",
                cta: "Get Started",
              },
            ].map((card) => (
              <StaggerItem key={card.title}>
                <Link
                  href={card.href}
                  className="group flex flex-col rounded-2xl border border-[#0A2E12]/5 bg-[#FEFCF9] p-6 transition-all hover:border-[#1B5E20]/15 hover:shadow-lg hover:shadow-[#1B5E20]/5 sm:p-7"
                >
                  <card.icon className="mb-4 h-7 w-7 text-[#1B5E20]" />
                  <h3 className="mb-2 text-lg font-bold text-[#0A2E12]">{card.title}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-[#3D5A3E]/70">
                    {card.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B5E20] transition-all group-hover:gap-2.5">
                    {card.cta} <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <FadeIn variant="scale-in">
          <div className="relative overflow-hidden rounded-3xl bg-[#1B5E20] px-6 py-16 text-center shadow-2xl shadow-[#1B5E20]/30 sm:px-8 sm:py-20 md:px-16 md:py-24">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            <div className="relative">
              <h2
                className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl md:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ready to modernize your club?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-green-100/70 sm:mt-6 sm:text-lg">
                Replace the paper draw sheet. Lawnbowling handles check-in, draws,
                scoring, and results — so you can focus on the game.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="group w-full rounded-full bg-white px-8 py-4 text-base font-semibold text-[#1B5E20] shadow-xl transition-all hover:bg-[#F0FFF4] hover:shadow-2xl active:scale-[0.97] sm:w-auto sm:text-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/contact"
                  className="w-full rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10 active:scale-[0.97] sm:w-auto sm:text-lg"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/5 bg-[#FEFCF9]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B5E20]">
                  <CircleDot className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
                  Lawnbowling
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#3D5A3E]/60">
                The world&apos;s best lawn bowling app. Tournament management,
                club directory, and everything bowls.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/40">Platform</h4>
              <div className="space-y-2">
                <Link href="/bowls" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Tournaments</Link>
                <Link href="/clubs" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Club Directory</Link>
                <Link href="/shop" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Shop</Link>
                <Link href="/insurance" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Insurance</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/40">Learn</h4>
              <div className="space-y-2">
                <Link href="/learn" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Learning Hub</Link>
                <Link href="/learn/rules" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Rules</Link>
                <Link href="/learn/glossary" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Glossary</Link>
                <Link href="/blog" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#3D5A3E]/40">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">About</Link>
                <Link href="/contact" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Contact</Link>
                <Link href="/privacy" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">Privacy</Link>
                <Link href="/faq" className="block text-sm text-[#3D5A3E]/60 transition hover:text-[#0A2E12]">FAQ</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-[#0A2E12]/5 pt-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span className="text-xs text-[#3D5A3E]/40">
              &copy; {new Date().getFullYear()} Lawnbowling. All rights reserved.
            </span>
            <span className="text-xs text-[#3D5A3E]/40">
              lawnbowl.app
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
