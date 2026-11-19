import { AppShell } from "@mouna/ui";
import { tagline } from "@mouna/brand";
import type { Locale } from "@mouna/i18n";

const appName = { en: "Back office", ar: "لوحة العمليات" };

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <AppShell locale={locale} appName={appName[locale]}>
      <h1 className="text-3xl font-bold">{appName[locale]}</h1>
      <p className="mt-2 text-[var(--color-ink-muted)]">{tagline[locale]}</p>
      <p className="mt-6 rounded-[var(--radius)] border border-[var(--color-mist)] bg-white p-4 text-sm">
        {locale === "ar" ? "المرحلة الأولى: الهيكل الأساسي يعمل." : "Stage 1: the skeleton is running."}
      </p>
    </AppShell>
  );
}
