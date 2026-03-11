"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, MessageCircle, Mail, Share2, Facebook, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  tournamentName: string;
  tournamentId: string;
  topPlayers: { display_name: string; wins: number; shot_diff: number }[];
}

export function ShareSheet({
  open,
  onClose,
  tournamentName,
  tournamentId,
  topPlayers,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const resultsUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/bowls/${tournamentId}/results`
      : `/bowls/${tournamentId}/results`;

  const shareText = buildShareText(tournamentName, topPlayers, resultsUrl);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(resultsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = resultsUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  }

  function handleEmail() {
    const subject = encodeURIComponent(`${tournamentName} - Results`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }

  function handleFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultsUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tournamentName} Results`,
          text: shareText,
          url: resultsUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  }

  const shareTargets = [
    {
      id: "copy",
      label: copied ? "Copied!" : "Copy Link",
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
      color: "text-zinc-700",
      bgColor: copied ? "bg-[#1B5E20]/10 border-[#1B5E20]/30" : "bg-white border-zinc-200",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      onClick: handleWhatsApp,
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      onClick: handleEmail,
      color: "text-blue-700",
      bgColor: "bg-blue-50 border-blue-200",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      onClick: handleFacebook,
      color: "text-blue-800",
      bgColor: "bg-indigo-50 border-indigo-200",
    },
  ];

  // Add native share if supported
  if (typeof navigator !== "undefined" && "share" in navigator) {
    shareTargets.unshift({
      id: "native",
      label: "Share",
      icon: Share2,
      onClick: handleNativeShare,
      color: "text-[#1B5E20]",
      bgColor: "bg-[#1B5E20]/10 border-[#1B5E20]/30",
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900">
                Share Results
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Share card preview */}
            <div className="mb-6 rounded-xl bg-zinc-50 border border-zinc-200 p-4">
              <p className="text-sm font-bold text-zinc-900">{tournamentName}</p>
              {topPlayers.length > 0 && (
                <div className="mt-2 space-y-1">
                  {topPlayers.slice(0, 3).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-600">
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                        idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-zinc-400" : "bg-amber-700"
                      )}>
                        {idx + 1}
                      </span>
                      <span className="font-medium">{p.display_name}</span>
                      <span className="ml-auto text-zinc-400">
                        {p.wins}W | {p.shot_diff > 0 ? "+" : ""}{p.shot_diff}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] text-zinc-400 truncate">{resultsUrl}</p>
            </div>

            {/* Share targets */}
            <div className="grid grid-cols-2 gap-3">
              {shareTargets.map((target) => (
                <button
                  key={target.id}
                  onClick={target.onClick}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-sm min-h-[48px] touch-manipulation",
                    target.bgColor
                  )}
                >
                  <target.icon className={cn("h-5 w-5 shrink-0", target.color)} />
                  <span className={cn("text-sm font-semibold", target.color)}>
                    {target.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function buildShareText(
  tournamentName: string,
  topPlayers: { display_name: string; wins: number; shot_diff: number }[],
  url: string
): string {
  let text = `${tournamentName} - Results\n\n`;
  const medals = ["1st", "2nd", "3rd"];
  for (let i = 0; i < Math.min(3, topPlayers.length); i++) {
    const p = topPlayers[i];
    text += `${medals[i]}: ${p.display_name} (${p.wins}W, ${p.shot_diff > 0 ? "+" : ""}${p.shot_diff})\n`;
  }
  text += `\nFull results: ${url}`;
  return text;
}
