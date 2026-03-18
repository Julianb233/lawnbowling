import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";
import { PushNotificationPrompt } from "@/components/push/PushNotificationPrompt";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DesktopThemeToggle } from "@/components/DesktopThemeToggle";
import "./globals.css";

// Inline script to set dark class before first paint — default to light mode
// Only go dark if user explicitly chose dark (not based on OS preference)
// Explicitly remove 'dark' class first to ensure light is the default
const themeInitScript = `(function(){try{var t=localStorage.getItem('lb-color-scheme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light'}}catch(e){document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light'}})();`;

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
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Lawnbowling",
  description: "The world's best lawn bowling app — tournament management, club directory, and more",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lawnbowling",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-body), var(--font-geist-sans), sans-serif" }}
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
