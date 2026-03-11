"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  playerId: string;
  isAvailable: boolean;
  venueId: string | null;
  onToggle?: (newState: boolean) => void;
}

export function CheckInButton({ playerId, isAvailable, venueId, onToggle }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(isAvailable);
  const supabase = createClient();

  async function handleToggle() {
    setLoading(true);
    const newState = !available;

    const { error } = await supabase
      .from("players")
      .update({
        is_available: newState,
        checked_in_at: newState ? new Date().toISOString() : null,
        venue_id: newState ? venueId : null,
      })
      .eq("id", playerId);

    if (!error) {
      setAvailable(newState);
      onToggle?.(newState);
    }
    setLoading(false);
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={loading}
      aria-label={available ? "Check out from venue" : "Check in as available"}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl px-8 py-5 text-xl font-bold text-white shadow-xl transition-all duration-300",
        "touch-manipulation select-none",
        available
          ? "bg-gradient-to-r from-red-500 to-rose-600"
          : "bg-gradient-to-r from-green-500 to-[#1B5E20]",
        loading && "opacity-60 cursor-not-allowed"
      )}
      style={{
        boxShadow: available
          ? "0 0 30px rgba(239, 68, 68, 0.25), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 0 30px rgba(34, 197, 94, 0.25), 0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s infinite",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inline-flex items-center gap-2 relative z-10"
          >
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Updating...
          </motion.span>
        ) : available ? (
          <motion.span
            key="checkout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inline-flex items-center gap-2 relative z-10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            CHECK OUT
          </motion.span>
        ) : (
          <motion.span
            key="checkin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="inline-flex items-center gap-2 relative z-10"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            I&apos;M AVAILABLE
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
