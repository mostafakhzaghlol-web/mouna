import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { SEED } from "../db/seed";
import { createStaffUser, resetTestDatabase, signIn, startApp } from "../test/harness";

describe("sign-in with one-time codes", () => {
  let app: INestApplication;
  before(async () => {
    await resetTestDatabase();
    app = await startApp();
  });
  after(async () => app?.close());

  test("staff signs in with an email code and sees their roles", async () => {
    const agent = await signIn(app, "staff", SEED.staffAdminEmail);
    const { body } = await agent.get("/v1/auth/staff/me").expect(200);
    assert.deepEqual(body.staffRoles, ["super_admin"]);
  });

  test("client signs in with a phone written in local format", async () => {
    const agent = await signIn(app, "client", "0500000001");
    const { body } = await agent.get("/v1/auth/client/me").expect(200);
    assert.ok(body.companyId);
    assert.ok(body.roles.includes("company_admin"));
  });

  test("a staff session does not open the portal, and the reverse", async () => {
    const staff = await signIn(app, "staff", SEED.salesRepEmail);
    await staff.get("/v1/portal/company").expect(401);
    const client = await signIn(app, "client", SEED.clientRequesterPhone);
    await client.get("/v1/ops/companies").expect(401);
  });

  test("unknown numbers get the same answer but no code", async () => {
    const res = await request(app.getHttpServer()).post("/v1/auth/client/code").send({ identifier: "0599999999" }).expect(202);
    assert.equal(res.body.sent, true);
    await request(app.getHttpServer()).get("/v1/dev/last-code").query({ identifier: "0599999999" }).expect(404);
  });

  test("asking again within a minute is refused", async () => {
    const http = request(app.getHttpServer());
    await http.post("/v1/auth/staff/code").send({ identifier: "nobody@mouna.test" }).expect(202);
    const res = await http.post("/v1/auth/staff/code").send({ identifier: "nobody@mouna.test" }).expect(429);
    assert.equal(res.body.error, "too_soon");
  });

  test("a wrong code is rejected, and five wrong tries lock the code", async () => {
    const email = "locked@mouna.test";
    await createStaffUser(email, ["sales_rep"]);
    const http = request(app.getHttpServer());
    await http.post("/v1/auth/staff/code").send({ identifier: email }).expect(202);
    for (let i = 0; i < 5; i++) {
      const res = await http.post("/v1/auth/staff/verify").send({ identifier: email, code: "000000" }).expect(400);
      assert.equal(res.body.error, "invalid_code");
    }
    const { body } = await http.get("/v1/dev/last-code").query({ identifier: email }).expect(200);
    const res = await http.post("/v1/auth/staff/verify").send({ identifier: email, code: body.code }).expect(400);
    assert.equal(res.body.error, "too_many_attempts");
  });

  test("signing out ends the session", async () => {
    const email = "signout@mouna.test";
    await createStaffUser(email, ["sales_rep"]);
    const agent = await signIn(app, "staff", email);
    await agent.post("/v1/auth/staff/sign-out").expect(204);
    await agent.get("/v1/auth/staff/me").expect(401);
  });

  test("invalid identifiers are rejected", async () => {
    await request(app.getHttpServer()).post("/v1/auth/client/code").send({ identifier: "12345" }).expect(400);
  });
});
