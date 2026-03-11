import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Limit static generation workers to prevent ENOENT race conditions
    // on machines with many CPUs (default = nproc, e.g. 48).
    workerThreads: false,
    cpus: 4,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lawnbowl.app",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
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

export default config;
