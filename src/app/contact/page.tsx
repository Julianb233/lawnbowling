import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import bowlsIconImg from "@/../public/images/logo/bowls-icon.png";

export const metadata: Metadata = {
  title: "Contact | Lawnbowling",
  description:
    "Get in touch with the Lawnbowling team. Questions about the platform, venue setup, or partnerships — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FEFCF9]">
      <PublicNav />

      <main className="mx-auto max-w-6xl px-6 py-14 sm:py-20 md:py-28">
        <div className="mb-12 text-center">
          <h1
            className="text-4xl font-bold text-[#0A2E12] sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-[#3D5A3E] max-w-xl mx-auto">
            Have a question or want to bring Lawnbowling to your venue? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Form — 2 columns wide */}
          <div className="md:col-span-2">
            <form
              className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 sm:p-8 shadow-sm space-y-5"
              action="mailto:hello@lawnbowl.app"
              method="GET"
            >
              {/* Inquiry Type — Radio Buttons */}
              <div>
                <label className="block text-sm font-semibold text-[#0A2E12] mb-3">
                  I am a...
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "player", label: "Player" },
                    { value: "club", label: "Club Director" },
                    { value: "venue", label: "Venue Owner" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="inline-flex items-center gap-2 rounded-full border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-2 text-sm text-[#2D4A30] cursor-pointer hover:border-[#1B5E20]/30 hover:bg-[#1B5E20]/5 transition-all has-[:checked]:border-[#1B5E20] has-[:checked]:bg-[#1B5E20]/10 has-[:checked]:text-[#1B5E20] has-[:checked]:font-semibold"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        defaultChecked={option.value === "player"}
                        className="h-3.5 w-3.5 accent-[#1B5E20]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-[#0A2E12] mb-1.5">
                    Name
                  </label>
                  <input
                    name="name"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/60 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0A2E12] mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/60 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A2E12] mb-1.5">
                  Subject
                </label>
                <input
                  name="subject"
                  placeholder="What can we help with?"
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/60 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A2E12] mb-1.5">
                  Message
                </label>
                <textarea
                  name="body"
                  placeholder="Tell us what's on your mind..."
                  className="w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] px-4 py-3 text-sm text-[#0A2E12] placeholder:text-[#3D5A3E]/60 resize-none h-36 focus:outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#1B5E20] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#1B5E20]/15 hover:bg-[#145218] hover:shadow-[#1B5E20]/25 transition-all active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Sidebar — Support Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#0A2E12]/10 bg-white p-6 shadow-sm">
              <h3
                className="text-lg font-bold text-[#0A2E12] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Support Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10 shrink-0">
                    <Mail className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#0A2E12]">Email</span>
                    <span className="block text-sm text-[#3D5A3E]">hello@lawnbowl.app</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10 shrink-0">
                    <Clock className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#0A2E12]">Response Time</span>
                    <span className="block text-sm text-[#3D5A3E]">Within 24 hours</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E20]/10 shrink-0">
                    <MapPin className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#0A2E12]">Location</span>
                    <span className="block text-sm text-[#3D5A3E]">United States</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#B8860B]/20 bg-[#B8860B]/5 p-6">
              <h3
                className="text-lg font-bold text-[#0A2E12] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                For Clubs
              </h3>
              <p className="text-sm text-[#3D5A3E] leading-relaxed">
                Looking to set up Lawnbowling at your club? We offer free onboarding
                calls to help you get started in under 30 minutes.
              </p>
              <Link
                href="/for-venues"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1B5E20] hover:text-[#145218] transition"
              >
                Learn more about club features
              </Link>
            </div>
          </div>
        </div>
      </main>

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
            <Link href="/about" className="hover:text-[#0A2E12] transition">
              About
            </Link>
            <Link href="/faq" className="hover:text-[#0A2E12] transition">
              FAQ
            </Link>
            <Link href="/terms" className="hover:text-[#0A2E12] transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#0A2E12] transition">
              Privacy
            </Link>
          </div>
          <span className="text-sm text-[#3D5A3E]">
            &copy; {new Date().getFullYear()} Lawnbowling
          </span>
        </div>
      </footer>
    </div>
  );
}
