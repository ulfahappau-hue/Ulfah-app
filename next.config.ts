import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres", "twilio", "@electric-sql/pglite"],
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: [
        "www.ulfah.com.au",
        "ulfah.com.au",
        "ulfah-app.vercel.app",
      ],
    },
  },
};

export default nextConfig;
