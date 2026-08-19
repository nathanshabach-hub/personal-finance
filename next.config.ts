import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
