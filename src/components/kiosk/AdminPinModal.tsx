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
            className="w-full max-w-sm rounded-3xl p-8"
            style={{ backgroundColor: "var(--kiosk-surface, #FFFFFF)" }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6" style={{ color: "var(--kiosk-text-secondary, #4A4A4A)" }} />
                <h2 className="font-bold" style={{ fontSize: "var(--kiosk-text-subheading, 24px)", color: "var(--kiosk-text, #1A1A1A)" }}>
                  Admin PIN
                </h2>
              </div>
              <button
                onClick={() => { onClose(); setPin(""); }}
                className="rounded-full p-2 touch-manipulation focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                style={{ minHeight: "48px", minWidth: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Close admin PIN dialog"
              >
                <X className="h-6 w-6" style={{ color: "var(--kiosk-text-secondary, #4A4A4A)" }} />
              </button>
            </div>

            {/* PIN dots - larger for visibility */}
            <div className="mb-8 flex justify-center gap-5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={error ? { x: [-8, 8, -4, 4, 0] } : {}}
                  className="rounded-full border-2 transition-colors"
                  style={{
                    height: "20px",
                    width: "20px",
                    borderColor: i < pin.length
                      ? error ? "var(--kiosk-error, #C62828)" : "var(--kiosk-success, #2E7D32)"
                      : "var(--kiosk-text-secondary, #4A4A4A)",
                    backgroundColor: i < pin.length
                      ? error ? "var(--kiosk-error, #C62828)" : "var(--kiosk-success, #2E7D32)"
                      : "transparent",
                  }}
                />
              ))}
            </div>

            {/* Keypad - 72px buttons for elderly-friendly touch targets */}
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => (
                key === "" ? <div key="empty" /> : (
                  <button
                    key={key}
                    onClick={() => key === "del" ? handleDelete() : handleDigit(key)}
                    className="flex items-center justify-center rounded-xl font-bold touch-manipulation active:scale-[0.95] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#0D47A1] focus-visible:outline-offset-2"
                    style={{
                      minHeight: "var(--kiosk-touch-target-primary, 72px)",
                      fontSize: "var(--kiosk-text-subheading, 24px)",
                      backgroundColor: "#F0F0F0",
                      color: "var(--kiosk-text, #1A1A1A)",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label={key === "del" ? "Delete last digit" : `Enter digit ${key}`}
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
