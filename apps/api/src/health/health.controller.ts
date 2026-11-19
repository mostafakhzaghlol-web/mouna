import { Controller, Get, HttpCode, Inject, ServiceUnavailableException } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../db/db.module";

@Controller("health")
export class HealthController {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Liveness: the process is up. */
  @Get("live")
  live() {
    return { status: "ok" };
  }

  /** Readiness: the database answers. Load balancers route traffic only when this is ok. */
  @Get("ready")
  @HttpCode(200)
  async ready() {
    try {
      await this.pool.query("select 1");
      return { status: "ok", database: "ok" };
    } catch {
      throw new ServiceUnavailableException({ status: "unavailable", database: "down" });
    }
  }
}
