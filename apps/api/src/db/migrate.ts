import { resolve } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { loadConfig } from "../config";

export async function runMigrations(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await migrate(drizzle(pool), { migrationsFolder: resolve(__dirname, "../../drizzle") });
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigrations(loadConfig().databaseUrl).then(
    () => console.log("Migrations applied."),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
