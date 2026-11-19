import type { ReactNode } from "react";
import { brandName } from "@mouna/brand";
import type { Locale } from "@mouna/i18n";

/** Wordmark: placeholder until the final logo files exist. The saffron dot stands in for the drop. */
export function Wordmark({ locale }: { locale: Locale }) {
  return (
    <span className="inline-flex items-baseline gap-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-[var(--color-pine)]">
      {brandName[locale]}
      <span aria-hidden className="inline-block size-2 rounded-full bg-[var(--color-saffron)]" />
    </span>
  );
}

export function LanguageSwitch({ locale, path = "" }: { locale: Locale; path?: string }) {
  const other: Locale = locale === "ar" ? "en" : "ar";
  return (
    <a
      href={`/${other}${path}`}
      hrefLang={other}
      className="rounded-[var(--radius)] border border-[var(--color-mist)] px-3 py-1 text-sm hover:bg-white"
    >
      {other === "ar" ? "العربية" : "English"}
    </a>
  );
}

export function AppShell({ locale, appName, children }: { locale: Locale; appName: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b border-[var(--color-mist)] bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Wordmark locale={locale} />
          <span className="text-sm text-[var(--color-ink-muted)]">{appName}</span>
        </div>
        <LanguageSwitch locale={locale} />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function Button({ children, variant = "primary", ...rest }: { children: ReactNode; variant?: "primary" | "secondary" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles =
    variant === "primary"
      ? "bg-[var(--color-pine)] text-white hover:bg-[var(--color-pine-dark)]"
      : "border border-[var(--color-mist)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-paper)]";
  return (
    <button className={`rounded-[var(--radius)] px-4 py-2 font-medium ${styles}`} {...rest}>
      {children}
    </button>
  );
}
