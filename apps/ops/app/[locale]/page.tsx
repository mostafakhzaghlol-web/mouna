import type { Locale } from "@mouna/i18n";
import { OpsShell } from "./_lib/shell";
import { CompanyList } from "./_components/company-list";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <OpsShell locale={locale} path="">
      <CompanyList locale={locale} />
    </OpsShell>
  );
}
