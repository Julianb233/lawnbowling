"use client";

import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface EndPulseProps {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  debug?: boolean;
}

export function EndPulse({ active, children, className = "", debug = false }: EndPulseProps) {
  const reducedMotion = useReducedMotion();
  const [pulsing, setPulsing] = useState(false);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    if (debug) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [debug]);

  useEffect(() => {
    if (debug) return;
    const wasActive = prevActiveRef.current;
    prevActiveRef.current = active;

    if (active && !wasActive && !reducedMotion) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 400);
      return () => clearTimeout(timer);
    }
  }, [active, reducedMotion, debug]);

  return (
    <div
      className={`end-pulse-wrapper ${className}`}
      style={{ position: "relative" }}
    >
      {children}
      {pulsing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            animation: "endPulseRing 400ms ease-out forwards",
            boxShadow: "inset 0 0 0 2px #2E7D32",
            opacity: 0,
          }}
          onAnimationEnd={() => setPulsing(false)}
        />
      )}
    </div>
  );
}
