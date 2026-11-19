"use client";

import { useState } from "react";
import { api, ApiError, Button, Card, ErrorNote, Field, fieldErrors, Input, Select } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";
import { localFieldErrors, SIZE_BANDS, strings } from "../_lib/strings";

export function NewCompanyForm({ locale }: { locale: Locale }) {
  const s = strings[locale];
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    sizeBand: "100-249",
    crNumber: "",
    vatNumber: "",
    legalNameAr: "",
    legalNameEn: "",
    paymentTermsDays: "45",
    invoiceEmail: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    try {
      const company = await api<{ id: string }>("/ops/companies", {
        body: {
          nameAr: form.nameAr,
          nameEn: form.nameEn,
          sizeBand: form.sizeBand,
          legalEntity: {
            crNumber: form.crNumber.trim(),
            vatNumber: form.vatNumber.trim() || undefined,
            // Legal names default to the company names when left empty.
            legalNameAr: form.legalNameAr || form.nameAr,
            legalNameEn: form.legalNameEn || form.nameEn,
          },
          billing: {
            paymentTermsDays: Number(form.paymentTermsDays),
            invoiceEmails: form.invoiceEmail ? [form.invoiceEmail.trim()] : [],
            poRequired: false,
          },
        },
      });
      window.location.assign(`/${locale}/companies/${company.id}`);
    } catch (err) {
      setErrors(
        localFieldErrors(fieldErrors(err), s, { "legalEntity.crNumber": s.crHint, "legalEntity.vatNumber": s.vatHint }),
      );
      const key = err instanceof ApiError ? (err.body.error ?? "") : "";
      setError(key === "validation_failed" ? null : (s.errors[key] ?? s.errors.generic!));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{s.newCompany}</h1>
        <a href={`/${locale}`} className="text-sm text-[var(--color-pine)] underline">
          {s.back}
        </a>
      </div>
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={s.companyNameAr} error={errors.nameAr}>
            <Input dir="rtl" required value={form.nameAr} onChange={set("nameAr")} />
          </Field>
          <Field label={s.companyNameEn} error={errors.nameEn}>
            <Input dir="ltr" required value={form.nameEn} onChange={set("nameEn")} />
          </Field>
          <Field label={s.sizeBand}>
            <Select value={form.sizeBand} onChange={set("sizeBand")}>
              {SIZE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>
      <Card title={s.legalEntity}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={s.crNumber} hint={s.crHint} error={errors["legalEntity.crNumber"]}>
            <Input dir="ltr" required inputMode="numeric" value={form.crNumber} onChange={set("crNumber")} />
          </Field>
          <Field label={s.vatNumber} hint={s.vatHint} error={errors["legalEntity.vatNumber"]}>
            <Input dir="ltr" inputMode="numeric" value={form.vatNumber} onChange={set("vatNumber")} />
          </Field>
          <Field label={s.legalNameAr} error={errors["legalEntity.legalNameAr"]}>
            <Input dir="rtl" value={form.legalNameAr} onChange={set("legalNameAr")} placeholder={form.nameAr} />
          </Field>
          <Field label={s.legalNameEn} error={errors["legalEntity.legalNameEn"]}>
            <Input dir="ltr" value={form.legalNameEn} onChange={set("legalNameEn")} placeholder={form.nameEn} />
          </Field>
        </div>
      </Card>
      <Card title={s.billing}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={s.paymentTerms} error={errors["billing.paymentTermsDays"]}>
            <Input dir="ltr" type="number" min={0} max={120} value={form.paymentTermsDays} onChange={set("paymentTermsDays")} />
          </Field>
          <Field label={s.invoiceEmail} error={errors["billing.invoiceEmails.0"]}>
            <Input dir="ltr" type="email" value={form.invoiceEmail} onChange={set("invoiceEmail")} />
          </Field>
        </div>
      </Card>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <Button type="submit" disabled={busy}>
        {s.save}
      </Button>
    </form>
  );
}
