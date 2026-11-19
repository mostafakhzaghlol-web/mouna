"use client";

import { useEffect, useState } from "react";
import { api, ApiError, AppShell, Badge, Card } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";

type Site = { id: string; nameAr: string; nameEn: string; district: string | null; receivingHours: string | null; headcount: number | null };
type Home = {
  company: { nameAr: string; nameEn: string };
  sites: Site[];
  costCentres: { id: string; code: string; nameAr: string; nameEn: string }[];
  me: { fullName: string; roles: string[] };
};

const t = {
  ar: {
    appName: "بوابة العملاء",
    hello: "مرحباً",
    signOut: "خروج",
    loading: "جارٍ التحميل…",
    yourSites: "مواقعك",
    employees: "موظف",
    receiving: "الاستلام",
    nothingToDo: "كل شيء جاهز. لا توجد طلبات بانتظارك.",
    comingNext: "الطلبات والتوصيل والفواتير تأتي في المراحل القادمة.",
    costCentres: "مراكز التكلفة",
    roles: {
      company_admin: "مدير الحساب",
      approver: "معتمد",
      requester: "طالب",
      receiver: "مستلم",
      finance: "المالية",
      viewer: "مشاهد",
    } as Record<string, string>,
  },
  en: {
    appName: "Client portal",
    hello: "Hello",
    signOut: "Sign out",
    loading: "Loading…",
    yourSites: "Your sites",
    employees: "employees",
    receiving: "Receiving",
    nothingToDo: "All set. Nothing is waiting for you.",
    comingNext: "Ordering, deliveries and invoices arrive in the next stages.",
    costCentres: "Cost centres",
    roles: {
      company_admin: "Company admin",
      approver: "Approver",
      requester: "Requester",
      receiver: "Receiver",
      finance: "Finance",
      viewer: "Viewer",
    } as Record<string, string>,
  },
};

export function PortalHome({ locale }: { locale: Locale }) {
  const s = t[locale];
  const [data, setData] = useState<Home | null>(null);

  useEffect(() => {
    api<Home>("/portal/company").then(setData, (err) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        window.location.replace(`/${locale}/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }, [locale]);

  async function signOut() {
    await api("/auth/client/sign-out", { method: "POST" }).catch(() => undefined);
    window.location.assign(`/${locale}/sign-in`);
  }

  const name = (x: { nameAr: string; nameEn: string }) => (locale === "ar" ? x.nameAr : x.nameEn);

  return (
    <AppShell
      locale={locale}
      appName={data ? name(data.company) : s.appName}
      nav={
        data ? (
          <button className="text-sm text-[var(--color-pine)] underline" onClick={signOut}>
            {s.signOut}
          </button>
        ) : null
      }
    >
      {!data ? (
        <p className="text-[var(--color-ink-muted)]">{s.loading}</p>
      ) : (
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold">
              {s.hello} {data.me.fullName}
            </h1>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.me.roles.map((r) => (
                <Badge key={r}>{s.roles[r] ?? r}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius)] border border-[var(--color-pine)]/30 bg-[var(--color-pine)]/5 p-4">
            <p className="font-medium text-[var(--color-pine)]">{s.nothingToDo}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{s.comingNext}</p>
          </div>

          <section>
            <h2 className="mb-3 text-lg font-bold">{s.yourSites}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.sites.map((site) => (
                <Card key={site.id}>
                  <p className="font-bold">{name(site)}</p>
                  {site.district ? <p className="text-sm text-[var(--color-ink-muted)]">{site.district}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {site.headcount ? (
                      <Badge tone="good">
                        {site.headcount} {s.employees}
                      </Badge>
                    ) : null}
                    {site.receivingHours ? (
                      <Badge>
                        {s.receiving}: {site.receivingHours}
                      </Badge>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {data.costCentres.length ? (
            <section>
              <h2 className="mb-2 text-lg font-bold">{s.costCentres}</h2>
              <div className="flex flex-wrap gap-2">
                {data.costCentres.map((c) => (
                  <Badge key={c.id}>{name(c)}</Badge>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
