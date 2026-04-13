"use client";

import { usePathname } from "next/navigation";

export function DebugPathBanner() {
  const pathname = usePathname();
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "#ff0066",
        color: "white",
        fontSize: 11,
        fontFamily: "monospace",
        padding: "4px 8px",
        textAlign: "center",
      }}
    >
      DEBUG v4 · path={pathname}
    </div>
  );
}
