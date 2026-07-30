import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Instagram desk at /internal/instagram reads the content bank off disk
  // rather than out of /public, so those files have to be traced into the
  // serverless bundle explicitly — otherwise the desk is empty in production
  // while working perfectly in dev.
  outputFileTracingIncludes: {
    "/internal/instagram": ["./content/instagram/**/*.{json,md}"],
    "/internal/instagram/[type]/[slug]": ["./content/instagram/**/*.{json,md}"],
    "/internal/instagram/asset/[...path]": ["./content/instagram/**/*.jpg"],
  },

  // Shareable short links for social bios, signatures, and QR codes.
  async redirects() {
    return [
      { source: "/stamped", destination: "/#dispatch", permanent: false },
      { source: "/quote", destination: "/#request-a-quote", permanent: false },
    ];
  },
};

export default nextConfig;
