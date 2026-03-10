"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2 } from "lucide-react";

interface QRScannerProps {
  venueId: string;
  onScanSuccess?: (playerName: string) => void;
}

export function QRScanner({ venueId, onScanSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleScan = useCallback(async (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.player_id) return;

      setScanning(false);

      const res = await fetch("/api/qr/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: parsed.player_id, venue_id: venueId }),
      });

      const result = await res.json();
      if (result.success) {
        setLastScanned(result.player_name);
        onScanSuccess?.(result.player_name);
        setTimeout(() => {
          setLastScanned(null);
          setScanning(true);
        }, 3000);
      } else {
        setScanning(true);
      }
    } catch {
      setScanning(true);
    }
  }, [venueId, onScanSuccess]);

  useEffect(() => {
    let animFrameId: number;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanFrame();
        }
      } catch {
        setCameraError(true);
      }
    }

    function scanFrame() {
      if (!videoRef.current || !canvasRef.current || !scanning) {
        animFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || video.videoWidth === 0) {
        animFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Use BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
        // @ts-expect-error BarcodeDetector is experimental
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        detector.detect(canvas).then((barcodes: Array<{ rawValue: string }>) => {
          if (barcodes.length > 0) {
            handleScan(barcodes[0].rawValue);
          }
        }).catch(() => {});
      }

      animFrameId = requestAnimationFrame(scanFrame);
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [scanning, handleScan]);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <Camera className="h-16 w-16 text-zinc-600" />
        <p className="text-zinc-400">Camera access required for QR scanning</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <video ref={videoRef} className="w-full" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-48 rounded-2xl border-2 border-green-500/50">
          <div className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-green-500 rounded-tl-lg" />
          <div className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-green-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {lastScanned && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </motion.div>
            <p className="mt-4 text-2xl font-bold text-white">{lastScanned}</p>
            <p className="text-green-400">Checked in!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
