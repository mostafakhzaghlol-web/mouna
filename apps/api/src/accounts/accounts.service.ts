import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod";
import { AuditService } from "../audit/audit.service";
import { DB, type Database } from "../db/db.module";
import {
  billingAccounts,
  companies,
  costCentres,
  headcountRecords,
  legalEntities,
  memberships,
  sites,
  users,
} from "../db/schema";
import { parseIdentifier } from "../iam/identifiers";

export const CLIENT_ROLES = ["company_admin", "approver", "requester", "receiver", "finance", "viewer"] as const;
export const RIYADH_ZONES = ["north", "east", "central", "west", "south"] as const;
export const SIZE_BANDS = ["50-99", "100-249", "250-499", "500+"] as const;
export const COMPANY_STATUSES = ["prospect", "onboarding", "active", "on_hold", "churned"] as const;

const bilingualName = { nameAr: z.string().trim().min(1).max(200), nameEn: z.string().trim().min(1).max(200) };

export const CreateCompany = z.object({
  ...bilingualName,
  sizeBand: z.enum(SIZE_BANDS).optional(),
  legalEntity: z.object({
    crNumber: z.string().regex(/^\d{10}$/, "CR number is 10 digits"),
    vatNumber: z
      .string()
      .regex(/^3\d{13}3$/, "VAT number is 15 digits, starting and ending with 3")
      .optional(),
    legalNameAr: z.string().trim().min(1).max(300),
    legalNameEn: z.string().trim().min(1).max(300),
  }),
  billing: z
    .object({
      paymentTermsDays: z.number().int().min(0).max(120).default(45),
      invoiceEmails: z.array(z.email()).max(10).default([]),
      poRequired: z.boolean().default(false),
    })
    .default({ paymentTermsDays: 45, invoiceEmails: [], poRequired: false }),
});

export const CreateSite = z.object({
  ...bilingualName,
  district: z.string().trim().max(100).optional(),
  zone: z.enum(RIYADH_ZONES).optional(),
  nationalAddressCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{4}\d{4}$/, "Short national address is 4 letters + 4 digits")
    .optional(),
  receivingHours: z.string().trim().max(100).optional(),
  accessNotes: z.string().trim().max(1000).optional(),
  headcount: z.number().int().min(1).max(100_000).optional(),
  billingAccountId: z.uuid().optional(),
});

export const CreateCostCentre = z.object({
  code: z.string().trim().min(1).max(30),
  ...bilingualName,
  parentId: z.uuid().optional(),
});

export const InviteMember = z.object({
  fullName: z.string().trim().min(2).max(200),
  identifier: z.string().trim().min(3).max(200),
  roles: z.array(z.enum(CLIENT_ROLES)).min(1),
  locale: z.enum(["ar", "en"]).default("ar"),
  allSites: z.boolean().default(true),
  siteIds: z.array(z.uuid()).default([]),
});

export const RecordHeadcount = z.object({
  count: z.number().int().min(1).max(100_000),
  effectiveFrom: z.iso.date(),
});

export const UpdateCompanyStatus = z.object({ status: z.enum(COMPANY_STATUSES) });

type Actor = { userId: string };

