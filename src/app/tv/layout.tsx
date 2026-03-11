import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "TV Scoreboard | Lawnbowling",
  description: "Live tournament scoreboard for clubhouse TV display",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function TVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark">{children}</div>;
}
