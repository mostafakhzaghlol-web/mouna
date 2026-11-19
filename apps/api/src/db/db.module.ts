import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadConfig } from "../config";

export const PG_POOL = Symbol("PG_POOL");
export const DB = Symbol("DB");
export type Database = NodePgDatabase;

@Global()
@Module({
  providers: [
    { provide: PG_POOL, useFactory: () => new Pool({ connectionString: loadConfig().databaseUrl, max: 10 }) },
    { provide: DB, inject: [PG_POOL], useFactory: (pool: Pool) => drizzle(pool) },
  ],
  exports: [PG_POOL, DB],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}
  async onApplicationShutdown() {
    await this.pool.end();
  }
}
