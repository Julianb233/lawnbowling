import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import {
  getSportsOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  jsonLd,
} from "@/lib/schema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://lawnbowl.app";

export const metadata: Metadata = {
  title: {
    default: "Lawnbowling — The World's Best Lawn Bowling App",
    template: "%s | Lawnbowling",
  },
  description:
    "Tournament management, club directory, and everything lawn bowling. Check in, draw, score, and manage your club. Free for players.",
  manifest: "/manifest.json",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: "/",
  },
  keywords: [
    "lawn bowling",
    "lawn bowls",
    "lawn bowling app",
    "lawn bowling tournament",
    "lawn bowling clubs",
    "lawn bowling near me",
    "lawn bowling rules",
    "lawn bowling scoring",
    "bowls tournament software",
    "lawn bowling club management",
    "lawn bowling draw generator",
    "lawn bowling kiosk",
    "lawn bowling league",
    "round robin lawn bowling",
    "pick a partner lawn bowls",
  ],
  authors: [{ name: "Lawnbowling", url: BASE_URL }],
  creator: "Lawnbowling",
  publisher: "Lawnbowling",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Lawnbowling",
    title: "Lawnbowling — The World's Best Lawn Bowling App",
    description:
      "Tournament management, club directory, and everything lawn bowling. Free for players, powerful tools for clubs.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Lawnbowling — Tournament management, club directory, and everything lawn bowling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawnbowling — The World's Best Lawn Bowling App",
    description:
      "Tournament management, club directory, and everything lawn bowling. Free for players, powerful tools for clubs.",
    images: ["/opengraph-image.png"],
    creator: "@lawnbowlapp",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lawnbowling",
  },
  category: "sports",
  classification: "Sports Application",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1B5E20",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-iphone.png"
          media="(device-width: 390px)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-ipad-landscape.png"
          media="(min-device-width: 1024px) and (orientation: landscape)"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(getSportsOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(getSoftwareApplicationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd(getWebSiteSchema()),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Floating orbs background */}
        <div className="orb orb-emerald" style={{ width: 400, height: 400, top: '10%', left: '5%' }} />
        <div className="orb orb-blue" style={{ width: 350, height: 350, top: '60%', right: '10%' }} />
        <div className="orb orb-amber" style={{ width: 300, height: 300, bottom: '15%', left: '30%' }} />
        <div className="orb orb-coral" style={{ width: 250, height: 250, top: '30%', right: '25%' }} />
        <div className="orb orb-purple" style={{ width: 200, height: 200, bottom: '40%', left: '60%' }} />
        {children}
        <InstallPrompt />
        <IOSInstallGuide />
        <PushNotificationPrompt />
      </body>
    </html>
  );
}
