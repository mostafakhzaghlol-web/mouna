import { AppShell } from "@mouna/ui";
import { SignInForm } from "@mouna/ui/sign-in";
import type { Locale } from "@mouna/i18n";

const appName = { ar: "بوابة العملاء", en: "Client portal" };

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : `/${locale}`;
  return (
    <AppShell locale={locale} appName={appName[locale]} path="/sign-in">
      <SignInForm audience="client" locale={locale} next={target} />
    </AppShell>
  );
}
