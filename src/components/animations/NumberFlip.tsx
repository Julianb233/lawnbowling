"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface NumberFlipProps {
  value: number;
  className?: string;
  debug?: boolean;
}

/**
 * NumberFlip — animates a score digit change with a vertical slide transition.
 * Each digit position animates independently. Completes in 250ms.
 * REQ-AS-01, REQ-AS-02, REQ-AS-03, REQ-AS-08, REQ-AS-11, REQ-AS-13
 */
export function NumberFlip({ value, className = "", debug = false }: NumberFlipProps) {
  const reduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (debug) {
        // Force animation on mount for QA
        setPrevValue(Math.max(0, value - 1));
        setDisplayValue(value);
        if (!reduced) setAnimating(true);
      }
      return;
    }

    if (value !== displayValue) {
      setPrevValue(displayValue);
      setDisplayValue(value);
      if (!reduced) {
        setAnimating(true);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!animating) return;
    const timer = setTimeout(() => setAnimating(false), 250);
    return () => clearTimeout(timer);
  }, [animating]);

  // Split into individual digits for independent animation
  const currDigits = String(displayValue).split("");
  const prevDigits = String(prevValue).padStart(currDigits.length, "0").split("");

  if (reduced || !animating) {
    return <span className={className}>{displayValue}</span>;
  }

  return (
    <span className={`inline-flex overflow-hidden ${className}`} aria-live="polite">
      {currDigits.map((digit, i) => {
        const changed = digit !== prevDigits[i];
        return (
          <span
            key={`${i}-${digit}`}
            className="relative inline-block overflow-hidden"
            style={{ width: "0.65em", height: "1.2em" }}
          >
            {changed ? (
              <>
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    animation: "numberFlipOut 250ms ease-in forwards",
                  }}
                >
                  {prevDigits[i]}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    animation: "numberFlipIn 250ms ease-out forwards",
                  }}
                >
                  {digit}
                </span>
              </>
            ) : (
              <span className="absolute inset-0 flex items-center justify-center">
                {digit}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