@Injectable()
export class AccountsService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly audit: AuditService,
  ) {}

  async listCompanies(q?: string) {
    const term = q?.trim();
    return this.db
      .select({
        id: companies.id,
        nameAr: companies.nameAr,
        nameEn: companies.nameEn,
        status: companies.status,
        sizeBand: companies.sizeBand,
        createdAt: companies.createdAt,
        // Fully qualified: inside the subquery an unqualified "id" would mean the site's id.
        siteCount: sql<number>`(select count(*)::int from accounts.sites s where s.company_id = "accounts"."companies"."id")`,
      })
      .from(companies)
      .where(term ? or(ilike(companies.nameEn, `%${term}%`), ilike(companies.nameAr, `%${term}%`)) : undefined)
      .orderBy(desc(companies.createdAt))
      .limit(200);
  }

  async createCompany(input: z.infer<typeof CreateCompany>, actor: Actor) {
    const [existing] = await this.db
      .select({ id: legalEntities.id })
      .from(legalEntities)
      .where(eq(legalEntities.crNumber, input.legalEntity.crNumber))
      .limit(1);
    if (existing) throw new ConflictException({ error: "cr_already_registered" });

    return this.db.transaction(async (tx) => {
      const [company] = await tx
        .insert(companies)
        .values({ nameAr: input.nameAr, nameEn: input.nameEn, sizeBand: input.sizeBand ?? null })
        .returning();
      const [entity] = await tx
        .insert(legalEntities)
        .values({ companyId: company!.id, ...input.legalEntity, vatNumber: input.legalEntity.vatNumber ?? null })
        .returning();
      await tx.insert(billingAccounts).values({
        companyId: company!.id,
        legalEntityId: entity!.id,
        name: input.legalEntity.legalNameEn,
        ...input.billing,
      });
      await this.audit.record(
        { actorUserId: actor.userId, companyId: company!.id, action: "company.create", entity: "company", entityId: company!.id, data: input },
        tx,
      );
      return company!;
    });
  }

  private async companyOrFail(companyId: string) {
    const [company] = await this.db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!company) throw new NotFoundException({ error: "company_not_found" });
    return company;
  }

  async updateCompanyStatus(companyId: string, status: (typeof COMPANY_STATUSES)[number], actor: Actor) {
    await this.companyOrFail(companyId);
    const [company] = await this.db.update(companies).set({ status }).where(eq(companies.id, companyId)).returning();
    await this.audit.record({ actorUserId: actor.userId, companyId, action: "company.status", entity: "company", entityId: companyId, data: { status } });
    return company!;
  }

  /** Sites with their latest headcount. `siteIds` limits to a member's scope. */
  async sitesOf(companyId: string, siteIds?: string[]) {
    const rows = await this.db
      .select()
      .from(sites)
      .where(and(eq(sites.companyId, companyId), siteIds ? inArray(sites.id, siteIds.length ? siteIds : ["00000000-0000-0000-0000-000000000000"]) : undefined))
      .orderBy(asc(sites.createdAt));
    if (!rows.length) return [];
    const latest = await this.db.execute<{ site_id: string; count: number; effective_from: string }>(sql`
      select distinct on (site_id) site_id, count, effective_from::text
      from accounts.headcount_records
      where site_id in (${sql.join(rows.map((r) => sql`${r.id}`), sql`, `)})
      order by site_id, effective_from desc, created_at desc`);
    const byId = new Map(latest.rows.map((r) => [r.site_id, r]));
    return rows.map((s) => ({
      ...s,
      headcount: byId.get(s.id)?.count ?? null,
      headcountFrom: byId.get(s.id)?.effective_from ?? null,
    }));
  }

  async companyDetail(companyId: string) {
    const company = await this.companyOrFail(companyId);
    const [entities, billing, siteList, centres, members] = await Promise.all([
      this.db.select().from(legalEntities).where(eq(legalEntities.companyId, companyId)),
      this.db.select().from(billingAccounts).where(eq(billingAccounts.companyId, companyId)),
      this.sitesOf(companyId),
      this.db.select().from(costCentres).where(eq(costCentres.companyId, companyId)).orderBy(asc(costCentres.code)),
      this.membersOf(companyId),
    ]);
    return { company, legalEntities: entities, billingAccounts: billing, sites: siteList, costCentres: centres, members };
  }

  async membersOf(companyId: string) {
    return this.db
      .select({
        id: memberships.id,
        userId: users.id,
        fullName: users.fullName,
        phone: users.phone,
        email: users.email,
        roles: memberships.roles,
        allSites: memberships.allSites,
        siteIds: memberships.siteIds,
        status: memberships.status,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.companyId, companyId))
      .orderBy(asc(memberships.createdAt));
  }

  async addSite(companyId: string, input: z.infer<typeof CreateSite>, actor: Actor) {
    await this.companyOrFail(companyId);
    let billingAccountId = input.billingAccountId;
    if (billingAccountId) {
      const [ba] = await this.db
        .select({ id: billingAccounts.id })
        .from(billingAccounts)
        .where(and(eq(billingAccounts.id, billingAccountId), eq(billingAccounts.companyId, companyId)));
      if (!ba) throw new BadRequestException({ error: "billing_account_not_in_company" });
    } else {
      const [first] = await this.db
        .select({ id: billingAccounts.id })
        .from(billingAccounts)
        .where(eq(billingAccounts.companyId, companyId))
        .orderBy(asc(billingAccounts.createdAt))
        .limit(1);
      billingAccountId = first?.id;
    }

    return this.db.transaction(async (tx) => {
      const { headcount, ...fields } = input;
      const [site] = await tx
        .insert(sites)
        .values({ companyId, ...fields, billingAccountId: billingAccountId ?? null })
        .returning();
      if (headcount) {
        await tx.insert(headcountRecords).values({
          siteId: site!.id,
          count: headcount,
          effectiveFrom: new Date().toISOString().slice(0, 10),
          source: "survey",
        });
      }
      await this.audit.record({ actorUserId: actor.userId, companyId, action: "site.create", entity: "site", entityId: site!.id, data: input }, tx);
      return site!;
    });
  }

  async recordHeadcount(companyId: string, siteId: string, input: z.infer<typeof RecordHeadcount>, actor: Actor, source: "client" | "survey") {
    const [site] = await this.db
      .select({ id: sites.id })
      .from(sites)
      .where(and(eq(sites.id, siteId), eq(sites.companyId, companyId)));
    if (!site) throw new NotFoundException({ error: "site_not_found" });
    const [rec] = await this.db.insert(headcountRecords).values({ siteId, ...input, source }).returning();
    await this.audit.record({ actorUserId: actor.userId, companyId, action: "site.headcount", entity: "site", entityId: siteId, data: input });
    return rec!;
  }

  async siteCompanyId(siteId: string) {
    const [site] = await this.db.select({ companyId: sites.companyId }).from(sites).where(eq(sites.id, siteId));
    if (!site) throw new NotFoundException({ error: "site_not_found" });
    return site.companyId;
  }

  async addCostCentre(companyId: string, input: z.infer<typeof CreateCostCentre>, actor: Actor) {
    await this.companyOrFail(companyId);
    try {
      const [cc] = await this.db.insert(costCentres).values({ companyId, ...input }).returning();
      await this.audit.record({ actorUserId: actor.userId, companyId, action: "cost_centre.create", entity: "cost_centre", entityId: cc!.id, data: input });
      return cc!;
    } catch (err) {
      if ((err as { cause?: { code?: string } }).cause?.code === "23505" || (err as { code?: string }).code === "23505") {
        throw new ConflictException({ error: "cost_centre_code_taken" });
      }
      throw err;
    }
  }

  /** Invite a person to a company. Creates the user if new; they sign in with a code to activate. */
  async inviteMember(companyId: string, input: z.infer<typeof InviteMember>, actor: Actor) {
    await this.companyOrFail(companyId);
    const dest = parseIdentifier(input.identifier);
    if (!dest) throw new BadRequestException({ error: "invalid_identifier" });

    if (!input.allSites) {
      if (!input.siteIds.length) throw new BadRequestException({ error: "sites_required" });
      const owned = await this.db
        .select({ id: sites.id })
        .from(sites)
        .where(and(eq(sites.companyId, companyId), inArray(sites.id, input.siteIds)));
      if (owned.length !== new Set(input.siteIds).size) throw new BadRequestException({ error: "site_not_in_company" });
    }

    return this.db.transaction(async (tx) => {
      const byIdentifier = dest.channel === "email" ? eq(users.email, dest.value) : eq(users.phone, dest.value);
      let [user] = await tx.select().from(users).where(byIdentifier).limit(1);
      if (user?.isStaff) throw new BadRequestException({ error: "staff_account" });
      if (!user) {
        [user] = await tx
          .insert(users)
          .values({
            fullName: input.fullName,
            locale: input.locale,
            phone: dest.channel === "whatsapp" ? dest.value : null,
            email: dest.channel === "email" ? dest.value : null,
          })
          .returning();
      }
      const [existing] = await tx
        .select({ id: memberships.id })
        .from(memberships)
        .where(and(eq(memberships.companyId, companyId), eq(memberships.userId, user!.id)));
      if (existing) throw new ConflictException({ error: "already_member" });

      const [membership] = await tx
        .insert(memberships)
        .values({
          companyId,
          userId: user!.id,
          roles: input.roles,
          allSites: input.allSites,
          siteIds: input.allSites ? [] : input.siteIds,
          invitedBy: actor.userId,
        })
        .returning();
      await this.audit.record(
        { actorUserId: actor.userId, companyId, action: "member.invite", entity: "membership", entityId: membership!.id, data: { roles: input.roles, channel: dest.channel } },
        tx,
      );
      return { membershipId: membership!.id, userId: user!.id, status: membership!.status };
    });
  }
}
