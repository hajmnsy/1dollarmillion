import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Remove output: "standalone" — Vercel handles this automatically
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Allow the preview sandbox hostname to access Next.js dev resources
  allowedDevOrigins: ["*.space-z.ai"],
};

export default withNextIntl(nextConfig);
