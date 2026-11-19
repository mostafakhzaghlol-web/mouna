import { BadRequestException } from "@nestjs/common";
import type { z } from "zod";

/** Parse a request body with a zod schema; answer 400 with field errors if it does not fit. */
export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException({
      error: "validation_failed",
      issues: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return result.data;
}
