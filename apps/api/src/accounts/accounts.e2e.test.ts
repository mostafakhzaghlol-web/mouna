import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import type { INestApplication } from "@nestjs/common";
import { createStaffUser, resetTestDatabase, signIn, startApp } from "../test/harness";

describe("companies, sites and members", () => {
  let app: INestApplication;
  before(async () => {
    await resetTestDatabase();
    app = await startApp();
  });
  after(async () => app?.close());

  test("stage 1 'done when': staff creates a company with two sites, invites an admin, who signs in", async () => {
    await createStaffUser("rep1@mouna.test", ["sales_rep"]);
    const staff = await signIn(app, "staff", "rep1@mouna.test");

    const { body: company } = await staff
      .post("/v1/ops/companies")
      .send({
        nameAr: "شركة النخبة",
        nameEn: "Elite Co.",
        sizeBand: "100-249",
        legalEntity: { crNumber: "1010123456", vatNumber: "310123456700003", legalNameAr: "شركة النخبة المحدودة", legalNameEn: "Elite Co. Ltd" },
      })
      .expect(201);

    await staff.post(`/v1/ops/companies/${company.id}/sites`).send({ nameAr: "المقر", nameEn: "HQ", zone: "central", headcount: 80 }).expect(201);
    await staff.post(`/v1/ops/companies/${company.id}/sites`).send({ nameAr: "المستودع", nameEn: "Warehouse", zone: "south", nationalAddressCode: "RSAA1234" }).expect(201);
    await staff
      .post(`/v1/ops/companies/${company.id}/members`)
      .send({ fullName: "Faisal Admin", identifier: "0551112222", roles: ["company_admin"], locale: "en" })
      .expect(201);

    const { body: detail } = await staff.get(`/v1/ops/companies/${company.id}`).expect(200);
    assert.equal(detail.sites.length, 2);
    assert.equal(detail.sites[0].headcount, 80);
    assert.equal(detail.billingAccounts.length, 1);
    assert.equal(detail.members[0].status, "invited");

    const { body: list } = await staff.get("/v1/ops/companies").query({ q: "Elite" }).expect(200);
    assert.equal(list[0].siteCount, 2);

    const client = await signIn(app, "client", "+966551112222");
    const { body: portal } = await client.get("/v1/portal/company").expect(200);
    assert.equal(portal.company.nameEn, "Elite Co.");
    assert.equal(portal.sites.length, 2);
    assert.deepEqual(portal.me.roles, ["company_admin"]);
  });

  test("the same CR cannot be registered twice", async () => {
    await createStaffUser("rep2@mouna.test", ["sales_rep"]);
    const staff = await signIn(app, "staff", "rep2@mouna.test");
    const res = await staff
      .post("/v1/ops/companies")
      .send({ nameAr: "مكرر", nameEn: "Duplicate", legalEntity: { crNumber: "1010000001", legalNameAr: "مكرر", legalNameEn: "Duplicate" } })
      .expect(409);
    assert.equal(res.body.error, "cr_already_registered");
  });

  test("bad input gets clear field errors", async () => {
    await createStaffUser("rep3@mouna.test", ["sales_rep"]);
    const staff = await signIn(app, "staff", "rep3@mouna.test");
    const res = await staff.post("/v1/ops/companies").send({ nameAr: "", nameEn: "X", legalEntity: { crNumber: "12" } }).expect(400);
    const paths = res.body.issues.map((i: { path: string }) => i.path);
    assert.ok(paths.includes("nameAr"));
    assert.ok(paths.includes("legalEntity.crNumber"));
  });

  test("staff without a sales or account role cannot manage companies", async () => {
    await createStaffUser("driver@mouna.test", ["driver"]);
    const driver = await signIn(app, "staff", "driver@mouna.test");
    await driver.get("/v1/ops/companies").expect(403);
  });

  test("a requester limited to one site sees only that site and cannot invite", async () => {
    const requester = await signIn(app, "client", "0500000002");
    const { body } = await requester.get("/v1/portal/company").expect(200);
    assert.equal(body.sites.length, 1);
    assert.equal(body.sites[0].nameEn, "Al Malqa branch");
    await requester.post("/v1/portal/members").send({ fullName: "X Y", identifier: "0551234567", roles: ["requester"] }).expect(403);
  });

  test("a client admin cannot record headcount for another company's site", async () => {
    await createStaffUser("rep4@mouna.test", ["sales_rep"]);
    const staff = await signIn(app, "staff", "rep4@mouna.test");
    const { body: other } = await staff
      .post("/v1/ops/companies")
      .send({ nameAr: "أخرى", nameEn: "Other Co.", legalEntity: { crNumber: "1010999999", legalNameAr: "أخرى", legalNameEn: "Other Co." } })
      .expect(201);
    const { body: otherSite } = await staff.post(`/v1/ops/companies/${other.id}/sites`).send({ nameAr: "موقع", nameEn: "Site" }).expect(201);

    const admin = await signIn(app, "client", "0500000001");
    await admin.post(`/v1/portal/sites/${otherSite.id}/headcount`).send({ count: 10, effectiveFrom: "2026-12-01" }).expect(404);
  });
});
