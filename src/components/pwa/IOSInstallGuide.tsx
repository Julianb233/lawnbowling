"use client";

import { useState, useEffect } from "react";

const DISMISS_KEY = "ios-install-dismissed";
const DISMISS_DAYS = 7;
const VISIT_COUNT_KEY = "ios-visit-count";
const MIN_VISITS_BEFORE_PROMPT = 2;

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

    // Track visits -- only show after user has engaged with the app
    const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, visits.toString());

    if (visits < MIN_VISITS_BEFORE_PROMPT) return;

    // Delay showing by 3 seconds so it doesn't interrupt initial page load
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!visible) return null;

  return (
    <>
    {/* Spacer so fixed banner doesn't cover page content */}
    <div className="h-64" aria-hidden="true" />
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-2xl"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-white font-semibold text-base">
            Get the full app experience
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Add Lawnbowling to your home screen for instant access, faster loading, and a full-screen experience.
          </p>
          <div className="mt-3 space-y-2.5">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">1</span>
              <p className="text-slate-300 text-sm">
                Tap the{" "}
                <svg
                  className="inline h-4 w-4 text-blue-400 -mt-0.5"
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
                <strong className="text-blue-400">Share</strong> button at the bottom of your browser
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">2</span>
              <p className="text-slate-300 text-sm">
                Scroll down and tap{" "}
                <strong className="text-white bg-slate-700 px-1.5 py-0.5 rounded text-xs">Add to Home Screen</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">3</span>
              <p className="text-slate-300 text-sm">
                Tap <strong className="text-white">Add</strong> in the top right to confirm
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="mt-4 w-full text-slate-400 hover:text-white text-sm py-2 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-400"
        aria-label="Dismiss install guide"
      >
        Maybe later
      </button>
    </div>
    </>
  );
}
