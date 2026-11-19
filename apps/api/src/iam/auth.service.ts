import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { and, asc, desc, eq, gt, inArray, isNull, ne, sql } from "drizzle-orm";
import { AuditService } from "../audit/audit.service";
import { DB, type Database } from "../db/db.module";
import { companies, memberships, otpChallenges, sessions, staffRoles, users } from "../db/schema";
import { CODE_SENDER, type CodeSender } from "./code-sender";
import { hashSecret, newCode, newSessionToken, sameHash } from "./crypto";
import { parseIdentifier, type Destination } from "./identifiers";

export type Audience = "client" | "staff";

export const AUTH_RULES = {
  codeTtlMs: 5 * 60_000,
  resendAfterMs: 60_000,
  maxCodesPerHour: 5,
  maxAttempts: 5,
  sessionTtlMs: { staff: 12 * 3600_000, client: 30 * 24 * 3600_000 } satisfies Record<Audience, number>,
};

type User = typeof users.$inferSelect;

export type AuthContext = {
  sessionId: string;
  audience: Audience;
  user: Pick<User, "id" | "fullName" | "phone" | "email" | "locale">;
  staffRoles: string[];
  companyId: string | null;
  membership: { id: string; roles: string[]; allSites: boolean; siteIds: string[] } | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(CODE_SENDER) private readonly sender: CodeSender,
    private readonly audit: AuditService,
  ) {}

  private destinationOrFail(identifier: string): Destination {
    const dest = parseIdentifier(identifier);
    if (!dest) throw new BadRequestException({ error: "invalid_identifier" });
    return dest;
  }

  private async findUser(dest: Destination): Promise<User | undefined> {
    const where = dest.channel === "email" ? eq(users.email, dest.value) : eq(users.phone, dest.value);
    const [user] = await this.db.select().from(users).where(where).limit(1);
    return user;
  }

  /** Client users may sign in only with an invited or active membership in a company that has not left. */
  private async clientMemberships(userId: string) {
    return this.db
      .select({ m: memberships })
      .from(memberships)
      .innerJoin(companies, eq(companies.id, memberships.companyId))
      .where(
        and(
          eq(memberships.userId, userId),
          inArray(memberships.status, ["invited", "active"]),
          ne(companies.status, "churned"),
        ),
      )
      .orderBy(asc(memberships.createdAt))
      .then((rows) => rows.map((r) => r.m));
  }

  private async isEligible(user: User | undefined, audience: Audience): Promise<boolean> {
    if (!user || user.status !== "active") return false;
    if (audience === "staff") return user.isStaff;
    return (await this.clientMemberships(user.id)).length > 0;
  }

  /**
   * Send a one-time code. Always answers the same way whether or not an account exists,
   * so the endpoint cannot be used to discover who is a client.
   */
  async requestCode(audience: Audience, identifier: string) {
    const dest = this.destinationOrFail(identifier);
    const now = Date.now();

    const recent = await this.db
      .select({ createdAt: otpChallenges.createdAt })
      .from(otpChallenges)
      .where(and(eq(otpChallenges.destination, dest.value), gt(otpChallenges.createdAt, new Date(now - 3600_000))))
      .orderBy(desc(otpChallenges.createdAt));

    const last = recent[0];
    if (last && now - last.createdAt.getTime() < AUTH_RULES.resendAfterMs) {
      const wait = Math.ceil((AUTH_RULES.resendAfterMs - (now - last.createdAt.getTime())) / 1000);
      throw new HttpException({ error: "too_soon", retryAfterSeconds: wait }, HttpStatus.TOO_MANY_REQUESTS);
    }
    if (recent.length >= AUTH_RULES.maxCodesPerHour) {
      throw new HttpException({ error: "too_many_codes" }, HttpStatus.TOO_MANY_REQUESTS);
    }

    const user = await this.findUser(dest);
    const eligible = await this.isEligible(user, audience);
    const code = newCode();

    // A challenge is stored either way so rate limits apply equally to unknown destinations.
    await this.db.insert(otpChallenges).values({
      audience,
      channel: dest.channel,
      destination: dest.value,
      codeHash: hashSecret(eligible ? `${dest.value}:${code}` : `unusable:${newSessionToken()}`),
      expiresAt: new Date(now + AUTH_RULES.codeTtlMs),
    });

    if (eligible && user) {
      await this.sender.send(dest, code, user.locale === "en" ? "en" : "ar");
    } else {
      this.logger.log(`No ${audience} account for ${dest.value}; no code sent.`);
    }
    return { sent: true, channel: dest.channel, retryAfterSeconds: AUTH_RULES.resendAfterMs / 1000 };
  }

  async verifyCode(audience: Audience, identifier: string, code: string, meta: { ip?: string; userAgent?: string }) {
    const dest = this.destinationOrFail(identifier);
    const now = new Date();

    const [challenge] = await this.db
      .select()
      .from(otpChallenges)
      .where(
        and(
          eq(otpChallenges.destination, dest.value),
          eq(otpChallenges.audience, audience),
          isNull(otpChallenges.consumedAt),
          gt(otpChallenges.expiresAt, now),
        ),
      )
      .orderBy(desc(otpChallenges.createdAt))
      .limit(1);

    if (!challenge) throw new BadRequestException({ error: "invalid_code" });
    if (challenge.attempts >= AUTH_RULES.maxAttempts) throw new BadRequestException({ error: "too_many_attempts" });

    await this.db
      .update(otpChallenges)
      .set({ attempts: sql`${otpChallenges.attempts} + 1` })
      .where(eq(otpChallenges.id, challenge.id));

    if (!sameHash(challenge.codeHash, hashSecret(`${dest.value}:${code.trim()}`))) {
      throw new BadRequestException({ error: "invalid_code" });
    }

    const user = await this.findUser(dest);
    if (!user || !(await this.isEligible(user, audience))) throw new BadRequestException({ error: "invalid_code" });

    await this.db.update(otpChallenges).set({ consumedAt: now }).where(eq(otpChallenges.id, challenge.id));

    let companyId: string | null = null;
    if (audience === "client") {
      const ms = await this.clientMemberships(user.id);
      await this.db
        .update(memberships)
        .set({ status: "active" })
        .where(and(eq(memberships.userId, user.id), eq(memberships.status, "invited")));
      companyId = ms[0]?.companyId ?? null;
    }

    const token = newSessionToken();
    const expiresAt = new Date(now.getTime() + AUTH_RULES.sessionTtlMs[audience]);
    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        tokenHash: hashSecret(token),
        audience,
        companyId,
        expiresAt,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      })
      .returning({ id: sessions.id });

    await this.audit.record({
      actorUserId: user.id,
      companyId,
      action: "auth.sign_in",
      entity: "session",
      entityId: session!.id,
      data: { audience, channel: dest.channel },
    });

    return { token, expiresAt, user: { id: user.id, fullName: user.fullName, locale: user.locale } };
  }

  async contextFromToken(audience: Audience, token: string | undefined): Promise<AuthContext | null> {
    if (!token) return null;
    const [row] = await this.db
      .select({ s: sessions, u: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, hashSecret(token)), eq(sessions.audience, audience)))
      .limit(1);
    if (!row || row.s.revokedAt || row.s.expiresAt <= new Date() || row.u.status !== "active") return null;

    const roles =
      audience === "staff"
        ? (await this.db.select({ role: staffRoles.role }).from(staffRoles).where(eq(staffRoles.userId, row.u.id))).map(
            (r) => r.role,
          )
        : [];

    let membership: AuthContext["membership"] = null;
    if (audience === "client" && row.s.companyId) {
      const [m] = await this.db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.userId, row.u.id),
            eq(memberships.companyId, row.s.companyId),
            eq(memberships.status, "active"),
          ),
        )
        .limit(1);
      if (!m) return null; // membership removed since sign-in
      membership = { id: m.id, roles: m.roles, allSites: m.allSites, siteIds: m.siteIds };
    }

    return {
      sessionId: row.s.id,
      audience,
      user: { id: row.u.id, fullName: row.u.fullName, phone: row.u.phone, email: row.u.email, locale: row.u.locale },
      staffRoles: roles,
      companyId: row.s.companyId,
      membership,
    };
  }

  async signOut(sessionId: string) {
    await this.db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
  }
}
