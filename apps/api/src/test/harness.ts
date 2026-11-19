import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import { Client } from "pg";
import request from "supertest";
import { AppModule } from "../app.module";
import { runMigrations } from "../db/migrate";
import { seed } from "../db/seed";

/** Integration tests run against a separate database, rebuilt from migrations on every run. */
export const TEST_DB_URL = process.env.TEST_DATABASE_URL ?? "postgres://mouna:mouna_dev@localhost:5432/mouna_test";
// Set before the app reads its config; values already in the environment win over .env.
process.env.DATABASE_URL = TEST_DB_URL;

export async function resetTestDatabase() {
  const url = new URL(TEST_DB_URL);
  const dbName = url.pathname.slice(1);
  const admin = new Client({ connectionString: Object.assign(new URL(TEST_DB_URL), { pathname: "/postgres" }).toString() });
  await admin.connect();
  const exists = await admin.query("select 1 from pg_database where datname = $1", [dbName]);
  if (!exists.rowCount) await admin.query(`create database "${dbName}" encoding 'UTF8' template template0`);
  await admin.end();

  const db = new Client({ connectionString: TEST_DB_URL });
  await db.connect();
  await db.query("drop schema if exists iam, accounts, audit, drizzle cascade");
  await db.end();

  await runMigrations(TEST_DB_URL);
  await seed(TEST_DB_URL);
}

export async function startApp(): Promise<INestApplication> {
  const mod = await Test.createTestingModule({ imports: [AppModule.register()] }).compile();
  const app = mod.createNestApplication();
  app.use(cookieParser());
  app.setGlobalPrefix("v1", { exclude: ["health/(.*)"] });
  await app.init();
  return app;
}

/** Sign in through the real code flow and return an agent that carries the session cookie. */
export async function signIn(app: INestApplication, audience: "staff" | "client", identifier: string) {
  const agent = request.agent(app.getHttpServer());
  await agent.post(`/v1/auth/${audience}/code`).send({ identifier }).expect(202);
  const { body } = await agent.get("/v1/dev/last-code").query({ identifier }).expect(200);
  await agent.post(`/v1/auth/${audience}/verify`).send({ identifier, code: body.code }).expect(200);
  return agent;
}

/** Create a fresh staff user so a test does not share rate limits with others. */
export async function createStaffUser(email: string, roles: string[]) {
  const db = new Client({ connectionString: TEST_DB_URL });
  await db.connect();
  const { rows } = await db.query<{ id: string }>(
    "insert into iam.users (full_name, email, is_staff, locale) values ($1, $2, true, 'en') returning id",
    [email, email],
  );
  for (const role of roles) await db.query("insert into iam.staff_roles (user_id, role) values ($1, $2)", [rows[0]!.id, role]);
  await db.end();
  return rows[0]!.id;
}
