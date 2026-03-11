"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Download, Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";

interface VenueQRCodeProps {
  venueId: string;
  venueName: string;
  size?: number;
}

export function VenueQRCode({ venueId, venueName, size = 256 }: VenueQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const checkinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkin/${venueId}`
      : `/checkin/${venueId}`;

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, checkinUrl, {
      width: size,
      margin: 3,
      color: { dark: "#18181b", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).catch(() => setError(true));
  }, [checkinUrl, size]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;

    // Create a larger canvas with venue name label
    const srcCanvas = canvasRef.current;
    const exportCanvas = document.createElement("canvas");
    const padding = 40;
    const labelHeight = 60;

    exportCanvas.width = srcCanvas.width + padding * 2;
    exportCanvas.height = srcCanvas.height + padding * 2 + labelHeight;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // QR code
    ctx.drawImage(srcCanvas, padding, padding);

    // Venue name label
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      venueName,
      exportCanvas.width / 2,
      srcCanvas.height + padding + 30
    );

    // "Scan to check in" subtitle
    ctx.fillStyle = "#71717a";
    ctx.font = "14px system-ui, sans-serif";
    ctx.fillText(
      "Scan to check in",
      exportCanvas.width / 2,
      srcCanvas.height + padding + 52
    );

    // Download
    const link = document.createElement("a");
    link.download = `${venueName.replace(/\s+/g, "-").toLowerCase()}-checkin-qr.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }, [venueName]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = checkinUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [checkinUrl]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6">
        <QrCode className="h-8 w-8 text-red-400" />
        <p className="text-sm text-red-600">Failed to generate QR code</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <canvas ref={canvasRef} />
      </div>

      <p className="text-center text-sm text-zinc-500">
        Players scan this code to check in at <strong className="text-zinc-700">{venueName}</strong>
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button
          onClick={handleCopyUrl}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </button>
      </div>

      <p className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-500 font-mono break-all">
        {checkinUrl}
      </p>
    </div>
  );
}
