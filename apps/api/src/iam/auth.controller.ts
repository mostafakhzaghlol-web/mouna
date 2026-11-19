import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";
import { parseBody } from "../common/validation";
import { type Audience, AuthService } from "./auth.service";
import { cookieName } from "./guards";

const audienceOf = (value: string): Audience => {
  if (value === "client" || value === "staff") return value;
  throw new BadRequestException({ error: "invalid_audience" });
};

const RequestCodeBody = z.object({ identifier: z.string().min(3).max(200) });
const VerifyBody = z.object({ identifier: z.string().min(3).max(200), code: z.string().regex(/^\s*\d{6}\s*$/) });

@Controller("auth/:audience")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("code")
  @HttpCode(202)
  requestCode(@Param("audience") audience: string, @Body() body: unknown) {
    const { identifier } = parseBody(RequestCodeBody, body);
    return this.auth.requestCode(audienceOf(audience), identifier);
  }

  @Post("verify")
  @HttpCode(200)
  async verify(
    @Param("audience") audienceParam: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const audience = audienceOf(audienceParam);
    const { identifier, code } = parseBody(VerifyBody, body);
    const result = await this.auth.verifyCode(audience, identifier, code, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.cookie(cookieName(audience), result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: result.expiresAt,
    });
    return { user: result.user, expiresAt: result.expiresAt };
  }

  @Get("me")
  async me(@Param("audience") audienceParam: string, @Req() req: Request) {
    const audience = audienceOf(audienceParam);
    const ctx = await this.auth.contextFromToken(audience, req.cookies?.[cookieName(audience)]);
    if (!ctx) throw new UnauthorizedException({ error: "not_signed_in" });
    return {
      user: ctx.user,
      staffRoles: ctx.staffRoles,
      companyId: ctx.companyId,
      roles: ctx.membership?.roles ?? [],
    };
  }

  @Post("sign-out")
  @HttpCode(204)
  async signOut(@Param("audience") audienceParam: string, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const audience = audienceOf(audienceParam);
    const ctx = await this.auth.contextFromToken(audience, req.cookies?.[cookieName(audience)]);
    if (ctx) await this.auth.signOut(ctx.sessionId);
    res.clearCookie(cookieName(audience), { path: "/" });
  }
}
