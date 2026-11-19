import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { parseBody } from "../common/validation";
import type { AuthContext } from "../iam/auth.service";
import { Auth, ClientGuard, Roles } from "../iam/guards";
import { AccountsService, CreateCostCentre, CreateSite, InviteMember, RecordHeadcount } from "./accounts.service";

/** Client portal: a signed-in client works inside its own company only. */
@Controller("portal")
@UseGuards(ClientGuard)
export class PortalAccountsController {
  constructor(private readonly accounts: AccountsService) {}

  /** The company and the sites this user may see. */
  @Get("company")
  async company(@Auth() auth: AuthContext) {
    const m = auth.membership!;
    const detail = await this.accounts.companyDetail(auth.companyId!);
    const visible = m.allSites ? detail.sites : detail.sites.filter((s) => m.siteIds.includes(s.id));
    return {
      company: { id: detail.company.id, nameAr: detail.company.nameAr, nameEn: detail.company.nameEn, status: detail.company.status },
      sites: visible,
      costCentres: detail.costCentres,
      me: { ...auth.user, roles: m.roles, allSites: m.allSites },
    };
  }

  @Get("members")
  @Roles("company_admin")
  members(@Auth() auth: AuthContext) {
    return this.accounts.membersOf(auth.companyId!);
  }

  @Post("members")
  @Roles("company_admin")
  invite(@Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.inviteMember(auth.companyId!, parseBody(InviteMember, body), { userId: auth.user.id });
  }

  @Post("sites")
  @Roles("company_admin")
  addSite(@Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.addSite(auth.companyId!, parseBody(CreateSite, body), { userId: auth.user.id });
  }

  @Post("sites/:siteId/headcount")
  @Roles("company_admin")
  headcount(@Param("siteId", ParseUUIDPipe) siteId: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.recordHeadcount(auth.companyId!, siteId, parseBody(RecordHeadcount, body), { userId: auth.user.id }, "client");
  }

  @Post("cost-centres")
  @Roles("company_admin")
  addCostCentre(@Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.addCostCentre(auth.companyId!, parseBody(CreateCostCentre, body), { userId: auth.user.id });
  }
}
