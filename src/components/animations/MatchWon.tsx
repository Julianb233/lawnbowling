"use client";

import { useEffect, useState, useCallback } from "react";
import { useReducedMotion } from "./useReducedMotion";

interface MatchWonProps {
  show: boolean;
  teamName?: string;
  teamColor?: string;
  debug?: boolean;
  onDismiss?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  rotateSpeed: number;
  shape: "square" | "circle" | "rect";
}

/**
 * MatchWon — confetti celebration overlay, auto-dismisses in 2s.
 * REQ-AS-05, REQ-AS-08, REQ-AS-09, REQ-AS-10, REQ-AS-13
 */
export function MatchWon({
  show,
  teamName = "Winner",
  teamColor = "#1B5E20",
  debug = false,
  onDismiss,
}: MatchWonProps) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(
    (color: string): Particle[] => {
      const colors = [color, "#FFD700", "#FF6B35", "#4CAF50", "#2196F3", "#E91E63"];
      const shapes: Particle["shape"][] = ["square", "circle", "rect"];
      return Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        angle: Math.random() * 360,
        speed: 2 + Math.random() * 4,
        rotateSpeed: (Math.random() - 0.5) * 10,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }));
    },
    []
  );

  useEffect(() => {
    const shouldShow = debug || show;
    if (shouldShow && !reduced) {
      setParticles(generateParticles(teamColor));
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 2000);
      return () => clearTimeout(timer);
    } else if (shouldShow && reduced) {
      // Reduced motion: show briefly without animation
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, debug, reduced, teamColor, generateParticles, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ pointerEvents: "auto" }}
      onClick={() => {
        setVisible(false);
        onDismiss?.();
      }}
    >
      {/* Confetti layer */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                width: p.shape === "rect" ? p.size * 0.5 : p.size,
                height: p.shape === "rect" ? p.size * 1.5 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "1px",
                animation: `confettiFall ${1.5 + p.speed * 0.2}s ease-in forwards`,
                transform: `rotate(${p.angle}deg)`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}

      {/* Winner banner */}
      <div
        className="relative z-10 rounded-2xl bg-white/95 dark:bg-[#1a3d28]/95 px-8 py-6 text-center shadow-2xl backdrop-blur"
        style={{
          animation: reduced ? "none" : "matchWonBanner 500ms ease-out forwards",
        }}
      >
        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{teamName} Wins!</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Tap to dismiss</p>
      </div>
    </div>
  );
}
