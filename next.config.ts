import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship the vendored OG-card fonts in any serverless bundle that renders an
  // OpenGraph image on demand (e.g. a journey slug added after build time).
  outputFileTracingIncludes: {
    "/**/opengraph-image": ["./src/lib/fonts/**"],
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
