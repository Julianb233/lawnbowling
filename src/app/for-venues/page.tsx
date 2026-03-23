import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 300; // 5 minutes

import {
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
  Star,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Lock,
} from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "For Venues | Lawnbowling",
  description:
    "Turn empty courts into revenue. Lawnbowling fills your facility with matched players, handles waivers and insurance, and gives you real-time analytics. Free to list.",
};

export default function ForVenuesPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Navigation */}
      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 sm:pb-20 md:pt-28 md:pb-28">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Building2 className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              For Club Directors
            </span>
          </div>
          <h1
            className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Run Your Club{" "}
            <span className="italic text-[#1B5E20]">Smarter</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Empty courts during off-peak hours. Paper waivers getting lost.
            No idea who played last Tuesday. Sound familiar? Lawnbowling
            fills your courts with skill-matched players, handles liability
            waivers and insurance automatically, and shows you exactly how
            your facility performs.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#B8860B]/30 bg-[#B8860B]/10 px-5 py-2">
            <DollarSign className="h-5 w-5 text-[#B8860B]" />
            <span className="text-sm font-semibold text-[#B8860B]">
              FREE to list your venue -- zero setup fees, no contracts
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-7 py-4 text-base font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:bg-[#145218] active:scale-[0.97]"
            >
              Get Free Coverage
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2E12]/15 px-7 py-4 text-base font-semibold text-[#2D4A30] transition-all hover:border-[#0A2E12]/30 hover:bg-[#0A2E12]/[0.03] active:scale-[0.97]"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* iPad Kiosk Mockup */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="flex justify-center">
          <div className="relative w-full max-w-lg">
            {/* iPad frame */}
            <div className="rounded-2xl border-4 border-[#0A2E12]/15 bg-white p-3 shadow-2xl">
              <div className="rounded-xl bg-[#FEFCF9] overflow-hidden">
                {/* Tab bar */}
                <div className="flex items-center gap-4 border-b border-[#0A2E12]/10 px-4 py-2 bg-white">
                  <span className="text-xs font-bold text-[#1B5E20]">Lawnbowling</span>
                  <span className="text-[10px] text-[#3D5A3E]">Club Dashboard</span>
                  <span className="ml-auto flex items-center gap-1">
                    <span className="live-dot" />
                    <span className="text-[10px] text-[#3D5A3E]">8 players checked in</span>
                  </span>
                </div>
                {/* Dashboard content */}
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-lg border border-[#0A2E12]/10 bg-white p-3">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Rink Status</span>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {["Rink 1", "Rink 2", "Rink 3", "Rink 4"].map((r) => (
                        <div key={r} className="rounded-md bg-[#1B5E20]/10 p-2 text-center">
                          <span className="text-[9px] font-semibold text-[#1B5E20]">{r}</span>
                          <p className="text-[8px] text-[#3D5A3E]">In Play</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[#0A2E12]/10 bg-white p-3">
                    <span className="text-[10px] font-semibold text-[#0A2E12]">Today</span>
                    <div className="mt-2 space-y-2">
                      <div className="text-center">
                        <span className="text-lg font-extrabold text-[#1B5E20]" style={{ fontFamily: "var(--font-display)" }}>16</span>
                        <p className="text-[8px] text-[#3D5A3E]">Players</p>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-extrabold text-[#B8860B]" style={{ fontFamily: "var(--font-display)" }}>4</span>
                        <p className="text-[8px] text-[#3D5A3E]">Matches</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sound Like Your Venue?
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
            Every facility operator deals with these headaches
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="mb-3 text-base font-bold text-[#0A2E12]">
              &ldquo;Empty courts during off-peak hours&rdquo;
            </p>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">
              Our matching engine sends players to your facility when courts are available. More players, fewer empty slots.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <p className="mb-3 text-base font-bold text-[#0A2E12]">
              &ldquo;Liability worries keep you up at night&rdquo;
            </p>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">
              Digital waivers are signed before anyone touches a court. Plus built-in per-participant insurance, underwritten by AIG and Lloyd&apos;s.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <p className="mb-3 text-base font-bold text-[#0A2E12]">
              &ldquo;Manual booking is a full-time job&rdquo;
            </p>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">
              Players book themselves. Courts are assigned automatically. Timers keep rotation fair. You just watch the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid (2x3) */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything Your Venue Needs
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">
            One platform to manage players, courts, and operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Court Management Dashboard</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">See every court in real time. Who&apos;s playing, how long they&apos;ve been on, and who&apos;s up next. Works on iPad kiosk or your phone.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Real-Time Booking</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Players check in and get matched instantly. No phone calls, no clipboards, no arguments about who&apos;s next.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Automatic Waivers</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Every player signs a digital waiver on first check-in. Logged, timestamped, and stored permanently. No more paper binders.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Built-In Insurance</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Per-participant liability coverage activates at check-in and deactivates when play ends. Underwritten by A-rated carriers.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-teal-500 shadow-lg shadow-emerald-500/20">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Facility Analytics</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Peak hours, sport breakdown, court utilization, player demographics. Data you can actually use to make scheduling decisions.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-[#B8860B] shadow-lg shadow-amber-500/20">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Player Ratings & Profiles</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Every player has a skill rating. The system creates balanced matches, so games are competitive and players keep coming back.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-8 text-center md:mb-12">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trusted by Facilities Nationwide
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 mb-8 md:mb-12">
          {[
            { value: "500+", label: "Clubs" },
            { value: "10,000+", label: "Bowlers" },
            { value: "50,000+", label: "Matches" },
            { value: "4.9", label: "Rating", hasStar: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[#0A2E12]/10 bg-white p-4 text-center shadow-sm sm:rounded-2xl sm:p-6">
              <div className="flex items-center justify-center gap-1">
                <span
                  className="text-2xl font-extrabold text-[#0A2E12] sm:text-3xl md:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </span>
                {stat.hasStar && <Star className="h-5 w-5 text-amber-500 fill-amber-500 sm:h-6 sm:w-6" />}
              </div>
              <span className="mt-1 block text-sm font-medium text-[#3D5A3E] sm:text-base">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              quote: "We replaced the paper sign-up sheet and our court utilization went up 40%. Players love the automatic rotation.",
              name: "David R.",
              role: "Rec Center Manager",
              avatarBg: "bg-blue-100 text-blue-600",
            },
            {
              quote: "The insurance integration alone was worth it. We used to spend hours chasing waivers. Now it's all handled before anyone steps on a court.",
              name: "Linda K.",
              role: "YMCA Program Director",
              avatarBg: "bg-emerald-100 text-emerald-600",
            },
            {
              quote: "I can finally see which sports and time slots are actually popular. We rescheduled our open play hours and doubled attendance.",
              name: "Marcus J.",
              role: "Community Center Director",
              avatarBg: "bg-amber-100 text-amber-600",
            },
          ].map((testimonial) => (
            <div key={testimonial.name} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-3 flex gap-1 sm:mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#2D4A30] italic sm:text-base">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.avatarBg}`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-sm font-semibold text-[#0A2E12]">{testimonial.name}</span>
                  <span className="block text-xs text-[#3D5A3E]">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Setup Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Go Live in Under 30 Minutes
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">No IT department required</p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {[
            { step: "01", icon: Settings, title: "Create Your Venue", desc: "Sign up, add your logo, address, hours, and the sports you offer. Takes about five minutes." },
            { step: "02", icon: Smartphone, title: "Configure Your Courts", desc: "Name your courts, set sport types and match durations. Customize rotation rules and kiosk display preferences." },
            { step: "03", icon: Rocket, title: "Launch", desc: "Put an iPad at the front desk in kiosk mode. Share the link with your members. Players start checking in immediately." },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-[#0A2E12]/10 bg-white p-5 sm:p-8 shadow-sm">
              <span
                className="text-4xl font-black text-[#1B5E20]/15 sm:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.step}
              </span>
              <div className="mt-3 flex items-center gap-3 sm:mt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-emerald-600 shadow-lg shadow-emerald-500/20">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#0A2E12] sm:text-xl">{item.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#3D5A3E] sm:mt-3 sm:text-base">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-2xl font-bold text-[#0A2E12] sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-base text-[#3D5A3E] sm:mt-4 sm:text-lg">List your venue for free. Upgrade when your facility grows.</p>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Starter</h3>
            <div className="mt-2">
              <span className="text-4xl font-extrabold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Free</span>
            </div>
            <p className="mt-2 text-sm text-[#3D5A3E]">Get your venue on the platform at zero cost</p>
            <ul className="mt-6 space-y-3">
              {["Up to 4 courts", "Player board & check-in", "Basic match timers", "Digital waivers", "Community support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#2D4A30]"><CheckCircle className="h-4 w-4 shrink-0 text-[#1B5E20]" />{f}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition active:scale-[0.98] border border-[#0A2E12]/10 bg-white text-[#2D4A30] hover:bg-[#0A2E12]/[0.03]">Get Started Free</Link>
          </div>
          <div className="rounded-2xl border-2 border-[#1B5E20] bg-[#1B5E20] shadow-xl shadow-emerald-500/10 p-6 sm:p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#B8860B] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Pro</h3>
            <div className="mt-2"><span className="text-4xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>$49</span><span className="text-emerald-200">/month</span></div>
            <p className="mt-2 text-sm text-emerald-100/80">For active venues that want the full toolkit</p>
            <ul className="mt-6 space-y-3">
              {["Unlimited courts", "All Starter features", "Admin analytics dashboard", "iPad kiosk mode", "Insurance revenue share ($2-$10/player)", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-emerald-100"><CheckCircle className="h-4 w-4 shrink-0 text-emerald-300" />{f}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition active:scale-[0.98] bg-white text-[#1B5E20] shadow-lg hover:bg-[#F0FFF4]">Start Free Trial</Link>
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-bold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Enterprise</h3>
            <div className="mt-2"><span className="text-4xl font-extrabold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>Custom</span></div>
            <p className="mt-2 text-sm text-[#3D5A3E]">For multi-location organizations</p>
            <ul className="mt-6 space-y-3">
              {["Everything in Pro", "Multi-venue management", "Custom branding", "API access", "Dedicated account manager", "SSO / SAML"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#2D4A30]"><CheckCircle className="h-4 w-4 shrink-0 text-[#1B5E20]" />{f}</li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 block w-full rounded-full py-3 text-center text-sm font-semibold transition active:scale-[0.98] border border-[#0A2E12]/10 bg-white text-[#2D4A30] hover:bg-[#0A2E12]/[0.03]">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative mx-auto max-w-4xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          <div className="flex items-center gap-3 text-[#3D5A3E]"><BadgeCheck className="h-6 w-6 text-[#1B5E20]" /><span className="text-sm font-semibold uppercase tracking-wider">Licensed</span></div>
          <div className="flex items-center gap-3 text-[#3D5A3E]"><Lock className="h-6 w-6 text-[#1B5E20]" /><span className="text-sm font-semibold uppercase tracking-wider">Secure Payments</span></div>
          <div className="flex items-center gap-3 text-[#3D5A3E]"><Building2 className="h-6 w-6 text-[#1B5E20]" /><span className="text-sm font-semibold uppercase tracking-wider">500+ Facilities</span></div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-14 sm:pb-20 md:pb-28">
        <div className="rounded-3xl bg-gradient-to-r from-[#0A2E12] to-[#1B5E20] p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2
            className="text-3xl font-bold text-white md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your Courts Are Sitting Empty Right Now
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">Every hour without players is revenue you won&apos;t get back. List your venue for free and let Lawnbowling fill those courts with matched, insured players.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="https://dailyeventinsurance.com/m/lawnbowling/quote/new" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#F0FFF4] active:scale-[0.98]">
              Get Free Coverage
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link href="/contact" className="rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]">Schedule a Demo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#FEFCF9]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={bowlsIconImg}
              alt="Lawnbowling logo"
              width={32}
              height={32}
              className="rounded-full"
              placeholder="blur"
            />
            <span className="font-semibold text-[#0A2E12]" style={{ fontFamily: "var(--font-display)" }}>
              Lawnbowling
            </span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#3D5A3E]">
            <Link href="/for-players" className="hover:text-[#0A2E12] transition">For Players</Link>
            <Link href="/insurance" className="hover:text-[#0A2E12] transition">Insurance</Link>
            <Link href="/about" className="hover:text-[#0A2E12] transition">About</Link>
            <Link href="/faq" className="hover:text-[#0A2E12] transition">FAQ</Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">Terms</Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">Privacy</Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">&copy; {new Date().getFullYear()} Lawnbowling</span>
        </div>
      </footer>
    </div>
  );
}
