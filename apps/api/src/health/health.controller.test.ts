import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { HealthController } from "./health.controller";
import { PG_POOL } from "../db/db.module";

async function appWith(pool: { query: () => Promise<unknown> }) {
  const mod = await Test.createTestingModule({
    controllers: [HealthController],
    providers: [{ provide: PG_POOL, useValue: pool }],
  }).compile();
  const app = mod.createNestApplication();
  await app.init();
  return app;
}

test("live is always ok", async () => {
  const app = await appWith({ query: async () => ({}) });
  await request(app.getHttpServer()).get("/health/live").expect(200, { status: "ok" });
  await app.close();
});

test("ready reports the database", async () => {
  const up = await appWith({ query: async () => ({}) });
  await request(up.getHttpServer()).get("/health/ready").expect(200);
  await up.close();

  const down = await appWith({ query: async () => { throw new Error("no db"); } });
  await request(down.getHttpServer()).get("/health/ready").expect(503);
  await down.close();
});
