import type { Locale } from "@mouna/i18n";
import { OpsShell } from "../../_lib/shell";
import { CompanyDetail } from "../../_components/company-detail";

export default async function CompanyPage({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  return (
    <OpsShell locale={locale} path={`/companies/${id}`}>
      <CompanyDetail locale={locale} id={id} />
    </OpsShell>
  );
}
