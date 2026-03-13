"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import type { Friendship } from "@/lib/types";
import { FriendsList } from "@/components/social/FriendsList";
import { FriendRequests } from "@/components/social/FriendRequests";

interface FriendsPageClientProps {
  friends: Friendship[];
  pendingRequests: Friendship[];
  currentPlayerId: string;
}

export function FriendsPageClient({
  friends,
  pendingRequests,
  currentPlayerId,
}: FriendsPageClientProps) {
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {isOffline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4">
          <WifiOff className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            You&apos;re offline. Viewing cached data. Friend requests will sync when you reconnect.
          </p>
        </div>
      )}
      <FriendRequests
        requests={pendingRequests}
        onRespond={() => router.refresh()}
      />
      <div>
        <h3 className="text-sm font-semibold text-[#3D5A3E] uppercase tracking-wider mb-3">
          Friends ({friends.length})
        </h3>
        <FriendsList friends={friends} currentPlayerId={currentPlayerId} />
      </div>
    </>
  );
}
