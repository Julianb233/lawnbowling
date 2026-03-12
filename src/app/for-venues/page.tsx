import type { Metadata } from "next";
import Link from "next/link";
import {
  CircleDot,
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

export const metadata: Metadata = {
  title: "For Venues | Lawnbowling",
  description:
    "Turn empty courts into revenue. Lawnbowling fills your facility with matched players, handles waivers and insurance, and gives you real-time analytics. Free to list.",
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

      <PublicNav />

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              For Venue Operators
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-[#0A2E12] md:text-7xl">
            Turn Your Courts Into{" "}
            <span className="text-gradient">Revenue</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#3D5A3E] md:text-xl">
            Empty courts during off-peak hours. Paper waivers getting lost.
            No idea who played last Tuesday. Sound familiar? Lawnbowling
            fills your courts with skill-matched players, handles liability
            waivers and insurance automatically, and shows you exactly how
            your facility performs.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              FREE to list your venue -- zero setup fees, no contracts
            </span>
          </div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="https://dailyeventinsurance.com/m/lawnbowling/quote/new"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/20 transition-all hover:shadow-emerald-500/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Free Coverage
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#0A2E12]/10 bg-white px-8 py-4 text-lg font-semibold text-[#2D4A30] backdrop-blur transition-all hover:border-[#0A2E12]/10 hover:bg-[#0A2E12]/[0.03] hover:text-[#0A2E12] active:scale-[0.98]"
            >
              Schedule a Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            Sound Like Your Venue?
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            Every facility operator deals with these headaches
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="mb-3 text-base font-bold text-[#0A2E12]">
              &ldquo;Empty courts during off-peak hours&rdquo;
            </p>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">
              Our matching engine sends players to your facility when courts are available. More players, fewer empty slots.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <p className="mb-3 text-base font-bold text-[#0A2E12]">
              &ldquo;Liability worries keep you up at night&rdquo;
            </p>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">
              Digital waivers are signed before anyone touches a court. Plus built-in per-participant insurance, underwritten by AIG and Lloyd&apos;s.
            </p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-8 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
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

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">
            Everything Your Venue Needs
          </h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">
            One platform to manage players, courts, and operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/15">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Court Management Dashboard</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">See every court in real time. Who&apos;s playing, how long they&apos;ve been on, and who&apos;s up next. Works on iPad kiosk or your phone.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/15">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Real-Time Booking</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Players check in and get matched instantly. No phone calls, no clipboards, no arguments about who&apos;s next.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/15">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Automatic Waivers</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Every player signs a digital waiver on first check-in. Logged, timestamped, and stored permanently. No more paper binders.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/15">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Built-In Insurance</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Per-participant liability coverage activates at check-in and deactivates when play ends. Underwritten by A-rated carriers.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 shadow-lg shadow-rose-500/15">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Facility Analytics</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Peak hours, sport breakdown, court utilization, player demographics. Data you can actually use to make scheduling decisions.</p>
          </div>
          <div className="group rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm transition-all hover:border-[#0A2E12]/10 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/15">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#0A2E12]">Player Ratings & Profiles</h3>
            <p className="text-sm leading-relaxed text-[#3D5A3E]">Every player has a skill rating. The system creates balanced matches, so games are competitive and players keep coming back.</p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">Trusted by Facilities Nationwide</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
          <div className="glass-card-light rounded-2xl p-6 text-center">
            <span className="text-3xl font-extrabold text-[#0A2E12] md:text-4xl">500+</span>
            <span className="mt-1 block text-sm font-medium text-[#3D5A3E]">Facilities</span>
          </div>
          <div className="glass-card-light rounded-2xl p-6 text-center">
            <span className="text-3xl font-extrabold text-[#0A2E12] md:text-4xl">40%</span>
            <span className="mt-1 block text-sm font-medium text-[#3D5A3E]">Avg. Utilization Boost</span>
          </div>
          <div className="glass-card-light rounded-2xl p-6 text-center">
            <span className="text-3xl font-extrabold text-[#0A2E12] md:text-4xl">2,400+</span>
            <span className="mt-1 block text-sm font-medium text-[#3D5A3E]">Matches Managed</span>
          </div>
          <div className="glass-card-light rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-extrabold text-[#0A2E12] md:text-4xl">4.9</span>
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
            </div>
            <span className="mt-1 block text-sm font-medium text-[#3D5A3E]">Venue Rating</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="glass-card-light rounded-2xl p-6">
            <div className="mb-4 flex gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-sm leading-relaxed text-[#3D5A3E] italic">&ldquo;We replaced the paper sign-up sheet and our court utilization went up 40%. Players love the automatic rotation.&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm bg-blue-100 text-blue-600">D</div>
              <div><span className="block text-sm font-semibold text-[#0A2E12]">David R.</span><span className="block text-xs text-[#3D5A3E]">Rec Center Manager</span></div>
            </div>
          </div>
          <div className="glass-card-light rounded-2xl p-6">
            <div className="mb-4 flex gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-sm leading-relaxed text-[#3D5A3E] italic">&ldquo;The insurance integration alone was worth it. We used to spend hours chasing waivers. Now it&apos;s all handled before anyone steps on a court.&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm bg-emerald-100 text-emerald-600">L</div>
              <div><span className="block text-sm font-semibold text-[#0A2E12]">Linda K.</span><span className="block text-xs text-[#3D5A3E]">YMCA Program Director</span></div>
            </div>
          </div>
          <div className="glass-card-light rounded-2xl p-6">
            <div className="mb-4 flex gap-1">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-sm leading-relaxed text-[#3D5A3E] italic">&ldquo;I can finally see which sports and time slots are actually popular. We rescheduled our open play hours and doubled attendance.&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm bg-amber-100 text-amber-600">M</div>
              <div><span className="block text-sm font-semibold text-[#0A2E12]">Marcus J.</span><span className="block text-xs text-[#3D5A3E]">Community Center Director</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* How Setup Works */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">Go Live in Under 30 Minutes</h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">No IT department required</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative"><div className="glass rounded-2xl p-8">
            <span className="text-5xl font-black text-emerald-500/20">01</span>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15"><Settings className="h-5 w-5 text-white" /></div>
              <h3 className="text-xl font-bold text-[#0A2E12]">Create Your Venue</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#3D5A3E]">Sign up, add your logo, address, hours, and the sports you offer. Takes about five minutes.</p>
          </div></div>
          <div className="relative"><div className="glass rounded-2xl p-8">
            <span className="text-5xl font-black text-emerald-500/20">02</span>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15"><Smartphone className="h-5 w-5 text-white" /></div>
              <h3 className="text-xl font-bold text-[#0A2E12]">Configure Your Courts</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#3D5A3E]">Name your courts, set sport types and match durations. Customize rotation rules and kiosk display preferences.</p>
          </div></div>
          <div className="relative"><div className="glass rounded-2xl p-8">
            <span className="text-5xl font-black text-emerald-500/20">03</span>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/15"><Rocket className="h-5 w-5 text-white" /></div>
              <h3 className="text-xl font-bold text-[#0A2E12]">Launch</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#3D5A3E]">Put an iPad at the front desk in kiosk mode. Share the link with your members. Players start checking in immediately.</p>
          </div></div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[#0A2E12] md:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-[#3D5A3E]">List your venue for free. Upgrade when your facility grows.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm p-8">
            <h3 className="text-xl font-bold text-[#0A2E12]">Starter</h3>
            <div className="mt-2"><span className="text-4xl font-extrabold text-[#0A2E12]">Free</span></div>
            <p className="mt-2 text-sm text-[#3D5A3E]">Get your venue on the platform at zero cost</p>
            <ul className="mt-6 space-y-3">
              {["Up to 4 courts", "Player board & check-in", "Basic match timers", "Digital waivers", "Community support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#2D4A30]"><CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />{f}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition active:scale-[0.98] border border-[#0A2E12]/10 bg-white text-[#2D4A30] hover:bg-[#0A2E12]/[0.03]">Get Started Free</Link>
          </div>
          <div className="rounded-2xl border border-emerald-500 bg-white shadow-xl shadow-emerald-500/10 p-8">
            <div className="mb-4 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">Most Popular</div>
            <h3 className="text-xl font-bold text-[#0A2E12]">Pro</h3>
            <div className="mt-2"><span className="text-4xl font-extrabold text-[#0A2E12]">$49</span><span className="text-[#3D5A3E]">/month</span></div>
            <p className="mt-2 text-sm text-[#3D5A3E]">For active venues that want the full toolkit</p>
            <ul className="mt-6 space-y-3">
              {["Unlimited courts", "All Starter features", "Admin analytics dashboard", "iPad kiosk mode", "Insurance revenue share ($2-$10/player)", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#2D4A30]"><CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />{f}</li>
              ))}
            </ul>
            <Link href="/onboarding" className="mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition active:scale-[0.98] bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-500">Start Free Trial</Link>
          </div>
          <div className="rounded-2xl border border-[#0A2E12]/10 bg-white shadow-sm p-8">
            <h3 className="text-xl font-bold text-[#0A2E12]">Enterprise</h3>
            <div className="mt-2"><span className="text-4xl font-extrabold text-[#0A2E12]">Custom</span></div>
            <p className="mt-2 text-sm text-[#3D5A3E]">For multi-location organizations</p>
            <ul className="mt-6 space-y-3">
              {["Everything in Pro", "Multi-venue management", "Custom branding", "API access", "Dedicated account manager", "SSO / SAML"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#2D4A30]"><CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />{f}</li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition active:scale-[0.98] border border-[#0A2E12]/10 bg-white text-[#2D4A30] hover:bg-[#0A2E12]/[0.03]">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative mx-auto max-w-4xl px-6 pb-16">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          <div className="flex items-center gap-3 text-[#3D5A3E]"><BadgeCheck className="h-6 w-6 text-emerald-500" /><span className="text-sm font-semibold uppercase tracking-wider">Licensed</span></div>
          <div className="flex items-center gap-3 text-[#3D5A3E]"><Lock className="h-6 w-6 text-emerald-500" /><span className="text-sm font-semibold uppercase tracking-wider">Secure Payments</span></div>
          <div className="flex items-center gap-3 text-[#3D5A3E]"><Building2 className="h-6 w-6 text-emerald-500" /><span className="text-sm font-semibold uppercase tracking-wider">500+ Facilities</span></div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-2xl shadow-emerald-500/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Your Courts Are Sitting Empty Right Now</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">Every hour without players is revenue you won&apos;t get back. List your venue for free and let Lawnbowling fill those courts with matched, insured players.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="https://dailyeventinsurance.com/m/lawnbowling/quote/new" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-[#0A2E12]/5 active:scale-[0.98]">
              Get Free Coverage
              <ExternalLink className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link href="/contact" className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]">Schedule a Demo</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0A2E12]/10 bg-[#0A2E12]/[0.03]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"><CircleDot className="h-4 w-4 text-[#1B5E20]" /></div>
            <span className="font-semibold text-[#0A2E12]">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#3D5A3E]">
            <Link href="/for-players" className="hover:text-[#2D4A30] transition">For Players</Link>
            <Link href="/insurance" className="hover:text-[#2D4A30] transition">Insurance</Link>
            <Link href="/about" className="hover:text-[#2D4A30] transition">About</Link>
            <Link href="/faq" className="hover:text-[#2D4A30] transition">FAQ</Link>
            <Link href="/terms" className="hover:text-[#2D4A30] transition">Terms</Link>
            <Link href="/privacy" className="hover:text-[#2D4A30] transition">Privacy</Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">&copy; {new Date().getFullYear()} Lawnbowling</span>
        </div>
      </footer>
    </div>
  );
}
