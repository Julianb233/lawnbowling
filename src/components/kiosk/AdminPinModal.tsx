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
            className="w-full max-w-sm rounded-2xl glass p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6" style={{ color: "#4A4A4A" }} />
                <h2
                  className="font-bold"
                  style={{ fontSize: "32px", color: "#1A1A1A" }}
                >
                  Admin PIN
                </h2>
              </div>
              <button
                onClick={() => { onClose(); setPin(""); }}
                className="rounded-full p-3 hover:bg-zinc-100 touch-manipulation"
                style={{
                  minHeight: "56px",
                  minWidth: "56px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X className="h-6 w-6" style={{ color: "#4A4A4A" }} />
              </button>
            </div>

            {/* PIN dots */}
            <div className="mb-6 flex justify-center gap-4">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [-8, 8, -4, 4, 0] } : {}}
                  className={`h-5 w-5 rounded-full border-2 transition-colors ${
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
                    className="flex items-center justify-center rounded-xl touch-manipulation active:scale-[0.95]"
                    style={{
                      minHeight: "64px",
                      fontSize: "24px",
                      fontWeight: 700,
                      backgroundColor: "#F0F0F0",
                      color: "#1A1A1A",
                    }}
                  >
                    {key === "del" ? "\u232B" : key}
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
