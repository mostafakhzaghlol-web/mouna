CREATE SCHEMA "accounts";
--> statement-breakpoint
CREATE SCHEMA "audit";
--> statement-breakpoint
CREATE SCHEMA "iam";
--> statement-breakpoint
CREATE TABLE "audit"."log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" uuid,
	"company_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"data" jsonb
);
--> statement-breakpoint
CREATE TABLE "accounts"."billing_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"legal_entity_id" uuid NOT NULL,
	"name" text NOT NULL,
	"invoice_emails" text[] DEFAULT '{}'::text[] NOT NULL,
	"payment_terms_days" integer DEFAULT 45 NOT NULL,
	"po_required" boolean DEFAULT false NOT NULL,
	"grouping" text DEFAULT 'account' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"status" text DEFAULT 'onboarding' NOT NULL,
	"size_band" text,
	"account_manager_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."cost_centres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."headcount_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"count" integer NOT NULL,
	"effective_from" date NOT NULL,
	"source" text DEFAULT 'client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."legal_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"cr_number" text NOT NULL,
	"vat_number" text,
	"legal_name_ar" text NOT NULL,
	"legal_name_en" text NOT NULL,
	"address" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"roles" text[] NOT NULL,
	"all_sites" boolean DEFAULT true NOT NULL,
	"site_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"cost_centre_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"approval_limit_halalas" bigint,
	"status" text DEFAULT 'invited' NOT NULL,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."otp_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audience" text NOT NULL,
	"channel" text NOT NULL,
	"destination" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"audience" text NOT NULL,
	"company_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts"."sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"billing_account_id" uuid,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"city" text DEFAULT 'Riyadh' NOT NULL,
	"district" text,
	"national_address_code" text,
	"lat" double precision,
	"lng" double precision,
	"zone" text,
	"receiving_hours" text,
	"access_notes" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."staff_roles" (
	"user_id" uuid NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "iam"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text,
	"email" text,
	"full_name" text NOT NULL,
	"locale" text DEFAULT 'ar' NOT NULL,
	"is_staff" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts"."billing_accounts" ADD CONSTRAINT "billing_accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "accounts"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."billing_accounts" ADD CONSTRAINT "billing_accounts_legal_entity_id_legal_entities_id_fk" FOREIGN KEY ("legal_entity_id") REFERENCES "accounts"."legal_entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."companies" ADD CONSTRAINT "companies_account_manager_id_users_id_fk" FOREIGN KEY ("account_manager_id") REFERENCES "iam"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."cost_centres" ADD CONSTRAINT "cost_centres_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "accounts"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."headcount_records" ADD CONSTRAINT "headcount_records_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "accounts"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."legal_entities" ADD CONSTRAINT "legal_entities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "accounts"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."memberships" ADD CONSTRAINT "memberships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "accounts"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "iam"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."memberships" ADD CONSTRAINT "memberships_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "iam"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "iam"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."sites" ADD CONSTRAINT "sites_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "accounts"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts"."sites" ADD CONSTRAINT "sites_billing_account_id_billing_accounts_id_fk" FOREIGN KEY ("billing_account_id") REFERENCES "accounts"."billing_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "iam"."staff_roles" ADD CONSTRAINT "staff_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "iam"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit"."log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cost_centres_code_uq" ON "accounts"."cost_centres" USING btree ("company_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "legal_entities_cr_uq" ON "accounts"."legal_entities" USING btree ("cr_number");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_uq" ON "accounts"."memberships" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE INDEX "otp_destination_idx" ON "iam"."otp_challenges" USING btree ("destination","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_uq" ON "iam"."sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sites_company_idx" ON "accounts"."sites" USING btree ("company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_roles_uq" ON "iam"."staff_roles" USING btree ("user_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_uq" ON "iam"."users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "iam"."users" USING btree ("email");