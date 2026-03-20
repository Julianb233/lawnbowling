"use client";

import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // iOS does not fire beforeinstallprompt -- let IOSInstallGuide handle it
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    if (isIOS) return;

    // Check time-based dismissal (7 days)
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (!isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      // Expired -- remove stale key so banner can show again
      localStorage.removeItem(DISMISS_KEY);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Spacer so fixed banner doesn't cover page content */}
      <div className="h-32" aria-hidden="true" />
      <div
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">
              Add to Home Screen
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Install Lawnbowling for quick access and offline support.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-[#0A2E12] min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="Install Lawnbowling app"
        >
          Install
        </button>
      </div>
    </>
  );
}
