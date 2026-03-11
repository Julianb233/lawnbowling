"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 min-h-0 min-w-0 rounded-full transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-300" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      )}
    </button>
  );
}
