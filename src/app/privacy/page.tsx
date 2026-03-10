import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Pick a Partner",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-gradient">Pick a Partner</Link>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-zinc max-w-none space-y-6 text-zinc-300 text-sm leading-relaxed">
          <p>Last updated: March 10, 2026</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">1. Information We Collect</h2>
          <p>We collect information you provide: name, email, profile details, sports preferences, and match data. We also collect usage data such as check-in times, match history, and device information.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to: provide the Service, match you with partners, display statistics, send notifications, and improve the platform. Venue owners see aggregated analytics data.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">3. Data Sharing</h2>
          <p>Your profile is visible to other players at your venue by default (configurable in Settings). We do not sell personal data to third parties. Venue administrators can see player check-in data and match history for their venue.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">4. Data Security</h2>
          <p>We use industry-standard security measures including encryption, secure authentication, and Row-Level Security to protect your data.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">5. Your Rights</h2>
          <p>You can: view and edit your profile, control privacy settings, export your data, and delete your account at any time. We comply with GDPR, CCPA, and other applicable privacy regulations.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">7. Data Retention</h2>
          <p>We retain your data while your account is active. When you delete your account, all personal data is permanently removed within 30 days.</p>

          <h2 className="text-xl font-semibold text-zinc-100 mt-8">8. Contact</h2>
          <p>For privacy questions or data requests, contact us through the Contact page.</p>
        </div>
      </main>
    </div>
  );
}
