"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock } from "lucide-react";

interface AdminPinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_PIN = "1234";

export function AdminPinModal({ open, onClose, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      const storedPin = localStorage.getItem("kiosk_pin") || DEFAULT_PIN;
      if (newPin === storedPin) {
        onSuccess();
        setPin("");
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 800);
      }
    }
  }

  function handleDelete() {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="w-full max-w-xs rounded-2xl glass p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-zinc-400" />
                <h2 className="text-lg font-bold text-zinc-900">Admin PIN</h2>
              </div>
              <button onClick={() => { onClose(); setPin(""); }} className="rounded-full p-1 hover:bg-zinc-100">
                <X className="h-5 w-5 text-zinc-400" />
              </button>
            </div>

            {/* PIN dots */}
            <div className="mb-6 flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [-8, 8, -4, 4, 0] } : {}}
                  className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    i < pin.length
                      ? error ? "border-red-500 bg-red-500" : "border-green-500 bg-green-500"
                      : "border-zinc-600"
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {["1","2","3","4","5","6","7","8","9","","0","del"].map((key) => (
                key === "" ? <div key="empty" /> : (
                  <button
                    key={key}
                    onClick={() => key === "del" ? handleDelete() : handleDigit(key)}
                    className="flex h-16 items-center justify-center rounded-xl bg-zinc-100 text-xl font-bold text-zinc-900 hover:bg-zinc-100 active:bg-zinc-600 min-h-[64px] touch-manipulation"
                  >
                    {key === "del" ? "&#9003;" : key}
                  </button>
                )
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
