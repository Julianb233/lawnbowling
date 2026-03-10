"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminPinModal } from "./AdminPinModal";

interface KioskWrapperProps {
  children: React.ReactNode;
  inactivityTimeout?: number;
  onInactivityReset?: () => void;
}

export function KioskWrapper({ children, inactivityTimeout = 30000, onInactivityReset }: KioskWrapperProps) {
  const [showAdminPin, setShowAdminPin] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onInactivityReset?.();
    }, inactivityTimeout);
  }, [inactivityTimeout, onInactivityReset]);

  useEffect(() => {
    const events = ["touchstart", "mousedown", "mousemove", "keydown", "scroll"];
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  // Request fullscreen on mount
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  // Triple-tap top-right corner to access admin
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleCornerTap() {
    tapCountRef.current += 1;
    if (tapCountRef.current >= 3) {
      setShowAdminPin(true);
      tapCountRef.current = 0;
    }
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => { tapCountRef.current = 0; }, 1000);
  }

  return (
    <div className="min-h-screen select-none">
      {/* Hidden admin access area - top right corner */}
      <div
        className="fixed right-0 top-0 z-50 h-16 w-16"
        onClick={handleCornerTap}
      />
      {children}
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
