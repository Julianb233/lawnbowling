"use client";

import { useRef, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  currentUrl: string | null;
  displayName: string;
  onUpload: (file: File) => Promise<string>;
}

export function AvatarUpload({ currentUrl, displayName, onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const url = await onUpload(file);
      setPreview(url);
    } catch {
      setPreview(currentUrl);
    } finally {
      setUploading(false);
    }
  }

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:ring-offset-2 focus:ring-offset-white"
        disabled={uploading}
      >
        <Avatar.Root className="inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
          <Avatar.Image
            src={preview ?? undefined}
            alt={displayName}
            className="h-full w-full object-cover"
          />
          <Avatar.Fallback className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-500">
            {initials || "?"}
          </Avatar.Fallback>
        </Avatar.Root>
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-6 w-6 text-white" />
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
