import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lawnbowl.app",
  appName: "LawnBowl",
  // We use the deployed Vercel URL instead of a local static export.
  // This lets us keep all server-side features (API routes, SSR, crons)
  // without needing `output: 'export'` in next.config.ts.
  webDir: "public",
  server: {
    url: "https://www.lawnbowling.app",
    cleartext: false,
  },
  ios: {
    // Scroll behavior
    contentInset: "automatic",
    // Allow navigation to the app domain
    allowsLinkPreview: true,
    // Preferred status bar style
    preferredContentMode: "mobile",
    // Custom URL scheme for deep linking (lawnbowl://)
    scheme: "lawnbowl",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#1a7a4c",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1a7a4c",
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
