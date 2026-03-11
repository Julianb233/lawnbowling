"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Loader2, AlertCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface VenueInfo {
  id: string;
  name: string;
  address: string | null;
}

type CheckInState = "loading" | "checking_in" | "success" | "error" | "no_auth" | "not_found";

export default function VenueCheckInPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = use(params);
  const [state, setState] = useState<CheckInState>("loading");
  const [venue, setVenue] = useState<VenueInfo | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkIn() {
      const supabase = createClient();

      // Check if user is logged in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState("no_auth");
        return;
      }

      // Get venue info
      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("id, name, address")
        .eq("id", venueId)
        .single();

      if (venueError || !venueData) {
        setState("not_found");
        return;
      }

      setVenue(venueData);
      setState("checking_in");

      // Get player profile
      const { data: player } = await supabase
        .from("players")
        .select("id, display_name")
        .eq("user_id", user.id)
        .single();

      if (!player) {
        setErrorMsg("No player profile found. Complete your profile first.");
        setState("error");
        return;
      }

      // Check in via API
      try {
        const res = await fetch("/api/qr/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_id: player.id,
            venue_id: venueId,
          }),
        });

        const result = await res.json();

        if (result.success) {
          setPlayerName(player.display_name);
          setState("success");
        } else {
          setErrorMsg(result.error || "Check-in failed");
          setState("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setState("error");
      }
    }

    checkIn();
  }, [venueId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4">
      <div className="w-full max-w-sm">
        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <Loader2 className="h-12 w-12 animate-spin text-[#1B5E20]" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading venue...</p>
          </motion.div>
        )}

        {state === "checking_in" && venue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <Loader2 className="h-12 w-12 animate-spin text-[#1B5E20]" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Checking in...</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-4 w-4" />
              {venue.name}
            </div>
          </motion.div>
        )}

        {state === "success" && venue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-[#1B5E20]/15 bg-[#1B5E20]/5 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle2 className="h-16 w-16 text-[#1B5E20]" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">You're Checked In!</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Welcome, <span className="font-semibold">{playerName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-[#1B5E20]" />
              {venue.name}
            </div>
            <Link
              href="/board"
              className="mt-2 w-full rounded-xl bg-[#1B5E20] py-3 text-center text-sm font-bold text-white hover:bg-[#1B5E20] transition-colors"
            >
              Go to Board
            </Link>
          </motion.div>
        )}

        {state === "no_auth" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-center"
          >
            <LogIn className="h-12 w-12 text-zinc-400" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Sign In to Check In</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                You need an account to check in at this venue
              </p>
            </div>
            <Link
              href={`/login?redirect=/checkin/${venueId}`}
              className="w-full rounded-xl bg-[#1B5E20] py-3 text-center text-sm font-bold text-white hover:bg-[#1B5E20] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={`/signup?redirect=/checkin/${venueId}`}
              className="text-sm text-[#1B5E20] hover:text-[#2E7D32]"
            >
              Create an Account
            </Link>
          </motion.div>
        )}

        {state === "not_found" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Venue Not Found</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">This QR code may be outdated or invalid.</p>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Check-In Failed</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
