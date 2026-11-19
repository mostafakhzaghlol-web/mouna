import type { Locale } from "@mouna/i18n";
import { PortalHome } from "./_components/portal-home";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <PortalHome locale={locale} />;
}
