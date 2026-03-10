"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "ios-install-dismissed";
const DISMISS_DAYS = 7;

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function IOSInstallGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIOS() || isStandalone()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    setVisible(true);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md glass rounded-xl p-4 shadow-2xl"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">
            Install Pick a Partner
          </p>
          <div className="mt-2 space-y-1.5">
            <p className="text-zinc-300 text-xs flex items-center gap-2">
              <span className="shrink-0">1.</span>
              Tap the{" "}
              <svg
                className="inline h-4 w-4 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>{" "}
              Share button
            </p>
            <p className="text-zinc-300 text-xs flex items-center gap-2">
              <span className="shrink-0">2.</span>
              Then tap <strong className="text-white">Add to Home Screen</strong>
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Dismiss install guide"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
