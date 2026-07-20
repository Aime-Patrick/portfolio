import type { NextConfig } from "next";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Hide the Next.js “N” badge during local dev (errors still surface)
  devIndicators: false,
  serverExternalPackages: ["firecrawl", "undici"],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: path.dirname(require.resolve("undici/package.json")),
    };
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 90, 92],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
  },
};

export default nextConfig;
