import { AppShell } from "@mouna/ui";
import { SignInForm } from "@mouna/ui/sign-in";
import type { Locale } from "@mouna/i18n";
import { strings } from "../_lib/strings";

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  // Only same-app paths are allowed as the return address.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : `/${locale}`;
  return (
    <AppShell locale={locale} appName={strings[locale].appName} path="/sign-in">
      <SignInForm audience="staff" locale={locale} next={target} />
    </AppShell>
  );
}
