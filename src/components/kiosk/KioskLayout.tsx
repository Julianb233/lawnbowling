"use client";

import React, { ReactNode } from "react";

/**
 * KioskLayout — shared layout component for all kiosk views.
 *
 * Enforces elderly-friendly design tokens:
 * - Minimum 56px touch targets, 72px preferred for primary actions
 * - 32px+ headings, 18px+ body text, nothing below 16px
 * - WCAG AAA contrast (7:1 ratio) using "The Bowling Green" palette
 * - Brand color #1B5E20 (dark bowling green)
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
      className="min-h-screen"
      style={{
        backgroundColor: "#FAFAF5",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        letterSpacing: "0.01em",
      }}
    >
      {/* Header */}
      <header
        className="border-b-2 px-8 py-5"
        style={{ borderColor: "#E0E0E0", backgroundColor: "#FFFFFF" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-black"
              style={{ fontSize: "36px", lineHeight: "1.2", color: "#1A1A1A" }}
            >
              {venueName || "Lawn Bowling Club"}
            </h1>
            {subtitle && (
              <p
                className="mt-1 font-medium"
                style={{ fontSize: "18px", color: "#4A4A4A" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation tabs */}
          {onTabChange && (
            <nav className="flex gap-3" role="tablist" aria-label="Kiosk navigation">
              <button
                role="tab"
                aria-selected={activeTab === "checkin"}
                onClick={() => onTabChange("checkin")}
                className="rounded-2xl px-8 font-bold touch-manipulation transition-colors"
                style={{
                  minHeight: "64px",
                  fontSize: "20px",
                  backgroundColor: activeTab === "checkin" ? "#1B5E20" : "#F0F0F0",
                  color: activeTab === "checkin" ? "#FFFFFF" : "#1A1A1A",
                  border: activeTab === "checkin" ? "3px solid #0D3B12" : "3px solid transparent",
                }}
              >
                Check In
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "board"}
                onClick={() => onTabChange("board")}
                className="rounded-2xl px-8 font-bold touch-manipulation transition-colors"
                style={{
                  minHeight: "64px",
                  fontSize: "20px",
                  backgroundColor: activeTab === "board" ? "#1B5E20" : "#F0F0F0",
                  color: activeTab === "board" ? "#FFFFFF" : "#1A1A1A",
                  border: activeTab === "board" ? "3px solid #0D3B12" : "3px solid transparent",
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
 * Minimum 72px tall, 20px+ text, WCAG AAA contrast.
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
    minHeight: "72px",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "0.01em",
    lineHeight: "1.4",
    borderRadius: "16px",
    padding: "16px 32px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "transform 0.1s ease, background-color 0.15s ease, box-shadow 0.15s ease",
    width: fullWidth ? "100%" : "auto",
    border: "none",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "#1B5E20",
      color: "#FFFFFF",
    },
    secondary: {
      backgroundColor: "#F0F0F0",
      color: "#1A1A1A",
      border: "2px solid #CCCCCC",
    },
    danger: {
      backgroundColor: "#991B1B",
      color: "#FFFFFF",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#1B5E20",
      border: "3px solid #1B5E20",
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`touch-manipulation active:scale-[0.97] ${className}`}
      style={{ ...baseStyles, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
}

/**
 * KioskHeading — accessible heading with enforced minimum sizes.
 */
interface KioskHeadingProps {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function KioskHeading({ level = 1, children, className = "", align = "center" }: KioskHeadingProps) {
  const sizes: Record<number, string> = {
    1: "36px",
    2: "32px",
    3: "32px",
  };

  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return (
    <Tag
      className={`font-bold ${className}`}
      style={{
        fontSize: sizes[level],
        lineHeight: "1.3",
        color: "#1A1A1A",
        textAlign: align,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * KioskText — body text with enforced minimum 16px, recommended 18px+.
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
    body: "20px",
    label: "18px",
    caption: "16px",
  };

  const colors: Record<string, string> = {
    primary: "#1A1A1A",
    secondary: "#4A4A4A",
  };

  return (
    <p
      className={className}
      style={{
        fontSize: sizes[size],
        lineHeight: "1.5",
        color: colors[color],
        textAlign: align,
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </p>
  );
}
