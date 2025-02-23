import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staleTimes: {
    dynamic: 0,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;