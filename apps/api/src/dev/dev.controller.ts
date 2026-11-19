import { Controller, Get, Inject, NotFoundException, Query } from "@nestjs/common";
import { CODE_SENDER, DevCodeSender } from "../iam/code-sender";
import { parseIdentifier } from "../iam/identifiers";

/** Development only (not registered in production): read the last sign-in code sent to a destination. */
@Controller("dev")
export class DevController {
  constructor(@Inject(CODE_SENDER) private readonly sender: DevCodeSender) {}

  @Get("last-code")
  lastCode(@Query("identifier") identifier = "") {
    const dest = parseIdentifier(identifier);
    const code = dest ? this.sender.latest.get(dest.value) : undefined;
    if (!code) throw new NotFoundException({ error: "no_code" });
    return { code };
  }
}
