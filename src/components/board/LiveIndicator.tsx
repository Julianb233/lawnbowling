"use client";

import { motion, AnimatePresence } from "framer-motion";

export function LiveIndicator({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full bg-[#1B5E20]/10 px-3 py-1.5 text-sm font-semibold text-[#1B5E20] backdrop-blur">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1B5E20] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1B5E20]" />
        </span>
        <span className="text-gradient font-bold tracking-wider">LIVE</span>
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="text-sm text-zinc-400 tabular-nums"
        >
          {count} player{count !== 1 ? "s" : ""}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
