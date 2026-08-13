import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the development UI to be opened from this machine's LAN/Tailscale addresses.
  // Production (`next start`) does not use this development-only setting.
  allowedDevOrigins: ["100.69.221.26", "192.168.123.51"],
  typescript: {
    // Mengizinkan build tetap berjalan walaupun ada error TypeScript
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengizinkan build tetap berjalan walaupun ada warning/error ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;