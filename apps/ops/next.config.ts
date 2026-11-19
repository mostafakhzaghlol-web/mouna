import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@mouna/ui", "@mouna/brand", "@mouna/i18n"],
  async redirects() {
    return [{ source: "/", destination: "/ar", permanent: false }];
  },
};

export default config;
