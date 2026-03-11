"use client";

import { useReducedMotion } from "./useReducedMotion";

interface MatchPointProps {
  isMatchPoint: boolean;
  children?: React.ReactNode;
  className?: string;
  debug?: boolean;
}

export function MatchPoint({
  isMatchPoint,
  children,
  className = "",
  debug = false,
}: MatchPointProps) {
  const reducedMotion = useReducedMotion();
  const showPulse = (isMatchPoint || debug) && !reducedMotion;

  if (!isMatchPoint && !debug) {
    return <>{children}</>;
  }

  return (
    <span
      className={`match-point-indicator ${className}`}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}
    >
      {children}
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#F59E0B",
          ...(showPulse
            ? { animation: "matchPointPulse 1.5s ease-in-out infinite" }
            : {}),
        }}
        title="Match point"
      />
    </span>
  );
}
