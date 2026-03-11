"use client";

import { ThemeToggle } from "./ThemeToggle";

export function DesktopThemeToggle() {
  return (
    <div className="fixed top-4 right-4 z-50 hidden lg:block">
      <ThemeToggle />
    </div>
  );
}
