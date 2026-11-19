import { type DynamicModule, Module } from "@nestjs/common";
import { AccountsService } from "./accounts/accounts.service";
import { OpsAccountsController } from "./accounts/ops-accounts.controller";
import { PortalAccountsController } from "./accounts/portal-accounts.controller";
import { AuditService } from "./audit/audit.service";
import { DbModule } from "./db/db.module";
import { DevController } from "./dev/dev.controller";
import { HealthController } from "./health/health.controller";
import { AuthController } from "./iam/auth.controller";
import { AuthService } from "./iam/auth.service";
import { CODE_SENDER, DevCodeSender } from "./iam/code-sender";
import { ClientGuard, StaffGuard } from "./iam/guards";

const isProduction = process.env.NODE_ENV === "production";

@Module({})
export class AppModule {
  static register(): DynamicModule {
    return {
      module: AppModule,
      imports: [DbModule],
      controllers: [
        HealthController,
        AuthController,
        OpsAccountsController,
        PortalAccountsController,
        ...(isProduction ? [] : [DevController]),
      ],
      providers: [
        AuditService,
        AuthService,
        AccountsService,
        StaffGuard,
        ClientGuard,
        // Stage 7 replaces this with WhatsApp + email senders. Production refuses to start without them.
        { provide: CODE_SENDER, useClass: DevCodeSender },
      ],
    };
  }
}
