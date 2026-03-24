"use client";

import { useState } from "react";
import { Facebook, Twitter, Share2, Check, Link2 } from "lucide-react";

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function SocialShareButtons({
  url,
  title,
  description,
  className = "",
  compact = false,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // User cancelled
      }
    }
  };

  const btnBase = compact
    ? "flex h-9 w-9 items-center justify-center rounded-lg border border-[#0A2E12]/10 transition-colors"
    : "flex items-center gap-2 rounded-xl border border-[#0A2E12]/10 px-3 py-2 text-sm font-medium transition-colors";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} text-[#1877F2] hover:bg-[#1877F2]/5`}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        {!compact && <span>Facebook</span>}
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} text-[#1DA1F2] hover:bg-[#1DA1F2]/5`}
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        {!compact && <span>Twitter</span>}
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} text-[#0A66C2] hover:bg-[#0A66C2]/5`}
        title="Share on LinkedIn"
      >
        <Link2 className="h-4 w-4" />
        {!compact && <span>LinkedIn</span>}
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className={`${btnBase} ${copied ? "text-emerald-600 border-emerald-300 bg-emerald-50" : "text-[#3D5A3E] hover:bg-[#0A2E12]/5"}`}
        title={copied ? "Copied!" : "Copy link"}
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {!compact && <span>{copied ? "Copied!" : "Copy Link"}</span>}
      </button>

      {/* Native Share (mobile) */}
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button
          onClick={handleNativeShare}
          className={`${btnBase} text-[#1B5E20] hover:bg-[#1B5E20]/5 sm:hidden`}
          title="Share"
        >
          <Share2 className="h-4 w-4" />
          {!compact && <span>Share</span>}
        </button>
      )}
    </div>
  );
}
