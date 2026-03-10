import Link from "next/link";
import {
  Users,
  Zap,
  Shield,
  Timer,
  Smartphone,
  Trophy,
  MapPin,
  Star,
  CheckCircle,
} from "lucide-react";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { SportsSlideshow } from "@/components/home/SportsSlideshow";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation — overlays hero */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Pick a Partner
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/for-venues"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              For Venues
            </Link>
            <Link
              href="/for-players"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              For Players
            </Link>
            <Link
              href="/insurance"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
            >
              Insurance
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
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

      {/* Hero with background image slideshow */}
      <HeroSlideshow />

      {/* Sports Slideshow — detailed sport cards */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Sports We Support
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Swipe through our supported sports — more added all the time
          </p>
        </div>
        <SportsSlideshow />
      </section>

      {/* Sports Video Gallery */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            See the Action
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Real players, real courts, real fun
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Pickleball - Video */}
          <div className="group relative overflow-hidden rounded-2xl shadow-lg">
            <div className="aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                poster="/images/pickleball.jpg"
              >
                <source src="/images/pickleball.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-lg font-bold text-white drop-shadow-lg">
                Pickleball
              </span>
            </div>
          </div>

          {/* Tennis - Video */}
          <div className="group relative overflow-hidden rounded-2xl shadow-lg">
            <div className="aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                poster="/images/tennis.jpg"
              >
                <source src="/images/tennis.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-lg font-bold text-white drop-shadow-lg">
                Tennis
              </span>
            </div>
          </div>

          {/* Lawn Bowling - Photo with Ken Burns */}
          <div className="group relative overflow-hidden rounded-2xl shadow-lg">
            <div className="aspect-[4/3] relative">
              <img
                src="/images/lawn-bowling.jpg"
                alt="Person throwing a bocce ball on a green lawn"
                className="absolute inset-0 h-full w-full object-cover animate-[kenBurns_20s_ease_infinite_alternate]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-lg font-bold text-white drop-shadow-lg">
                Lawn Bowling
              </span>
            </div>
          </div>

          {/* Flag Football - Video */}
          <div className="group relative overflow-hidden rounded-2xl shadow-lg">
            <div className="aspect-[4/3] relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                poster="/images/flag-football.jpg"
              >
                <source src="/images/football.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-lg font-bold text-white drop-shadow-lg">
                Flag Football
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Trusted by Players & Venues
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Join the community making recreational sports simple
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
          {[
            { value: "500+", label: "Active Players" },
            { value: "12", label: "Partner Venues" },
            { value: "2,400+", label: "Matches Made" },
            { value: "4.9", label: "App Rating", icon: Star },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card-light rounded-2xl p-6 text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
                  {stat.value}
                </span>
                {stat.icon && (
                  <stat.icon className="h-6 w-6 text-amber-500 fill-amber-500" />
                )}
              </div>
              <span className="mt-1 block text-sm font-medium text-zinc-500">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "No more awkward lobby small-talk trying to find a doubles partner. I just check in and tap — matched in seconds.",
              name: "Sarah M.",
              role: "Pickleball Player",
              avatarBg: "bg-emerald-100 text-emerald-600",
            },
            {
              quote:
                "We replaced the paper sign-up sheet and our court utilization went up 40%. Players love the automatic rotation.",
              name: "David R.",
              role: "Rec Center Manager",
              avatarBg: "bg-blue-100 text-blue-600",
            },
            {
              quote:
                "The skill-level matching is what sold me. I always get paired with someone at my level so games are actually competitive.",
              name: "Marcus T.",
              role: "Tennis Player",
              avatarBg: "bg-amber-100 text-amber-600",
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="glass-card-light rounded-2xl p-6"
            >
              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 italic">
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
                  <span className="block text-xs text-zinc-500">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Everything You Need to Play
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            Built for rec centers, designed for players
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "Real-Time Board",
              desc: "See who's available right now. The board updates instantly as players check in and out.",
              gradient: "from-emerald-500 to-teal-500",
              glow: "shadow-emerald-500/20",
            },
            {
              icon: Users,
              title: "Pick & Match",
              desc: "Tap a player to send a partner request. Accept, decline, or let it expire — simple.",
              gradient: "from-blue-500 to-indigo-500",
              glow: "shadow-blue-500/20",
            },
            {
              icon: Timer,
              title: "Court Timers",
              desc: "Courts are assigned automatically. Match timers keep things moving so everyone plays.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/20",
            },
            {
              icon: Shield,
              title: "Waiver Built In",
              desc: "Digital liability waivers are signed before play. Logged, timestamped, fully compliant.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/20",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group glass-card-light rounded-2xl p-6 transition-all hover:shadow-lg"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-zinc-500">
            From check-in to court in under 60 seconds
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Check In",
              desc: "Walk up to the venue kiosk or open the app on your phone. Tap to mark yourself as available.",
              icon: MapPin,
            },
            {
              step: "02",
              title: "Pick a Partner",
              desc: "Browse available players filtered by sport and skill level. Tap someone to send a partner request.",
              icon: Users,
            },
            {
              step: "03",
              title: "Hit the Court",
              desc: "Once matched, you're assigned a court with a timer. Play your game, then free the court for the next pair.",
              icon: Trophy,
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="glass-card-light rounded-2xl p-8">
                <span className="text-5xl font-black text-emerald-500/15">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-zinc-900">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Device Showcase */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="glass-card-light rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Works Everywhere
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                iPad Kiosk.{" "}
                <span className="text-zinc-400">iPhone Personal.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Set up an iPad at the front desk as a shared check-in kiosk.
                Players can also use their own phones — install the PWA for an
                app-like experience with no download required.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Install via 'Add to Home Screen'",
                  "Works offline with cached data",
                  "iPad landscape kiosk mode",
                  "iPhone portrait personal mode",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-zinc-600"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              {/* Device mockup */}
              <div className="relative">
                {/* iPad */}
                <div className="h-64 w-80 rounded-2xl border border-zinc-200 bg-zinc-100 p-3 shadow-2xl md:h-72 md:w-96">
                  <div className="flex h-full flex-col rounded-xl bg-white">
                    <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
                      <span className="text-xs font-bold text-emerald-600">
                        Pick a Partner
                      </span>
                      <span className="ml-auto flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-[10px] text-zinc-500">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-zinc-100 bg-zinc-50 p-2"
                          >
                            <div className="mx-auto mb-1 h-6 w-6 rounded-full bg-zinc-300" />
                            <div className="mx-auto h-1.5 w-10 rounded-full bg-zinc-300" />
                            <div className="mx-auto mt-1 h-1 w-6 rounded-full bg-emerald-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Phone overlay */}
                <div className="absolute -bottom-6 -right-6 h-40 w-20 rounded-2xl border border-zinc-300 bg-zinc-100 p-1.5 shadow-2xl md:-right-8 md:h-48 md:w-24">
                  <div className="flex h-full flex-col rounded-xl bg-white">
                    <div className="border-b border-zinc-100 px-2 py-1">
                      <span className="text-[6px] font-bold text-emerald-600">
                        PaP
                      </span>
                    </div>
                    <div className="flex-1 space-y-1 p-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="rounded border border-zinc-100 bg-zinc-50 p-1"
                        >
                          <div className="h-1 w-full rounded-full bg-zinc-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Venue CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-2xl shadow-emerald-500/20 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Ready to modernize your venue?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/80">
            Pick a Partner replaces the clipboard sign-up sheet. No more
            confusion about who&apos;s next or who&apos;s available.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/for-venues"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-emerald-700 shadow-lg transition hover:bg-zinc-50 active:scale-[0.98]"
            >
              Learn More
            </Link>
            <Link
              href="/contact"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Pick a Partner</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/about" className="hover:text-zinc-700 transition">
              About
            </Link>
            <Link href="/for-venues" className="hover:text-zinc-700 transition">
              For Venues
            </Link>
            <Link href="/for-players" className="hover:text-zinc-700 transition">
              For Players
            </Link>
            <Link href="/insurance" className="hover:text-zinc-700 transition">
              Insurance
            </Link>
            <Link href="/faq" className="hover:text-zinc-700 transition">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-zinc-700 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-zinc-700 transition">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-zinc-700 transition">
              Contact
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
