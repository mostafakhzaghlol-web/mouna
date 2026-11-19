// Local development PostgreSQL without Docker (virtualization is disabled on this machine).
// Data lives in .data/pg at the repo root. Same user, password and port as docker-compose.yml.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const dataDir = resolve(fileURLToPath(import.meta.url), "../../.data/pg");
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "mouna",
  password: "mouna_dev",
  port: 5432,
  persistent: true,
});

if (!existsSync(resolve(dataDir, "PG_VERSION"))) {
  await pg.initialise();
}
await pg.start();
try {
  await pg.createDatabase("mouna");
} catch {
  /* already exists */
}
console.log("PostgreSQL running on localhost:5432 (db mouna). Ctrl+C to stop.");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
