"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { Printer, X, QrCode } from "lucide-react";

interface QRCheckInPosterProps {
  tournamentId: string;
  tournamentName: string;
  format: string;
  date: string;
}

export function QRCheckInPoster({
  tournamentId,
  tournamentName,
  format,
  date,
}: QRCheckInPosterProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#1B5E20]/30 bg-[#1B5E20]/5 px-4 py-2 text-sm font-semibold text-[#1B5E20] hover:bg-[#1B5E20]/10 transition-colors min-h-[44px] touch-manipulation"
      >
        <QrCode className="h-4 w-4" />
        QR Poster
      </button>

      {showModal && (
        <QRPosterModal
          tournamentId={tournamentId}
          tournamentName={tournamentName}
          format={format}
          date={date}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function QRPosterModal({
  tournamentId,
  tournamentName,
  format,
  date,
  onClose,
}: QRCheckInPosterProps & { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const checkinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/bowls/${tournamentId}?checkin=true`
      : `/bowls/${tournamentId}?checkin=true`;

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, checkinUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    }).catch(() => setError(true));
  }, [checkinUrl]);

  const handlePrint = useCallback(() => {
    if (!posterRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const qrDataUrl = canvasRef.current?.toDataURL("image/png") ?? "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Check-in Poster - ${tournamentName}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 210mm;
              height: 297mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
              background: #fff;
              color: #0A2E12;
            }
            .poster {
              text-align: center;
              padding: 40px;
            }
            .logo-placeholder {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: #E8F5E9;
              border: 3px solid #1B5E20;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 32px;
              font-size: 32px;
              font-weight: 900;
              color: #1B5E20;
            }
            .tournament-name {
              font-size: 36px;
              font-weight: 900;
              color: #0A2E12;
              margin-bottom: 8px;
              line-height: 1.2;
            }
            .meta {
              font-size: 18px;
              color: #3D5A3E;
              margin-bottom: 40px;
            }
            .qr-container {
              display: inline-block;
              padding: 20px;
              border: 3px solid #1B5E20;
              border-radius: 16px;
              background: #fff;
              margin-bottom: 32px;
            }
            .qr-container img {
              width: 300px;
              height: 300px;
              display: block;
            }
            .instruction {
              font-size: 28px;
              font-weight: 800;
              color: #1B5E20;
              margin-bottom: 8px;
            }
            .sub-instruction {
              font-size: 16px;
              color: #3D5A3E;
            }
            .url-hint {
              margin-top: 24px;
              font-size: 13px;
              color: #999;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="logo-placeholder">LB</div>
            <div class="tournament-name">${tournamentName}</div>
            <div class="meta">${date} &bull; ${format}</div>
            <div class="qr-container">
              <img src="${qrDataUrl}" alt="QR Code" />
            </div>
            <div class="instruction">Scan to Check In</div>
            <div class="sub-instruction">Open your phone camera and point it at the QR code</div>
            <div class="url-hint">${checkinUrl}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }, [tournamentName, format, date, checkinUrl]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[#0A2E12]/10 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[#3D5A3E] hover:bg-[#0A2E12]/5 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Poster preview */}
        <div ref={posterRef} className="p-8 text-center bg-white">
          {/* Club logo placeholder */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#1B5E20] bg-[#E8F5E9] text-xl font-black text-[#1B5E20]">
            LB
          </div>

          {/* Tournament name */}
          <h2 className="text-[28px] font-black leading-tight text-[#0A2E12] mb-1">
            {tournamentName}
          </h2>

          {/* Date and format */}
          <p className="text-sm text-[#3D5A3E] mb-6">
            {date} &bull; {format}
          </p>

          {/* QR Code */}
          <div className="inline-block rounded-2xl border-2 border-[#1B5E20] bg-white p-4 mb-6">
            {error ? (
              <p className="text-sm text-red-500">Failed to generate QR code</p>
            ) : (
              <canvas ref={canvasRef} />
            )}
          </div>

          {/* Instruction text */}
          <p className="text-xl font-extrabold text-[#1B5E20] mb-1">
            Scan to Check In
          </p>
          <p className="text-xs text-[#3D5A3E]">
            Open your phone camera and point it at the QR code
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-[#0A2E12]/10 px-8 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#0A2E12]/10 bg-white px-4 py-2 text-sm font-semibold text-[#2D4A30] hover:bg-[#0A2E12]/[0.03] min-h-[44px] touch-manipulation"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-6 py-2 text-sm font-bold text-white hover:bg-[#145218] transition-colors min-h-[44px] touch-manipulation"
          >
            <Printer className="h-4 w-4" />
            Print Poster
          </button>
        </div>
      </div>
    </div>
  );
}
