import Link from "next/link";
import type { Metadata } from "next";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Lawnbowling",
  description:
    "Privacy Policy for Lawnbowling. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#1B5E20] shadow-lg shadow-[#1B5E20]/15">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
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
          Privacy Policy
        </h1>
        <div className="prose prose-zinc max-w-none space-y-6 text-zinc-600 text-sm leading-relaxed">
          <p>Last updated: March 10, 2026</p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide: name, email, profile details,
            sports preferences, and match data. We also collect usage data such
            as check-in times, match history, and device information.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to: provide the Service, match you with
            partners, display statistics, send notifications, and improve the
            platform. Venue owners see aggregated analytics data.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            3. Data Sharing
          </h2>
          <p>
            Your profile is visible to other players at your venue by default
            (configurable in Settings). We do not sell personal data to third
            parties. Venue administrators can see player check-in data and match
            history for their venue.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            4. Data Security
          </h2>
          <p>
            We use industry-standard security measures including encryption,
            secure authentication, and Row-Level Security to protect your data.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            5. Your Rights
          </h2>
          <p>
            You can: view and edit your profile, control privacy settings, export
            your data, and delete your account at any time. We comply with GDPR,
            CCPA, and other applicable privacy regulations.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            6. Cookies
          </h2>
          <p>
            We use essential cookies for authentication and session management.
            We do not use tracking cookies or third-party advertising cookies.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            7. Data Retention
          </h2>
          <p>
            We retain your data while your account is active. When you delete
            your account, all personal data is permanently removed within 30
            days.
          </p>

          <h2 className="text-xl font-semibold text-zinc-900 mt-8">
            8. Contact
          </h2>
          <p>
            For privacy questions or data requests,{" "}
            <Link href="/contact" className="text-[#1B5E20] hover:text-[#1B5E20] underline">
              contact us
            </Link>
            .
          </p>
        </div>
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
