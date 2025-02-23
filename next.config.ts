import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staleTimes: {
    dynamic: 0,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;