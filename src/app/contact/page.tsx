import Link from "next/link";
import type { Metadata } from "next";
import { Users, Mail } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";

export const metadata: Metadata = {
  title: "Contact | Lawnbowling",
  description:
    "Get in touch with the Lawnbowling team. Questions about the platform, venue setup, or partnerships — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <PublicNav />

      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B5E20]/10">
            <Mail className="h-6 w-6 text-[#1B5E20]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Contact Us</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Have a question or want to bring Lawnbowling to your venue?
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          action="mailto:hello@lawnbowl.app"
          method="GET"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Name
            </label>
            <input
              name="name"
              placeholder="Your name"
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              I am a...
            </label>
            <select
              name="type"
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            >
              <option value="player">Player</option>
              <option value="venue">Venue Owner</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Message
            </label>
            <textarea
              name="body"
              placeholder="Tell us what's on your mind..."
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 resize-none h-32 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#1B5E20] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#1B5E20]/15 hover:shadow-[#1B5E20]/25 transition-all"
          >
            Send Message
          </button>
        </form>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 dark:bg-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#1B5E20]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
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
