/**
 * Development seed data. Safe to run more than once. Never run against production.
 * Uses .test addresses and the 0500000xxx number range, which are not real.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadConfig } from "../config";
import { billingAccounts, companies, costCentres, headcountRecords, legalEntities, memberships, sites, staffRoles, users } from "./schema";

export const SEED = {
  staffAdminEmail: "admin@mouna.test",
  salesRepEmail: "sales@mouna.test",
  clientAdminPhone: "+966500000001",
  clientRequesterPhone: "+966500000002",
  demoCr: "1010000001",
};

export async function seed(databaseUrl: string) {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed production");
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);
  try {
    await db.transaction(async (tx) => {
      const ensureUser = async (values: typeof users.$inferInsert, where: ReturnType<typeof eq>) => {
        const [found] = await tx.select().from(users).where(where).limit(1);
        return found ?? (await tx.insert(users).values(values).returning())[0]!;
      };

      const admin = await ensureUser(
        { fullName: "Mouna Admin", email: SEED.staffAdminEmail, isStaff: true, locale: "en" },
        eq(users.email, SEED.staffAdminEmail),
      );
      const rep = await ensureUser(
        { fullName: "Sales Rep", email: SEED.salesRepEmail, isStaff: true, locale: "ar" },
        eq(users.email, SEED.salesRepEmail),
      );
      await tx.insert(staffRoles).values([
        { userId: admin.id, role: "super_admin" },
        { userId: rep.id, role: "sales_rep" },
      ]).onConflictDoNothing();

      const [existing] = await tx.select().from(legalEntities).where(eq(legalEntities.crNumber, SEED.demoCr)).limit(1);
      if (existing) return;

      const [company] = await tx
        .insert(companies)
        .values({ nameAr: "شركة التجربة التجارية", nameEn: "Demo Trading Co.", status: "active", sizeBand: "100-249", accountManagerId: rep.id })
        .returning();
      const [entity] = await tx
        .insert(legalEntities)
        .values({
          companyId: company!.id,
          crNumber: SEED.demoCr,
          vatNumber: "300000000000003",
          legalNameAr: "شركة التجربة التجارية المحدودة",
          legalNameEn: "Demo Trading Co. Ltd",
        })
        .returning();
      const [billing] = await tx
        .insert(billingAccounts)
        .values({ companyId: company!.id, legalEntityId: entity!.id, name: "Demo Trading Co. Ltd", invoiceEmails: ["finance@demo.test"] })
        .returning();
      const [hq, branch] = await tx
        .insert(sites)
        .values([
          { companyId: company!.id, billingAccountId: billing!.id, nameAr: "المقر الرئيسي - العليا", nameEn: "Head office - Olaya", district: "Al Olaya", zone: "central", receivingHours: "Sun–Thu 8:00–16:00" },
          { companyId: company!.id, billingAccountId: billing!.id, nameAr: "فرع الملقا", nameEn: "Al Malqa branch", district: "Al Malqa", zone: "north", receivingHours: "Sun–Thu 9:00–15:00" },
        ])
        .returning();
      await tx.insert(headcountRecords).values([
        { siteId: hq!.id, count: 120, effectiveFrom: "2026-11-01", source: "survey" },
        { siteId: branch!.id, count: 35, effectiveFrom: "2026-11-01", source: "survey" },
      ]);
      await tx.insert(costCentres).values([
        { companyId: company!.id, code: "ADM", nameAr: "الإدارة", nameEn: "Administration" },
        { companyId: company!.id, code: "HR", nameAr: "الموارد البشرية", nameEn: "Human Resources" },
      ]);

      const clientAdmin = await ensureUser(
        { fullName: "سارة العتيبي", phone: SEED.clientAdminPhone, locale: "ar" },
        eq(users.phone, SEED.clientAdminPhone),
      );
      const requester = await ensureUser(
        { fullName: "Omar Requester", phone: SEED.clientRequesterPhone, locale: "en" },
        eq(users.phone, SEED.clientRequesterPhone),
      );
      await tx.insert(memberships).values([
        { companyId: company!.id, userId: clientAdmin.id, roles: ["company_admin", "approver", "finance"], invitedBy: rep.id },
        { companyId: company!.id, userId: requester.id, roles: ["requester"], allSites: false, siteIds: [branch!.id], invitedBy: rep.id },
      ]);
    });
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed(loadConfig().databaseUrl).then(
    () => console.log("Seed data ready."),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
