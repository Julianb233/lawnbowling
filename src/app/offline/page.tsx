"use client";

import { useState, useEffect } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => window.location.replace("/board"), 2000);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  if (isOnline) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6" role="img" aria-label="Connected">
            🎉
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            You&apos;re Back Online!
          </h1>
          <p className="text-slate-400">Redirecting you to the board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6" role="img" aria-label="No connection">
          🏐
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-slate-400 mb-8">
          Looks like you lost your connection. Check your network and try again
          to get back in the game.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Reload page to try reconnecting"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
