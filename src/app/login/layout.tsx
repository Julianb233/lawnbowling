import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | LawnBowl",
  description:
    "Sign in to your LawnBowl account to manage tournaments, view scores, and connect with your club.",
  openGraph: {
    title: "Sign In | LawnBowl",
    description:
      "Sign in to your LawnBowl account to manage tournaments, view scores, and connect with your club.",
    url: "https://www.lawnbowling.app/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
