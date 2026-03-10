"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

interface PlayerQRCodeProps {
  playerId: string;
  playerName: string;
  venueId?: string;
  size?: number;
}

export function PlayerQRCode({ playerId, playerName, venueId, size = 200 }: PlayerQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    const data = JSON.stringify({ player_id: playerId, venue_id: venueId || "" });

    QRCode.toCanvas(canvasRef.current, data, {
      width: size,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
    }).catch(() => setError(true));
  }, [playerId, venueId, size]);

  if (error) {
    return <p className="text-sm text-red-400">Failed to generate QR code</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-white p-4">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-sm text-zinc-400">
        Show this QR code to check in as <strong className="text-zinc-700">{playerName}</strong>
      </p>
    </div>
  );
}
