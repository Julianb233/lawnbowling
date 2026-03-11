"use client";

import React, { ReactNode } from "react";

/**
 * KioskLayout — shared layout component for all kiosk views.
 *
 * Enforces elderly-friendly design tokens (WCAG AAA):
 * - Minimum 56px touch targets, 72px preferred for primary actions
 * - 32px+ headings, 18px+ body text, nothing below 16px
 * - WCAG AAA contrast (7:1 ratio) using "The Bowling Green" palette
 * - Brand color #1B5E20 (dark bowling green)
 * - All values driven by CSS custom properties (--kiosk-*)
 */

interface KioskLayoutProps {
  children: ReactNode;
  venueName?: string;
  subtitle?: string;
  /** Active nav tab */
  activeTab?: "checkin" | "board";
  onTabChange?: (tab: "checkin" | "board") => void;
  playerCount?: number;
}

export function KioskLayout({
  children,
  venueName,
  subtitle,
  activeTab,
  onTabChange,
  playerCount,
}: KioskLayoutProps) {
  return (
    <div
      className="kiosk-mode min-h-screen"
      style={{
        backgroundColor: "var(--kiosk-bg)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        letterSpacing: "var(--kiosk-letter-spacing)",
      }}
    >
      {/* Header */}
      <header
        className="border-b-2 px-8 py-5"
        style={{ borderColor: "#E0E0E0", backgroundColor: "var(--kiosk-surface)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-black"
              style={{
                fontSize: "40px",
                lineHeight: "1.2",
                color: "var(--kiosk-text)",
              }}
            >
              {venueName || "Lawn Bowling Club"}
            </h1>
            {subtitle && (
              <p
                className="mt-1 font-medium"
                style={{
                  fontSize: "var(--kiosk-text-body)",
                  color: "var(--kiosk-text-secondary)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation tabs */}
          {onTabChange && (
            <nav className="flex gap-4" role="tablist" aria-label="Kiosk navigation">
              <button
                role="tab"
                aria-selected={activeTab === "checkin"}
                onClick={() => onTabChange("checkin")}
                className="rounded-2xl px-10 font-bold touch-manipulation transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                style={{
                  minHeight: "var(--kiosk-touch-target-primary)",
                  fontSize: "22px",
                  backgroundColor: activeTab === "checkin" ? "var(--kiosk-primary)" : "#F0F0F0",
                  color: activeTab === "checkin" ? "var(--kiosk-on-primary)" : "var(--kiosk-text)",
                  border: activeTab === "checkin" ? "3px solid var(--kiosk-primary-dark)" : "3px solid transparent",
                }}
              >
                Check In
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "board"}
                onClick={() => onTabChange("board")}
                className="rounded-2xl px-10 font-bold touch-manipulation transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                style={{
                  minHeight: "var(--kiosk-touch-target-primary)",
                  fontSize: "22px",
                  backgroundColor: activeTab === "board" ? "var(--kiosk-primary)" : "#F0F0F0",
                  color: activeTab === "board" ? "var(--kiosk-on-primary)" : "var(--kiosk-text)",
                  border: activeTab === "board" ? "3px solid var(--kiosk-primary-dark)" : "3px solid transparent",
                }}
              >
                Board{playerCount !== undefined ? ` (${playerCount})` : ""}
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="p-8" role="main">
        {children}
      </main>
    </div>
  );
}

/**
 * KioskButton — large, accessible button for kiosk primary actions.
 * Minimum 72px tall, 22px+ text, WCAG AAA contrast.
 */
interface KioskButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  fullWidth?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function KioskButton({
  children,
  onClick,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  ariaLabel,
  className = "",
}: KioskButtonProps) {
  const baseStyles: React.CSSProperties = {
    minHeight: "var(--kiosk-touch-target-primary)",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "var(--kiosk-letter-spacing)",
    lineHeight: "1.4",
    borderRadius: "var(--kiosk-card-radius)",
    padding: "16px 32px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "transform 0.1s ease, background-color 0.15s ease, box-shadow 0.15s ease",
    width: fullWidth ? "100%" : "auto",
    border: "none",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--kiosk-primary)",
      color: "var(--kiosk-on-primary)",
    },
    secondary: {
      backgroundColor: "#F0F0F0",
      color: "var(--kiosk-text)",
      border: "2px solid #CCCCCC",
    },
    danger: {
      backgroundColor: "var(--kiosk-error)",
      color: "var(--kiosk-on-primary)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--kiosk-primary)",
      border: "3px solid var(--kiosk-primary)",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`touch-manipulation active:scale-[0.97] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2 ${className}`}
      style={{ ...baseStyles, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
}

/**
 * KioskHeading — accessible heading with enforced minimum sizes.
 * Uses kiosk CSS custom properties for consistent sizing.
 */
interface KioskHeadingProps {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function KioskHeading({ level = 1, children, className = "", align = "center" }: KioskHeadingProps) {
  const sizes: Record<number, string> = {
    1: "var(--kiosk-text-heading)",
    2: "var(--kiosk-text-subheading)",
    3: "var(--kiosk-text-subheading)",
  };

  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return (
    <Tag
      className={`font-bold ${className}`}
      style={{
        fontSize: sizes[level],
        lineHeight: "1.3",
        color: "var(--kiosk-text)",
        textAlign: align,
        letterSpacing: "var(--kiosk-letter-spacing)",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * KioskText — body text with enforced minimum 16px, recommended 18px+.
 * Uses kiosk CSS custom properties.
 */
interface KioskTextProps {
  children: ReactNode;
  size?: "body" | "label" | "caption";
  color?: "primary" | "secondary";
  className?: string;
  align?: "left" | "center" | "right";
}

export function KioskText({
  children,
  size = "body",
  color = "primary",
  className = "",
  align = "left",
}: KioskTextProps) {
  const sizes: Record<string, string> = {
    body: "var(--kiosk-text-body)",
    label: "var(--kiosk-text-label)",
    caption: "var(--kiosk-text-caption)",
  };

  const colors: Record<string, string> = {
    primary: "var(--kiosk-text)",
    secondary: "var(--kiosk-text-secondary)",
  };

  return (
    <p
      className={className}
      style={{
        fontSize: sizes[size],
        lineHeight: "var(--kiosk-line-height)",
        color: colors[color],
        textAlign: align,
        letterSpacing: "var(--kiosk-letter-spacing)",
      }}
    >
      {children}
    </p>
  );
}
