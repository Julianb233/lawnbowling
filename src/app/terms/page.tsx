import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Pick a Partner",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-gradient">Pick a Partner</Link>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Last updated: March 10, 2026</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">1. Acceptance of Terms</h2>
          <p>By accessing and using Pick a Partner ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">2. Description of Service</h2>
          <p>Pick a Partner is a real-time sports partner matching platform for recreational venues. The Service allows players to check in, find partners, schedule games, and track match statistics.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account. You agree to provide accurate information and to update it as necessary. You must be at least 13 years of age to use the Service.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">4. Acceptable Use</h2>
          <p>You agree not to: harass or abuse other users, create false accounts, interfere with the Service, use the Service for illegal purposes, or attempt to gain unauthorized access to any part of the Service.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">5. Content</h2>
          <p>Users are responsible for content they submit, including profile information, reviews, and messages. We reserve the right to remove content that violates these terms.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">6. Venue Partnerships</h2>
          <p>Venues using Pick a Partner are responsible for their own operations, safety procedures, and compliance with local regulations. The Service does not replace venue-specific waivers or safety protocols.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">7. Limitation of Liability</h2>
          <p>Pick a Partner is provided "as is" without warranties of any kind. We are not liable for any injuries, damages, or losses resulting from use of the Service or participation in sports activities.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">8. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time through the Settings page.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">9. Changes</h2>
          <p>We may update these terms from time to time. Continued use of the Service constitutes acceptance of updated terms.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">10. Contact</h2>
          <p>For questions about these terms, please contact us through the Contact page.</p>
        </div>
      </main>
    </div>
  );
}
