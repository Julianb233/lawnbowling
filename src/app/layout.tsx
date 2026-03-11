import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import {
  getSportsOrganizationSchema,
  getSoftwareApplicationSchema,
  getWebSiteSchema,
  jsonLd,
} from "@/lib/schema";
import { SITE_URL } from "@/lib/site-config";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DesktopThemeToggle } from "@/components/DesktopThemeToggle";
import { PlayerOnboarding } from "@/components/onboarding/PlayerOnboarding";
import { DrawmasterTour } from "@/components/onboarding/DrawmasterTour";
import "./globals.css";

// Inline script to set dark class before first paint (prevents FOIT)
const themeInitScript = `(function(){try{var s=localStorage.getItem('lb-color-scheme');if(s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE_URL = SITE_URL;

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
    "lawn bowls app",
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {/* Floating orbs background */}
          <div className="orb orb-emerald" style={{ width: 400, height: 400, top: '10%', left: '5%' }} />
          <div className="orb orb-blue" style={{ width: 350, height: 350, top: '60%', right: '10%' }} />
          <div className="orb orb-amber" style={{ width: 300, height: 300, bottom: '15%', left: '30%' }} />
          <div className="orb orb-coral" style={{ width: 250, height: 250, top: '30%', right: '25%' }} />
          <div className="orb orb-purple" style={{ width: 200, height: 200, bottom: '40%', left: '60%' }} />
          <DesktopThemeToggle />
          {children}
          <PlayerOnboarding />
          <DrawmasterTour />
          <InstallPrompt />
          <IOSInstallGuide />
          <PushNotificationPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
