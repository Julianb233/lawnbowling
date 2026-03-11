import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DesktopThemeToggle } from "@/components/DesktopThemeToggle";
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

export const metadata: Metadata = {
  title: "Pick a Partner",
  description: "Find your sports partner at the venue",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pick a Partner",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#22c55e",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <DesktopThemeToggle />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
