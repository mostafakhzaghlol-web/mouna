import type { Locale } from "@mouna/i18n";
import { OpsShell } from "../../_lib/shell";
import { NewCompanyForm } from "../../_components/new-company-form";

export default async function NewCompanyPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <OpsShell locale={locale} path="/companies/new">
      <NewCompanyForm locale={locale} />
    </OpsShell>
  );
}
