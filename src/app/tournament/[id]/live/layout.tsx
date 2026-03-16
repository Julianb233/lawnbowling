import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Live Tournament Dashboard | Lawnbowling",
  description: "Real-time tournament bracket, scores, and standings for clubhouse display",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A2E12",
};

export default function LiveDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="dark">{children}</div>;
}
