import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.skillindiadigital.gov.in",
      },
      {
        protocol: "https",
        hostname: "ncvet.gov.in",
      },
      {
        protocol: "https",
        hostname: "www.ictpi.org",
      },
    ],
  },
};

export default nextConfig;
