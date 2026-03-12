"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, MapPin, AlertCircle, Loader2 } from "lucide-react";

type CheckInState = "loading" | "success" | "already" | "error" | "no-auth";

export default function VenueCheckInPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.venueId as string;

  const [state, setState] = useState<CheckInState>("loading");
  const [playerName, setPlayerName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function doCheckIn() {
      try {
        const res = await fetch("/api/qr/venue-checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ venue_id: venueId }),
        });

        if (res.status === 401) {
          // Not logged in — redirect to login with return URL
          setState("no-auth");
          setTimeout(() => {
            router.push(`/login?redirect=/checkin/${venueId}`);
          }, 1500);
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          setState("error");
          setErrorMsg(data.error || "Check-in failed");
          return;
        }

        setPlayerName(data.player_name);
        setVenueName(data.venue_name);
        setState(data.already_checked_in ? "already" : "success");
      } catch {
        setState("error");
        setErrorMsg("Network error. Please try again.");
      }
    }

    doCheckIn();
  }, [venueId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A2E12]/5 via-[#0A2E12]/5 to-[#0A2E12]/[0.03] p-4">
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <Loader2 className="h-16 w-16 animate-spin text-emerald-500" />
            <p className="text-lg text-[#3D5A3E]">Checking you in...</p>
          </motion.div>
        )}

        {(state === "success" || state === "already") && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            >
              <CheckCircle2 className="h-24 w-24 text-emerald-500" />
            </motion.div>

            <div>
              <h1 className="text-3xl font-bold text-white">
                {state === "already" ? "Already Checked In!" : "You're In!"}
              </h1>
              <p className="mt-2 text-xl text-emerald-400 font-semibold">
                Welcome, {playerName}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-[#3D5A3E]">
                <MapPin className="h-4 w-4" />
                <span>{venueName}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/board")}
              className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg"
            >
              Go to Board
            </motion.button>
          </motion.div>
        )}

        {state === "no-auth" && (
          <motion.div
            key="no-auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <AlertCircle className="h-16 w-16 text-amber-500" />
            <p className="text-lg text-[#3D5A3E]">
              Please log in to check in
            </p>
            <p className="text-sm text-[#3D5A3E]">Redirecting to login...</p>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <AlertCircle className="h-20 w-20 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Check-in Failed</h1>
              <p className="mt-2 text-[#3D5A3E]">{errorMsg}</p>
            </div>
            <button
              onClick={() => {
                setState("loading");
                window.location.reload();
              }}
              className="rounded-xl bg-[#0A2E12] px-6 py-3 text-white hover:bg-[#0A2E12]/5 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
