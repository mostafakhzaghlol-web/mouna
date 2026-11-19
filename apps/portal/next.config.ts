import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@mouna/ui", "@mouna/brand", "@mouna/i18n"],
  // The browser talks to the API through this app's own origin, so the session cookie stays first-party.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${process.env.API_URL ?? "http://localhost:4000"}/v1/:path*` }];
  },
  async redirects() {
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
};

export default config;
