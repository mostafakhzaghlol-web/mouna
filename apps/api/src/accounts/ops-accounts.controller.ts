import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { parseBody } from "../common/validation";
import type { AuthContext } from "../iam/auth.service";
import { Auth, Roles, StaffGuard } from "../iam/guards";
import {
  AccountsService,
  CreateCompany,
  CreateCostCentre,
  CreateSite,
  InviteMember,
  RecordHeadcount,
  UpdateCompanyStatus,
} from "./accounts.service";

/** Back office: Mouna staff manage client companies. */
@Controller("ops")
@UseGuards(StaffGuard)
@Roles("super_admin", "sales_rep", "sales_manager", "account_manager")
export class OpsAccountsController {
  constructor(private readonly accounts: AccountsService) {}

  @Get("companies")
  list(@Query("q") q?: string) {
    return this.accounts.listCompanies(q);
  }

  @Post("companies")
  create(@Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.createCompany(parseBody(CreateCompany, body), { userId: auth.user.id });
  }

  @Get("companies/:id")
  detail(@Param("id", ParseUUIDPipe) id: string) {
    return this.accounts.companyDetail(id);
  }

  @Patch("companies/:id/status")
  status(@Param("id", ParseUUIDPipe) id: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.updateCompanyStatus(id, parseBody(UpdateCompanyStatus, body).status, { userId: auth.user.id });
  }

  @Post("companies/:id/sites")
  addSite(@Param("id", ParseUUIDPipe) id: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.addSite(id, parseBody(CreateSite, body), { userId: auth.user.id });
  }

  @Post("companies/:id/cost-centres")
  addCostCentre(@Param("id", ParseUUIDPipe) id: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.addCostCentre(id, parseBody(CreateCostCentre, body), { userId: auth.user.id });
  }

  @Post("companies/:id/members")
  invite(@Param("id", ParseUUIDPipe) id: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    return this.accounts.inviteMember(id, parseBody(InviteMember, body), { userId: auth.user.id });
  }

  @Post("sites/:siteId/headcount")
  async headcount(@Param("siteId", ParseUUIDPipe) siteId: string, @Body() body: unknown, @Auth() auth: AuthContext) {
    const companyId = await this.accounts.siteCompanyId(siteId);
    return this.accounts.recordHeadcount(companyId, siteId, parseBody(RecordHeadcount, body), { userId: auth.user.id }, "survey");
  }
}
