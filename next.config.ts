import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shareable short links for social bios, signatures, and QR codes.
  async redirects() {
    return [
      { source: "/stamped", destination: "/#dispatch", permanent: false },
      { source: "/quote", destination: "/#request-a-quote", permanent: false },
    ];
  },
};

export default nextConfig;
