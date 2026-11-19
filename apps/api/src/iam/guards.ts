import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { type Audience, type AuthContext, AuthService } from "./auth.service";

export const cookieName = (audience: Audience) => `mouna_${audience}`;

type AuthedRequest = Request & { auth?: AuthContext };

const ROLES_KEY = "mouna:roles";
/** Allow only these roles (staff roles on staff routes, client roles on portal routes). Empty = any signed-in user. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/** Super admins pass every staff role check. */
const STAFF_SUPERUSER = "super_admin";

/** @Injectable here too, so TypeScript emits the constructor's dependency metadata for subclasses. */
@Injectable()
abstract class SessionGuard implements CanActivate {
  protected abstract readonly audience: Audience;
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token = (req.cookies as Record<string, string> | undefined)?.[cookieName(this.audience)];
    const auth = await this.auth.contextFromToken(this.audience, token);
    if (!auth) throw new UnauthorizedException({ error: "not_signed_in" });
    if (this.audience === "client" && !auth.membership) throw new ForbiddenException({ error: "no_company" });

    const required = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (required?.length) {
      const held = this.audience === "staff" ? auth.staffRoles : auth.membership!.roles;
      const ok = held.some((r) => required.includes(r) || (this.audience === "staff" && r === STAFF_SUPERUSER));
      if (!ok) throw new ForbiddenException({ error: "missing_role", required });
    }
    req.auth = auth;
    return true;
  }
}

@Injectable()
export class StaffGuard extends SessionGuard {
  protected readonly audience = "staff" as const;
}

@Injectable()
export class ClientGuard extends SessionGuard {
  protected readonly audience = "client" as const;
}

export const Auth = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthContext => {
  const auth = ctx.switchToHttp().getRequest<AuthedRequest>().auth;
  if (!auth) throw new UnauthorizedException({ error: "not_signed_in" });
  return auth;
});
