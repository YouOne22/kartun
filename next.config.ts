import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the development UI to be opened from this machine's LAN/Tailscale addresses.
  // Production (`next start`) does not use this development-only setting.
  allowedDevOrigins: ["100.69.221.26", "192.168.123.51"],
};

export default nextConfig;
