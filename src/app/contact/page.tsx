import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Pick a Partner",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-gradient">Pick a Partner</Link>
      </nav>
      <main className="mx-auto max-w-lg px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Contact Us</h1>
        <p className="text-zinc-400 mb-8">Have a question or want to bring Pick a Partner to your venue?</p>

        <form className="space-y-4" action="mailto:hello@pickapartner.app" method="GET">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Name</label>
            <input
              name="name"
              placeholder="Your name"
              className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">I am a...</label>
            <select
              name="type"
              className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="player">Player</option>
              <option value="venue">Venue Owner</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Message</label>
            <textarea
              name="body"
              placeholder="Tell us what's on your mind..."
              className="w-full rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            Send Message
          </button>
        </form>
      </main>
    </div>
  );
}
