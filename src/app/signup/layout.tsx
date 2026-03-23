import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | LawnBowl",
  description:
    "Join LawnBowl — the complete lawn bowling platform for clubs and players. Free to get started.",
  openGraph: {
    title: "Create Account | LawnBowl",
    description:
      "Join LawnBowl — the complete lawn bowling platform for clubs and players. Free to get started.",
    url: "https://www.lawnbowl.app/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
