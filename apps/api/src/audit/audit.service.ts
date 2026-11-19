import { Inject, Injectable } from "@nestjs/common";
import { DB, type Database } from "../db/db.module";
import { auditLog } from "../db/schema";

export type AuditEntry = {
  actorUserId: string | null;
  companyId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  data?: unknown;
};

@Injectable()
export class AuditService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async record(entry: AuditEntry, tx: Pick<Database, "insert"> = this.db) {
    await tx.insert(auditLog).values({
      actorUserId: entry.actorUserId,
      companyId: entry.companyId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      data: entry.data ?? null,
    });
  }
}
