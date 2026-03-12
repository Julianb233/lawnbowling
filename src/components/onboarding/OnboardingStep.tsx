"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface OnboardingStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export function OnboardingStep({ icon: Icon, title, description, color = "text-green-400" }: OnboardingStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex flex-col items-center px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
        className="mb-8"
      >
        <Icon className="w-20 h-20" strokeWidth={1.5} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mb-4 text-3xl font-black ${color}`}
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-sm text-lg text-[#3D5A3E] leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
