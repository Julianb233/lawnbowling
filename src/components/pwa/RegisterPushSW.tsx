"use client";

import { useEffect } from "react";

/**
 * Registers the push-only service worker when the full Serwist SW isn't active.
 * This ensures push notifications work in all environments.
 */
export function RegisterPushSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // If the old Serwist SW (sw.js) is registered, it will self-destruct on
    // next fetch (see public/sw.js). After that clears, register push-only SW.
    navigator.serviceWorker.getRegistration("/sw.js").then((oldReg) => {
      if (oldReg) {
        // Force the self-destructing sw.js to activate immediately
        oldReg.update().catch(() => {});
      }
    });

    // Register the lightweight push-only SW
    navigator.serviceWorker.getRegistration("/push-sw.js").then((reg) => {
      if (!reg) {
        navigator.serviceWorker.register("/push-sw.js").catch(() => {
          // Registration failed — push won't work but app continues normally
        });
      }
    });
  }, []);

  return null;
}
