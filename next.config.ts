import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/prisma/dev.db**",
        "**/*.db",
        "**/*.db-journal",
        "**/*.db-wal",
        "**/node_modules",
        "**/.git",
      ],
    };
    return config;
  },
};

export default nextConfig;
