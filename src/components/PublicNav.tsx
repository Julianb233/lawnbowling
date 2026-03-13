"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { href: "/clubs", label: "Clubs" },
  { href: "/learn", label: "Learn" },
  { href: "/shop", label: "Shop" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

/**
 * Shared navigation bar for all public-facing pages (about, gallery, contact,
 * learn, faq, insurance, pricing, terms, privacy, for-players, for-venues).
 *
 * Two variants:
 *  - "transparent" (default): dark background with white text — used on the
 *    homepage hero.
 *  - "light": white/blur background with dark text — used on all other public
 *    pages.
 */
export function PublicNav({
  variant = "light",
}: {
  variant?: "transparent" | "light";
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isTransparent = variant === "transparent";

  return (
    <nav
      className={
        isTransparent
          ? "absolute top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl"
          : "sticky top-0 z-50 border-b border-[#0A2E12]/10 bg-white/80 backdrop-blur-xl"
      }
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/images/logo/bowls-icon.png"
            alt="Lawnbowling logo"
            width={36}
            height={36}
            className="rounded-full shadow-lg object-cover"
          />
          <span
            className={
              isTransparent
                ? "text-base font-bold text-white sm:text-lg"
                : "text-base font-bold text-[#0A2E12] sm:text-lg"
            }
          >
            Lawnbowling
          </span>
        </Link>

        {/* Desktop links */}
        <div className="flex items-center gap-2 sm:gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isTransparent
                  ? "hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition hover:text-white"
                  : "hidden sm:block rounded-lg px-4 py-2 text-sm font-medium text-[#3D5A3E] transition hover:text-[#0A2E12]"
              }
            >
              {link.label}
            </Link>
          ))}

          {/* CTA */}
          <Link
            href="/signup"
            className={
              isTransparent
                ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1B5E20] shadow-lg transition hover:bg-[#0A2E12]/[0.03] sm:px-5 sm:py-2.5"
                : "rounded-xl bg-[#1B5E20] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-900/15 transition hover:bg-[#2E7D32] hover:shadow-green-900/25 sm:px-5 sm:py-2.5"
            }
          >
            Get Started
          </Link>

          {/* Hamburger button — visible only on mobile */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className={
              isTransparent
                ? "sm:hidden flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
                : "sm:hidden flex h-10 w-10 items-center justify-center rounded-lg text-[#0A2E12] transition hover:bg-[#0A2E12]/5"
            }
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile full-screen overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white sm:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex h-full flex-col"
            >
              {/* Header with close button */}
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/logo/bowls-icon.png"
                    alt="Lawnbowling logo"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                  <span className="text-base font-bold text-[#0A2E12]">
                    Lawnbowling
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-[#2D4A30] transition hover:bg-[#0A2E12]/5"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex flex-1 flex-col justify-center px-6">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-4 py-4 text-lg font-semibold text-[#0A2E12] transition hover:bg-[#0A2E12]/5"
                      style={{ minHeight: 48, fontSize: 18 }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-4 text-lg font-semibold text-[#0A2E12] transition hover:bg-[#0A2E12]/5"
                    style={{ minHeight: 48, fontSize: 18 }}
                  >
                    Sign In
                  </Link>
                </div>

                {/* Get Started button */}
                <div className="mt-8">
                  <Link
                    href="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full rounded-xl bg-[#1B5E20] px-6 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-[#1B5E20]/90"
                    style={{ minHeight: 48, fontSize: 18 }}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
