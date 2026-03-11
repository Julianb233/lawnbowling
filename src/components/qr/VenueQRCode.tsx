"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";

interface VenueQRCodeProps {
  venueId: string;
  venueName: string;
  size?: number;
  /** Show download/print actions */
  showActions?: boolean;
}

export function VenueQRCode({
  venueId,
  venueName,
  size = 256,
  showActions = false,
}: VenueQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  const checkinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/checkin/${venueId}`;

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, checkinUrl, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).catch(() => setError(true));
  }, [checkinUrl, size]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;

    // Create a new canvas with label
    const exportCanvas = document.createElement("canvas");
    const padding = 40;
    const labelHeight = 60;
    exportCanvas.width = size + padding * 2;
    exportCanvas.height = size + padding * 2 + labelHeight;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw QR code
    ctx.drawImage(canvasRef.current, padding, padding, size, size);

    // Draw venue name label
    ctx.fillStyle = "#18181b";
    ctx.font = `bold ${Math.max(16, size / 12)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(venueName, exportCanvas.width / 2, size + padding + 30);

    // Draw "Scan to check in" subtitle
    ctx.fillStyle = "#71717a";
    ctx.font = `${Math.max(12, size / 16)}px sans-serif`;
    ctx.fillText("Scan to check in", exportCanvas.width / 2, size + padding + 52);

    const link = document.createElement("a");
    link.download = `${venueName.replace(/\s+/g, "-").toLowerCase()}-qr-checkin.png`;
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
  }, [size, venueName]);

  const handlePrint = useCallback(() => {
    if (!canvasRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const dataUrl = canvasRef.current.toDataURL("image/png");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Check-in - ${venueName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            img { width: ${size}px; height: ${size}px; }
            h1 { margin: 24px 0 4px; font-size: 28px; }
            p { color: #666; font-size: 18px; margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="QR Code" />
          <h1>${venueName}</h1>
          <p>Scan to check in</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [size, venueName]);

  if (error) {
    return <p className="text-sm text-red-400">Failed to generate venue QR code</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-700">{venueName}</p>
        <p className="text-xs text-zinc-500">Scan to check in</p>
      </div>
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      )}
    </div>
  );
}
