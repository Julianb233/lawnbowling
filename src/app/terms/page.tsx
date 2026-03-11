import Link from "next/link";
import type { Metadata } from "next";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Lawnbowling",
  description:
    "Terms of Service for Lawnbowling, the real-time player board for recreational sports.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
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
              href="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900"
            >
              About
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

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">
          Terms of Service
        </h1>
        <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 text-sm leading-relaxed">
          <p>Last updated: March 10, 2026</p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Lawnbowling (&ldquo;the Service&rdquo;),
            you agree to be bound by these Terms of Service. If you do not
            agree, do not use the Service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            2. Description of Service
          </h2>
          <p>
            Lawnbowling is a real-time sports partner matching platform for
            recreational venues. The Service allows players to check in, find
            partners, schedule games, and track match statistics.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            3. User Accounts
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account. You agree to provide accurate information and to update it
            as necessary. You must be at least 13 years of age to use the
            Service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            4. Acceptable Use
          </h2>
          <p>
            You agree not to: harass or abuse other users, create false
            accounts, interfere with the Service, use the Service for illegal
            purposes, or attempt to gain unauthorized access to any part of the
            Service.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            5. Content
          </h2>
          <p>
            Users are responsible for content they submit, including profile
            information, reviews, and messages. We reserve the right to remove
            content that violates these terms.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            6. Venue Partnerships
          </h2>
          <p>
            Venues using Lawnbowling are responsible for their own operations,
            safety procedures, and compliance with local regulations. The Service
            does not replace venue-specific waivers or safety protocols.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            7. Limitation of Liability
          </h2>
          <p>
            Lawnbowling is provided &ldquo;as is&rdquo; without warranties of
            any kind. We are not liable for any injuries, damages, or losses
            resulting from use of the Service or participation in sports
            activities.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            8. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms. You may delete your account at any time through the
            Settings page.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            9. Changes
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the
            Service constitutes acceptance of updated terms.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            10. Contact
          </h2>
          <p>
            For questions about these terms, please{" "}
            <Link href="/contact" className="text-[#1B5E20] hover:text-[#1B5E20] underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1B5E20] to-[#1B5E20]">
              <Users className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-900">Lawnbowling</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
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
