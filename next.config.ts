import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const PRODUCTION_DOMAIN = "lawnbowl.app";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: PRODUCTION_DOMAIN,
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@supabase/supabase-js"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

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

export default withSentryConfig(config, {
  // Suppress source map upload logs during build
  silent: true,

  // Upload source maps only when SENTRY_AUTH_TOKEN is set
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Source map settings
  sourcemaps: {
    // Prevent source maps from being sent to the client
    deleteSourcemapsAfterUpload: true,
  },
});
