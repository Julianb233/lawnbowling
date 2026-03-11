"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Loader2 } from "lucide-react";
import type { Court } from "@/lib/types";

interface BookCourtModalProps {
  court: Court;
  open: boolean;
  onClose: () => void;
}

export function BookCourtModal({ court, open, onClose }: BookCourtModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleBook() {
    if (!date || !time) return;
    setLoading(true);

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          court_id: court.id,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl glass p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Book {court.name}</h2>
              <button onClick={onClose} className="rounded-full p-1 hover:bg-zinc-100">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">&#9989;</div>
                <p className="text-green-400 font-semibold">Court Booked!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    <Calendar className="inline h-4 w-4 mr-1" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-white outline-none focus:border-green-500/50 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    <Clock className="inline h-4 w-4 mr-1" /> Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-white outline-none focus:border-green-500/50 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Duration</label>
                  <div className="flex gap-2">
                    {[30, 60, 90, 120].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium min-h-[44px] ${
                          duration === d
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {d}m
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleBook}
                  disabled={loading || !date || !time}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-[#1B5E20] px-4 py-3 font-bold text-white hover:shadow-lg disabled:opacity-50 min-h-[48px]"
                >
                  {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Book Court"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
