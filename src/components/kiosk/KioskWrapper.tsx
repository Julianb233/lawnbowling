"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminPinModal } from "./AdminPinModal";

interface KioskWrapperProps {
  children: React.ReactNode;
  inactivityTimeout?: number;
  onInactivityReset?: () => void;
}

const WARNING_SECONDS = 10;

export function KioskWrapper({
  children,
  inactivityTimeout = 30000,
  onInactivityReset,
}: KioskWrapperProps) {
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(WARNING_SECONDS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    setWarningCountdown(WARNING_SECONDS);
    clearAllTimers();
  }, [clearAllTimers]);

  const resetTimer = useCallback(() => {
    dismissWarning();

    // Set the inactivity timer; when it fires, show a warning overlay
    timerRef.current = setTimeout(() => {
      setShowWarning(true);
      setWarningCountdown(WARNING_SECONDS);

      // Start countdown
      let remaining = WARNING_SECONDS;
      warningIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setWarningCountdown(remaining);
        if (remaining <= 0) {
          clearAllTimers();
          setShowWarning(false);
          onInactivityReset?.();
        }
      }, 1000);
    }, inactivityTimeout);
  }, [inactivityTimeout, onInactivityReset, dismissWarning, clearAllTimers]);

  useEffect(() => {
    const events = [
      "touchstart",
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
    ];
    events.forEach((e) =>
      document.addEventListener(e, resetTimer, { passive: true })
    );
    resetTimer();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      clearAllTimers();
    };
  }, [resetTimer, clearAllTimers]);

  // Request fullscreen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  // Triple-tap top-right corner to access admin
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCornerTap() {
    tapCountRef.current += 1;
    if (tapCountRef.current >= 3) {
      setShowAdminPin(true);
      tapCountRef.current = 0;
    }
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1000);
  }

  return (
    <div className="min-h-screen select-none">
      {/* Hidden admin access area - top right corner */}
      <div
        className="fixed right-0 top-0 z-50 h-16 w-16"
        onClick={handleCornerTap}
        aria-hidden="true"
      />
      {children}

      {/* "Are you still there?" inactivity warning overlay */}
      {showWarning && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
          onClick={() => {
            dismissWarning();
            resetTimer();
          }}
          role="alertdialog"
          aria-label="Inactivity warning"
          aria-describedby="inactivity-message"
        >
          <div
            className="rounded-3xl p-12 text-center"
            style={{
              backgroundColor: "#FFFFFF",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h2
              className="mb-4 font-bold"
              style={{ fontSize: "36px", color: "#1A1A1A" }}
            >
              Are you still there?
            </h2>
            <p
              id="inactivity-message"
              className="mb-8"
              style={{ fontSize: "22px", color: "#4A4A4A", lineHeight: "1.5" }}
            >
              Tap anywhere to continue. This screen will reset in{" "}
              {warningCountdown} seconds.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissWarning();
                resetTimer();
              }}
              className="rounded-2xl touch-manipulation active:scale-[0.97]"
              style={{
                minHeight: "72px",
                padding: "18px 48px",
                fontSize: "24px",
                fontWeight: 700,
                backgroundColor: "#1B5E20",
                color: "#FFFFFF",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Confirm you are still using the kiosk"
            >
              I&apos;m Still Here
            </button>
          </div>
        </div>
      )}

      <AdminPinModal
        open={showAdminPin}
        onClose={() => setShowAdminPin(false)}
        onSuccess={() => {
          if (document.fullscreenElement) document.exitFullscreen();
          window.location.href = "/admin";
        }}
      />
    </div>
  );
}
