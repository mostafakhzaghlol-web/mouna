"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, Badge, Button, Card, ErrorNote, Field, fieldErrors, Input, Select } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";
import { CLIENT_ROLES, localFieldErrors, strings, ZONES } from "../_lib/strings";

type Site = {
  id: string;
  nameAr: string;
  nameEn: string;
  district: string | null;
  zone: string | null;
  nationalAddressCode: string | null;
  receivingHours: string | null;
  headcount: number | null;
};
type Member = { id: string; fullName: string; phone: string | null; email: string | null; roles: string[]; allSites: boolean; status: string };
type Detail = {
  company: { id: string; nameAr: string; nameEn: string; status: string; sizeBand: string | null };
  legalEntities: { id: string; crNumber: string; vatNumber: string | null; legalNameAr: string; legalNameEn: string }[];
  billingAccounts: { id: string; paymentTermsDays: number; invoiceEmails: string[] }[];
  sites: Site[];
  costCentres: { id: string; code: string; nameAr: string; nameEn: string }[];
  members: Member[];
};

export function CompanyDetail({ locale, id }: { locale: Locale; id: string }) {
  const s = strings[locale];
  const [data, setData] = useState<Detail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const load = useCallback(
    () => api<Detail>(`/ops/companies/${id}`).then(setData, () => setNotFound(true)),
    [id],
  );
  useEffect(() => {
    void load();
  }, [load]);

  if (notFound) return <ErrorNote>{s.errors.generic}</ErrorNote>;
  if (!data) return <p className="text-[var(--color-ink-muted)]">{s.loading}</p>;

  const name = (x: { nameAr: string; nameEn: string }) => (locale === "ar" ? x.nameAr : x.nameEn);
  const le = data.legalEntities[0];
  const ba = data.billingAccounts[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <a href={`/${locale}`} className="text-sm text-[var(--color-pine)] underline">
            {s.companies}
          </a>
          <h1 className="mt-1 text-2xl font-bold">{name(data.company)}</h1>
        </div>
        <Badge tone={data.company.status === "active" ? "good" : "neutral"}>{s.statuses[data.company.status]}</Badge>
      </div>

      <Card title={s.legalEntity}>
        {le ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-ink-muted)]">{s.crNumber}</dt>
              <dd dir="ltr" className="text-start">{le.crNumber}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-ink-muted)]">{s.vatNumber}</dt>
              <dd dir="ltr" className="text-start">{le.vatNumber ?? "–"}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-ink-muted)]">{locale === "ar" ? s.legalNameAr : s.legalNameEn}</dt>
              <dd>{locale === "ar" ? le.legalNameAr : le.legalNameEn}</dd>
            </div>
            {ba ? (
              <div>
                <dt className="text-[var(--color-ink-muted)]">{s.paymentTerms}</dt>
                <dd>{ba.paymentTermsDays}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Card>

      <Card title={`${s.sites} (${data.sites.length})`}>
        <ul className="divide-y divide-[var(--color-mist)]">
          {data.sites.map((site) => (
            <li key={site.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-medium">{name(site)}</p>
                <p className="text-[var(--color-ink-muted)]">
                  {[site.district, site.zone ? s.zones[site.zone] : null, site.receivingHours].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="text-[var(--color-ink-muted)]">
                {s.headcount}: {site.headcount ?? "–"}
              </span>
            </li>
          ))}
        </ul>
        <AddSiteForm locale={locale} companyId={id} onDone={load} />
      </Card>

      <Card title={`${s.people} (${data.members.length})`}>
        <ul className="divide-y divide-[var(--color-mist)]">
          {data.members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <div>
                <p className="font-medium">{m.fullName}</p>
                <p dir="ltr" className="text-start text-[var(--color-ink-muted)]">
                  {m.phone ?? m.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {m.roles.map((r) => (
                  <Badge key={r}>{s.roleNames[r] ?? r}</Badge>
                ))}
                <Badge tone={m.status === "active" ? "good" : "attention"}>{s.memberStatuses[m.status]}</Badge>
              </div>
            </li>
          ))}
        </ul>
        <InviteForm locale={locale} companyId={id} onDone={load} />
      </Card>

      <Card title={`${s.costCentres} (${data.costCentres.length})`}>
        <ul className="flex flex-wrap gap-2 text-sm">
          {data.costCentres.map((c) => (
            <li key={c.id}>
              <Badge>
                <span dir="ltr">{c.code}</span> · {name(c)}
              </Badge>
            </li>
          ))}
        </ul>
        <CostCentreForm locale={locale} companyId={id} onDone={load} />
      </Card>
    </div>
  );
}

function useSubmit(locale: Locale, onDone: () => unknown) {
  const s = strings[locale];
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<unknown>, reset: () => void) {
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      await fn();
      reset();
      await onDone();
    } catch (err) {
      setErrors(localFieldErrors(fieldErrors(err), s, { nationalAddressCode: s.shortAddressHint }));
      const key = err instanceof ApiError ? (err.body.error ?? "") : "";
      setError(key === "validation_failed" ? null : (s.errors[key] ?? s.errors.generic!));
    } finally {
      setBusy(false);
    }
  }
  return { errors, error, busy, run };
}

