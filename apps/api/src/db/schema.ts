/**
 * Database schema. Each module owns its own PostgreSQL schema (see docs/architecture/01 §4).
 * Money is stored as integer halalas (bigint). Every client-owned row carries company_id.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/* ───────────────────────── Identity & access ───────────────────────── */

export const iam = pgSchema("iam");

export const users = iam.table(
  "users",
  {
    id: id(),
    phone: text("phone"), // E.164, e.g. +9665XXXXXXXX
    email: text("email"), // stored lower-case
    fullName: text("full_name").notNull(),
    locale: text("locale").notNull().default("ar"),
    isStaff: boolean("is_staff").notNull().default(false),
    status: text("status").notNull().default("active"), // active | disabled
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_phone_uq").on(t.phone), uniqueIndex("users_email_uq").on(t.email)],
);

/** Mouna staff roles (docs/architecture/03 §2). */
export const staffRoles = iam.table(
  "staff_roles",
  {
    userId: uuid("user_id").notNull().references(() => users.id),
    role: text("role").notNull(),
    grantedAt: createdAt(),
  },
  (t) => [uniqueIndex("staff_roles_uq").on(t.userId, t.role)],
);

export const otpChallenges = iam.table(
  "otp_challenges",
  {
    id: id(),
    audience: text("audience").notNull(), // client | staff
    channel: text("channel").notNull(), // whatsapp | email
    destination: text("destination").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("otp_destination_idx").on(t.destination, t.createdAt)],
);

export const sessions = iam.table(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    audience: text("audience").notNull(), // client | staff
    companyId: uuid("company_id"), // client sessions: the company currently being worked in
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sessions_token_uq").on(t.tokenHash)],
);

/* ───────────────────────── Accounts & sites ───────────────────────── */

export const accounts = pgSchema("accounts");

export const companies = accounts.table("companies", {
  id: id(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  status: text("status").notNull().default("onboarding"), // prospect | onboarding | active | on_hold | churned
  sizeBand: text("size_band"), // 50-99 | 100-249 | 250-499 | 500+
  accountManagerId: uuid("account_manager_id").references(() => users.id),
  createdAt: createdAt(),
});

export const legalEntities = accounts.table(
  "legal_entities",
  {
    id: id(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    crNumber: text("cr_number").notNull(),
    vatNumber: text("vat_number"),
    legalNameAr: text("legal_name_ar").notNull(),
    legalNameEn: text("legal_name_en").notNull(),
    address: jsonb("address"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("legal_entities_cr_uq").on(t.crNumber)],
);

export const billingAccounts = accounts.table("billing_accounts", {
  id: id(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  legalEntityId: uuid("legal_entity_id").notNull().references(() => legalEntities.id),
  name: text("name").notNull(),
  invoiceEmails: text("invoice_emails").array().notNull().default(sql`'{}'::text[]`),
  paymentTermsDays: integer("payment_terms_days").notNull().default(45),
  poRequired: boolean("po_required").notNull().default(false),
  grouping: text("grouping").notNull().default("account"), // account | site | cost_centre
  createdAt: createdAt(),
});

export const sites = accounts.table(
  "sites",
  {
    id: id(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    billingAccountId: uuid("billing_account_id").references(() => billingAccounts.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    city: text("city").notNull().default("Riyadh"),
    district: text("district"),
    nationalAddressCode: text("national_address_code"), // short address, e.g. RRRD2929
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    zone: text("zone"), // north | east | central | west | south
    receivingHours: text("receiving_hours"),
    accessNotes: text("access_notes"),
    status: text("status").notNull().default("active"),
    createdAt: createdAt(),
  },
  (t) => [index("sites_company_idx").on(t.companyId)],
);

/** Headcount history per site: needed for cost per employee. */
export const headcountRecords = accounts.table("headcount_records", {
  id: id(),
  siteId: uuid("site_id").notNull().references(() => sites.id),
  count: integer("count").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  source: text("source").notNull().default("client"), // client | survey
  createdAt: createdAt(),
});

export const costCentres = accounts.table(
  "cost_centres",
  {
    id: id(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    code: text("code").notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    parentId: uuid("parent_id"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("cost_centres_code_uq").on(t.companyId, t.code)],
);

/** A user's roles inside one client company (docs/architecture/03 §1). */
export const memberships = accounts.table(
  "memberships",
  {
    id: id(),
    companyId: uuid("company_id").notNull().references(() => companies.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    roles: text("roles").array().notNull(),
    allSites: boolean("all_sites").notNull().default(true),
    siteIds: uuid("site_ids").array().notNull().default(sql`'{}'::uuid[]`),
    costCentreIds: uuid("cost_centre_ids").array().notNull().default(sql`'{}'::uuid[]`),
    approvalLimitHalalas: bigint("approval_limit_halalas", { mode: "number" }),
    status: text("status").notNull().default("invited"), // invited | active | disabled
    invitedBy: uuid("invited_by").references(() => users.id),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("memberships_uq").on(t.companyId, t.userId)],
);

/* ───────────────────────── Audit ───────────────────────── */

export const audit = pgSchema("audit");

/** Append-only: who did what, when, on whose behalf. */
export const auditLog = audit.table(
  "log",
  {
    id: id(),
    at: createdAt(),
    actorUserId: uuid("actor_user_id"),
    companyId: uuid("company_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: uuid("entity_id"),
    data: jsonb("data"),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)],
);
