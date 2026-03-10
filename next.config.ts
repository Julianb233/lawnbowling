import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// Serwist PWA support — disabled for now due to Next.js 16 Turbopack incompatibility.
// Re-enable once @serwist/next supports Turbopack builds.
// See: https://github.com/serwist/serwist/issues/54
let config = nextConfig;

try {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_SERWIST === "1") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const withSerwistInit = require("@serwist/next").default;
    const withSerwist = withSerwistInit({
      swSrc: "src/app/sw.ts",
      swDest: "public/sw.js",
    });
    config = withSerwist(nextConfig);
  }
} catch {
  // Serwist not available, continue without PWA
}

export default config;
