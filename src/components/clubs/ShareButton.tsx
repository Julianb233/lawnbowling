"use client";

import { Facebook, Twitter, Share2 } from "lucide-react";

export function ShareButton({
  platform,
  url,
  title,
}: {
  platform: "facebook" | "twitter" | "copy";
  url: string;
  title: string;
}) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  if (platform === "facebook") {
    return (
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0A2E12]/10 text-[#1877F2] transition hover:bg-[#1877F2]/5"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </a>
    );
  }

  if (platform === "twitter") {
    return (
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0A2E12]/10 text-[#1DA1F2] transition hover:bg-[#1DA1F2]/5"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>
    );
  }

  return (
    <button
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
      }}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0A2E12]/10 text-[#3D5A3E] transition hover:bg-[#0A2E12]/5"
      title="Copy link"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
