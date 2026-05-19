const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "giophim.libsys.me", "api.libsys.me"],
  outputFileTracingRoot: path.join(__dirname),
  compiler: {
    emotion: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "lucide-react"],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.cache = {
        type: "memory",
        maxGenerations: 1,
      };
      if (!isServer) {
        config.optimization = config.optimization || {};
        config.optimization.runtimeChunk = "single";
        config.optimization.splitChunks = {
          chunks: "all",
          maxInitialRequests: 25,
          minSize: 20000,
        };
      }
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "giophim.libsys.me",
      },
      {
        protocol: "https",
        hostname: "api.libsys.me",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.libsys.me/api/v1",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://giophim.libsys.me",
  },
};

module.exports = nextConfig;
