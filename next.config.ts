import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-lib", "nodemailer"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ["192.168.56.1", "localhost", "127.0.0.1"],
};

export default nextConfig;
