import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "highsoftsistemas.com.br",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
