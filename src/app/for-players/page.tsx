import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  ChevronRight,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  Zap,
  Trophy,
  Target,
  Calendar,
  UserCircle,
  Smartphone,
  Heart,
  Search,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Players | Lawnbowling",
  description:
    "Never play alone again. Lawnbowling matches you with players at your skill level, finds nearby courts, and handles scheduling. Pickleball, tennis, basketball, badminton, volleyball, and more.",
};

export default function ForPlayersPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9] overflow-hidden">
      {/* Floating glowing orbs */}
      <div
        className="orb orb-blue"
        style={{ top: "-5%", left: "-5%", width: "500px", height: "500px" }}
      />
      <div
        className="orb orb-emerald"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
        }}
      />
      <div
        className="orb orb-amber"
        style={{ top: "40%", right: "5%", width: "300px", height: "300px" }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] shadow-lg shadow-[#1B5E20]/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900">
              Lawnbowling
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/for-venues"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              For Venues
            </Link>
            <Link
              href="/insurance"
              className="hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              Insurance
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1B5E20]/15 transition hover:bg-[#1B5E20] hover:shadow-[#1B5E20]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1B5E20]/20 bg-[#1B5E20]/10 px-4 py-1.5">
            <Trophy className="h-4 w-4 text-[#1B5E20]" />
            <span className="text-sm font-medium text-[#1B5E20]">
              For Players
            </span>
          </div>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 md:text-7xl">
            Never Play{" "}
            <span className="text-gradient">Alone</span>{" "}
            Again
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
            You want to play, but your usual partner bailed. The courts near
            you might be packed, or empty, and you have no idea. Lawnbowling
            matches you with players at your skill level, shows you open courts
            nearby, and gets you playing in minutes -- not hours of texting
            group chats.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-[#1B5E20]/20 transition-all hover:shadow-[#1B5E20]/35 hover:scale-[1.02] active:scale-[0.98]"
            >
              Find Your Partner
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-8 py-4 text-lg font-semibold text-zinc-700 backdrop-blur transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Sports We Support */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Your Sport. Your Level. Your Schedule.
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Find partners for whatever you play
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { name: "Pickleball", emoji: "🏓", color: "bg-[#1B5E20]/5 border-[#1B5E20]/15 text-[#2E7D32]" },
            { name: "Tennis", emoji: "🎾", color: "bg-amber-50 border-amber-200 text-amber-700" },
            { name: "Basketball", emoji: "🏀", color: "bg-orange-50 border-orange-200 text-orange-700" },
            { name: "Badminton", emoji: "🏸", color: "bg-blue-50 border-blue-200 text-[#2E7D32]" },
            { name: "Volleyball", emoji: "🏐", color: "bg-purple-50 border-purple-200 text-purple-700" },
            { name: "Racquetball", emoji: "🎯", color: "bg-rose-50 border-rose-200 text-rose-700" },
          ].map((sport) => (
            <div
              key={sport.name}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-6 transition-all hover:shadow-md ${sport.color}`}
            >
              <span className="text-3xl">{sport.emoji}</span>
              <span className="text-sm font-semibold">{sport.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pain Points */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            We Get It. Finding Games Is Hard.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              problem: "Can't find people to play with",
              solution: "Our player board shows everyone who's available right now at venues near you. One tap to send a match request.",
              icon: Search,
              gradient: "from-[#1B5E20] to-indigo-500",
            },
            {
              problem: "Skill mismatches ruin the fun",
              solution: "Every player has a skill rating. You get matched with people at your level, so games are competitive and actually enjoyable.",
              icon: Target,
              gradient: "from-amber-500 to-orange-500",
            },
            {
              problem: "No idea where to play",
              solution: "Browse venues near you with real-time court availability. See which courts are open, which are packed, and walk right in.",
              icon: MapPin,
              gradient: "from-[#1B5E20] to-teal-500",
            },
          ].map((item) => (
            <div
              key={item.problem}
              className="group rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg`}
              >
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <p className="mb-3 text-base font-bold text-zinc-900">
                &ldquo;{item.problem}&rdquo;
              </p>
              <p className="text-sm leading-relaxed text-zinc-600">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Everything You Need to Play More
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            From finding a partner to stepping on court, we handle all of it
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Skill-Based Matching",
              desc: "Rate yourself from beginner to advanced. The system matches you with players at your level so every game is competitive.",
              gradient: "from-[#1B5E20] to-indigo-500",
              glow: "shadow-[#1B5E20]/15",
            },
            {
              icon: MapPin,
              title: "Court Finder",
              desc: "Browse venues near you with real-time court availability. Know before you drive whether there's a court waiting.",
              gradient: "from-[#1B5E20] to-teal-500",
              glow: "shadow-[#1B5E20]/15",
            },
            {
              icon: Calendar,
              title: "Schedule Games",
              desc: "Set your availability and let others find you. Or browse available players and send a match request on the spot.",
              gradient: "from-amber-500 to-orange-500",
              glow: "shadow-amber-500/15",
            },
            {
              icon: UserCircle,
              title: "Player Profiles",
              desc: "Build your sports profile with skill ratings, preferred sports, play style, and availability. Your reputation follows you.",
              gradient: "from-purple-500 to-pink-500",
              glow: "shadow-purple-500/15",
            },
            {
              icon: Trophy,
              title: "Leaderboards",
              desc: "Track your wins, climb the rankings at your local venue, and see how you stack up against other players in your area.",
              gradient: "from-rose-500 to-red-500",
              glow: "shadow-rose-500/15",
            },
            {
              icon: Shield,
              title: "Play Insured",
              desc: "Every game comes with per-participant liability coverage. Rolled ankles and strained shoulders happen. You're covered.",
              gradient: "from-teal-500 to-[#1B5E20]",
              glow: "shadow-teal-500/15",
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

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-24"
      >
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            From Couch to Court in 60 Seconds
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Three steps. That&apos;s it.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: Smartphone,
              title: "Open the App",
              desc: "Install the PWA on your phone (no app store needed) or walk up to the venue kiosk. Tap to check in and mark yourself as available.",
            },
            {
              step: "02",
              icon: Users,
              title: "Pick Your Partner",
              desc: "Browse available players filtered by sport and skill level. See their rating, play style, and how long they've been waiting. Tap to send a partner request.",
            },
            {
              step: "03",
              icon: Zap,
              title: "Hit the Court",
              desc: "Once matched, you're assigned a court automatically. A timer keeps things fair so everyone gets to play. Game on.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="glass rounded-2xl p-8">
                <span className="text-5xl font-black text-[#1B5E20]/20">
                  {item.step}
                </span>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-indigo-600 shadow-lg shadow-[#1B5E20]/15">
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

      {/* Insurance Pitch */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5">
                <Shield className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">
                  Built-In Coverage
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                Every Game Comes With Coverage.{" "}
                <span className="text-zinc-400">Play Worry-Free.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Rolled ankles. Strained shoulders. A bad collision at the net.
                It happens in every sport. With Lawnbowling, per-participant
                liability coverage activates the moment you check in and
                deactivates when you leave. No paperwork, no separate app,
                no extra cost to stress about.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  text: "Per-participant liability coverage",
                },
                {
                  icon: Heart,
                  text: "Activity injury medical expenses",
                },
                {
                  icon: Zap,
                  text: "Activates instantly at check-in",
                },
                {
                  icon: CheckCircle,
                  text: "Underwritten by AIG, Lloyd's of London, Great American",
                },
                {
                  icon: Star,
                  text: "No forms, no phone calls, no waiting",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                    <item.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <span className="font-medium text-zinc-800">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
            Players Are Loving It
          </h2>
        </div>

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
                "No more awkward lobby small-talk trying to find a doubles partner. I just check in and tap -- matched in seconds.",
              name: "Sarah M.",
              role: "Pickleball Player",
              avatarBg: "bg-[#1B5E20]/10 text-[#1B5E20]",
            },
            {
              quote:
                "The skill-level matching is what sold me. I always get paired with someone at my level so games are actually competitive.",
              name: "Marcus T.",
              role: "Tennis Player",
              avatarBg: "bg-amber-100 text-amber-600",
            },
            {
              quote:
                "I moved to a new city and didn't know anyone who played. Within a week I had a regular group of four for Tuesday night pickleball.",
              name: "Jenny L.",
              role: "Badminton & Pickleball",
              avatarBg: "bg-blue-100 text-[#1B5E20]",
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

      {/* Device Showcase */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="glass-card-light rounded-3xl p-8 md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
                <Smartphone className="h-4 w-4 text-[#1B5E20]" />
                <span className="text-sm font-medium text-[#2E7D32]">
                  No Download Required
                </span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">
                Install It Like an App.{" "}
                <span className="text-zinc-400">Without the App Store.</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600">
                Lawnbowling is a PWA -- a progressive web app that installs
                directly to your home screen. No downloads, no updates, no
                storage eaten up. Works on iPhone, Android, and iPad. Open it
                and you&apos;re playing in seconds.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Tap 'Add to Home Screen' to install",
                  "Works offline with cached data",
                  "Push notifications for match requests",
                  "Feels native, updates automatically",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-zinc-600"
                  >
                    <CheckCircle className="h-5 w-5 text-[#1B5E20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              {/* Phone mockup */}
              <div className="relative">
                <div className="h-72 w-40 rounded-3xl border border-zinc-300 bg-zinc-100 p-2 shadow-2xl md:h-80 md:w-44">
                  <div className="flex h-full flex-col rounded-2xl bg-white">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
                      <span className="text-xs font-bold text-[#1B5E20]">
                        Lawnbowling
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="live-dot" />
                        <span className="text-[8px] text-zinc-500">Live</span>
                      </span>
                    </div>
                    <div className="flex-1 space-y-2 p-2.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-2"
                        >
                          <div className="h-6 w-6 rounded-full bg-zinc-300 shrink-0" />
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-16 rounded-full bg-zinc-300" />
                            <div className="h-1 w-10 rounded-full bg-[#1B5E20]" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-zinc-100 px-3 py-2">
                      <div className="h-6 w-full rounded-lg bg-[#1B5E20] flex items-center justify-center">
                        <span className="text-[7px] font-bold text-white">Find Partner</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#1B5E20] to-indigo-600 p-8 text-center shadow-2xl shadow-[#1B5E20]/15 md:p-16">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Your Next Game Is Waiting
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/80">
            Stop scrolling through group chats. Stop showing up and hoping
            someone&apos;s there. Sign up, check in, and get matched with
            players who actually want to play -- right now.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-[#2E7D32] shadow-lg transition hover:bg-zinc-100 active:scale-[0.98]"
            >
              Find Your Partner
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/signup"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:border-white/60 hover:bg-white/10 active:scale-[0.98]"
            >
              Download the App
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#1B5E20]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/for-venues" className="hover:text-zinc-700 transition">
              For Venues
            </Link>
            <Link href="/insurance" className="hover:text-zinc-700 transition">
              Insurance
            </Link>
            <Link href="/about" className="hover:text-zinc-700 transition">
              About
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
          </div>
          <span className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
