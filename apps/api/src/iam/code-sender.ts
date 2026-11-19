import { Injectable, Logger } from "@nestjs/common";
import type { Destination } from "./identifiers";

export const CODE_SENDER = Symbol("CODE_SENDER");

export interface CodeSender {
  send(to: Destination, code: string, locale: "ar" | "en"): Promise<void>;
}

/**
 * Development sender: writes the code to the API log and keeps the latest code per destination
 * so the dev-only endpoint and tests can read it. Replaced by WhatsApp and email senders in Stage 7.
 */
@Injectable()
export class DevCodeSender implements CodeSender {
  private readonly logger = new Logger("DevCodeSender");
  readonly latest = new Map<string, string>();

  async send(to: Destination, code: string): Promise<void> {
    this.latest.set(to.value, code);
    this.logger.log(`Sign-in code for ${to.value} via ${to.channel}: ${code}`);
  }
}
