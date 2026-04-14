"use client";

import { useEffect, useState } from "react";

export function DebugLogOverlay() {
  const [log, setLog] = useState("");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const tick = () => {
      try {
        setLog(localStorage.getItem("lb-debug-log") || "");
      } catch {
        /* no-op */
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 99999,
          background: "#000",
          color: "#0f0",
          fontSize: 11,
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid #0f0",
        }}
      >
        LOG
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        padding: "40px 8px 8px 8px",
        maxHeight: "40vh",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        pointerEvents: "auto",
      }}
    >
      <button
        onClick={() => setOpen(false)}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "#000",
          color: "#0f0",
          border: "1px solid #0f0",
          fontSize: 11,
          padding: "2px 6px",
        }}
      >
        hide
      </button>
      <button
        onClick={() => {
          try {
            localStorage.removeItem("lb-debug-log");
            setLog("");
          } catch {
            /* no-op */
          }
        }}
        style={{
          position: "absolute",
          top: 4,
          right: 50,
          background: "#000",
          color: "#0f0",
          border: "1px solid #0f0",
          fontSize: 11,
          padding: "2px 6px",
        }}
      >
        clear
      </button>
      {log || "(empty)"}
    </div>
  );
}
