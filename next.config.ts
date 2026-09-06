import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["diviseek.com", "ioex.top", "localhost"],
};

export default nextConfig;