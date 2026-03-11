"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Loader2, AlertCircle, LogIn, Shield, X } from "lucide-react";
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
  const [showInsuranceOffer, setShowInsuranceOffer] = useState(true);

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
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <p className="text-sm text-zinc-500">Loading venue...</p>
          </motion.div>
        )}

        {state === "checking_in" && venue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
            <h2 className="text-lg font-bold text-zinc-900">Checking in...</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <MapPin className="h-4 w-4" />
              {venue.name}
            </div>
          </motion.div>
        )}

        {state === "success" && venue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">You're Checked In!</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Welcome, <span className="font-semibold">{playerName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-zinc-600">
              <MapPin className="h-4 w-4 text-emerald-500" />
              {venue.name}
            </div>
            <Link
              href="/board"
              className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
            >
              Go to Board
            </Link>
          </motion.div>
        )}

        {state === "success" && showInsuranceOffer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <button
              onClick={() => setShowInsuranceOffer(false)}
              className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:text-zinc-600"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3 pr-6">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-zinc-900">Protect Your Game</p>
                <p className="mt-0.5 text-xs text-zinc-600">Per-session coverage from $3/player</p>
                <Link
                  href="/insurance/lawn-bowls"
                  className="mt-2 inline-block rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {state === "no_auth" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white p-8 text-center"
          >
            <LogIn className="h-12 w-12 text-zinc-400" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Sign In to Check In</h2>
              <p className="mt-1 text-sm text-zinc-500">
                You need an account to check in at this venue
              </p>
            </div>
            <Link
              href={`/login?redirect=/checkin/${venueId}`}
              className="w-full rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-white hover:bg-emerald-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={`/signup?redirect=/checkin/${venueId}`}
              className="text-sm text-emerald-600 hover:text-emerald-700"
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
            <h2 className="text-lg font-bold text-zinc-900">Venue Not Found</h2>
            <p className="text-sm text-zinc-500">This QR code may be outdated or invalid.</p>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 text-red-400" />
            <h2 className="text-lg font-bold text-zinc-900">Check-In Failed</h2>
            <p className="text-sm text-zinc-500">{errorMsg}</p>
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
