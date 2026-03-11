"use client";

import { useEffect } from "react";

/**
 * Registers the push-only service worker when the full Serwist SW isn't active.
 * This ensures push notifications work in all environments.
 */
export function RegisterPushSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Check if a service worker is already controlling the page (e.g. Serwist)
    // If not, register the lightweight push-only SW
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) {
        navigator.serviceWorker.register("/push-sw.js").catch(() => {
          // Registration failed — push won't work but app continues normally
        });
      }
    });
  }, []);

  return null;
}
