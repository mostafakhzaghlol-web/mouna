import { existsSync } from "node:fs";
import { resolve } from "node:path";

/** Loads the repo-root .env in development. In staging/production, variables come from the platform's secret store. */
export function loadConfig() {
  const envFile = resolve(__dirname, "../../../.env");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  return {
    port: Number(process.env.API_PORT ?? 4000),
    databaseUrl: process.env.DATABASE_URL ?? "postgres://mouna:mouna_dev@localhost:5432/mouna",
  };
}

export type AppConfig = ReturnType<typeof loadConfig>;