function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="mt-3 rounded-[var(--radius)] border border-dashed border-[var(--color-mist)] p-3">
      <summary className="cursor-pointer text-sm font-medium text-[var(--color-pine)]">{label}</summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function AddSiteForm({ locale, companyId, onDone }: { locale: Locale; companyId: string; onDone: () => unknown }) {
  const s = strings[locale];
  const empty = { nameAr: "", nameEn: "", district: "", zone: "central", nationalAddressCode: "", receivingHours: "", headcount: "" };
  const [f, setF] = useState(empty);
  const { errors, error, busy, run } = useSubmit(locale, onDone);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <Disclosure label={s.addSite}>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () =>
              api(`/ops/companies/${companyId}/sites`, {
                body: {
                  nameAr: f.nameAr,
                  nameEn: f.nameEn,
                  district: f.district || undefined,
                  zone: f.zone,
                  nationalAddressCode: f.nationalAddressCode || undefined,
                  receivingHours: f.receivingHours || undefined,
                  headcount: f.headcount ? Number(f.headcount) : undefined,
                },
              }),
            () => setF(empty),
          );
        }}
      >
        <Field label={s.siteNameAr} error={errors.nameAr}>
          <Input dir="rtl" required value={f.nameAr} onChange={set("nameAr")} />
        </Field>
        <Field label={s.siteNameEn} error={errors.nameEn}>
          <Input dir="ltr" required value={f.nameEn} onChange={set("nameEn")} />
        </Field>
        <Field label={s.district}>
          <Input value={f.district} onChange={set("district")} />
        </Field>
        <Field label={s.zone}>
          <Select value={f.zone} onChange={set("zone")}>
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {s.zones[z]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={s.shortAddress} hint={s.shortAddressHint} error={errors.nationalAddressCode}>
          <Input dir="ltr" value={f.nationalAddressCode} onChange={set("nationalAddressCode")} />
        </Field>
        <Field label={s.receivingHours}>
          <Input value={f.receivingHours} onChange={set("receivingHours")} />
        </Field>
        <Field label={s.headcount} error={errors.headcount}>
          <Input dir="ltr" type="number" min={1} value={f.headcount} onChange={set("headcount")} />
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={busy}>
            {s.save}
          </Button>
        </div>
        {error ? (
          <div className="sm:col-span-2">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </form>
    </Disclosure>
  );
}

function InviteForm({ locale, companyId, onDone }: { locale: Locale; companyId: string; onDone: () => unknown }) {
  const s = strings[locale];
  const empty = { fullName: "", identifier: "", roles: ["company_admin"] as string[], locale: locale as string };
  const [f, setF] = useState(empty);
  const { errors, error, busy, run } = useSubmit(locale, onDone);

  const toggle = (role: string) =>
    setF({ ...f, roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role] });

  return (
    <Disclosure label={s.invite}>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run(
            () => api(`/ops/companies/${companyId}/members`, { body: { ...f, allSites: true } }),
            () => setF(empty),
          );
        }}
      >
        <Field label={s.fullName} error={errors.fullName}>
          <Input required value={f.fullName} onChange={(e) => setF({ ...f, fullName: e.target.value })} />
        </Field>
        <Field label={s.phoneOrEmail} error={errors.identifier}>
          <Input dir="ltr" required placeholder="05XXXXXXXX" value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1 text-sm font-medium">{s.roles}</legend>
          <div className="flex flex-wrap gap-3">
            {CLIENT_ROLES.map((r) => (
              <label key={r} className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={f.roles.includes(r)} onChange={() => toggle(r)} />
                {s.roleNames[r]}
              </label>
            ))}
          </div>
          {errors.roles ? <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.roles}</p> : null}
        </fieldset>
        <div>
          <Button type="submit" disabled={busy || f.roles.length === 0}>
            {s.invite}
          </Button>
        </div>
        {error ? (
          <div className="sm:col-span-2">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </form>
    </Disclosure>
  );
}

function CostCentreForm({ locale, companyId, onDone }: { locale: Locale; companyId: string; onDone: () => unknown }) {
  const s = strings[locale];
  const empty = { code: "", nameAr: "", nameEn: "" };
  const [f, setF] = useState(empty);
  const { errors, error, busy, run } = useSubmit(locale, onDone);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <Disclosure label={s.addCostCentre}>
      <form
        className="grid gap-3 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          void run(() => api(`/ops/companies/${companyId}/cost-centres`, { body: f }), () => setF(empty));
        }}
      >
        <Field label={s.code} error={errors.code}>
          <Input dir="ltr" required value={f.code} onChange={set("code")} />
        </Field>
        <Field label={s.nameInAr} error={errors.nameAr}>
          <Input dir="rtl" required value={f.nameAr} onChange={set("nameAr")} />
        </Field>
        <Field label={s.nameInEn} error={errors.nameEn}>
          <Input dir="ltr" required value={f.nameEn} onChange={set("nameEn")} />
        </Field>
        <div>
          <Button type="submit" disabled={busy}>
            {s.save}
          </Button>
        </div>
        {error ? (
          <div className="sm:col-span-3">
            <ErrorNote>{error}</ErrorNote>
          </div>
        ) : null}
      </form>
    </Disclosure>
  );
}
