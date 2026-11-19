/** Normalise a Saudi mobile number to E.164 (+9665XXXXXXXX). Returns null if it is not one. */
export function normaliseSaudiMobile(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+/, "").replace(/^00/, "");
  let local: string;
  if (/^9665\d{8}$/.test(digits)) local = digits.slice(3);
  else if (/^05\d{8}$/.test(digits)) local = digits.slice(1);
  else if (/^5\d{8}$/.test(digits)) local = digits;
  else return null;
  return `+966${local}`;
}

export function normaliseEmail(input: string): string | null {
  const email = input.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export type Destination = { channel: "whatsapp" | "email"; value: string };

/** A sign-in identifier is a Saudi mobile (code by WhatsApp) or an email (code by email). */
export function parseIdentifier(input: string): Destination | null {
  if (input.includes("@")) {
    const email = normaliseEmail(input);
    return email ? { channel: "email", value: email } : null;
  }
  const phone = normaliseSaudiMobile(input);
  return phone ? { channel: "whatsapp", value: phone } : null;
}
