export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Arabic is the default: the platform is Arabic first, English equal. */
export const defaultLocale: Locale = "ar";

export function isLocale(value: string | undefined): value is Locale {
  return value === "ar" || value === "en";
}

export function direction(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Text stored in both languages, as every client-facing field must be. */
export type Bilingual = { ar: string; en: string };

export function pick(text: Bilingual, locale: Locale): string {
  return text[locale] || text.en || text.ar;
}

const sarFormatters = new Map<Locale, Intl.NumberFormat>();

/** Format an amount in SAR. Amounts are passed in halalas (integer) to avoid float errors. */
export function formatSar(halalas: number, locale: Locale): string {
  let f = sarFormatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 2,
    });
    sarFormatters.set(locale, f);
  }
  return f.format(halalas / 100);
}
